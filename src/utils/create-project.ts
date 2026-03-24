import { PKG_ROOT } from "@/consts";
import { LintingOption } from "@/types";
import fs from "fs-extra";
import path from "path";

async function updatePackageJson(
  projectDir: string,
  {
    projectName,
    database,
    authentication,
    linting,
  }: {
    projectName: string;
    database: boolean;
    authentication: boolean;
    linting: LintingOption;
  },
) {
  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);
  packageJson.name = projectName;

  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const scripts: Record<string, string> = {};

  if (authentication) {
    dependencies["better-auth"] = "^1.5.6";
  }

  if (database) {
    dependencies["drizzle-orm"] = "^0.45.1";
    dependencies["pg"] = "^8.20.0";
    devDependencies["drizzle-kit"] = "^0.31.10";
    devDependencies["@types/pg"] = "^8.20.0";
    scripts["db:generate"] = "drizzle-kit generate";
    scripts["db:migrate"] = "drizzle-kit migrate";
    scripts["db:push"] = "drizzle-kit push";
    scripts["db:studio"] = "drizzle-kit studio";
  }

  if (linting === "biome") {
    devDependencies["@biomejs/biome"] = "^2.2.0";
    scripts["lint:check"] = "biome check";
    scripts["lint:fix"] = "biome format --write";
  } else if (linting === "eslint") {
    devDependencies["eslint"] = "^8.57.0";
    devDependencies["eslint-config-next"] = "16.2.1";
    scripts["lint:check"] = "eslint . ";
    scripts["lint:fix"] = "eslint . --fix";
  }

  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...dependencies,
  };
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    ...devDependencies,
  };
  packageJson.scripts = {
    ...packageJson.scripts,
    ...scripts,
  };
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

async function updateReadme(
  projectDir: string,
  {
    projectName,
    pkgManager,
  }: {
    projectName: string;
    pkgManager: string;
  },
) {
  const readmePath = path.join(projectDir, "readme.md");
  const readme = await fs.readFile(readmePath, "utf-8");
  const updatedReadme = readme
    .replace(/{{PROJECT_NAME}}/g, projectName)
    .replace(/{{PKG_MANAGER}}/g, pkgManager);
  await fs.writeFile(readmePath, updatedReadme);
}

async function addAuth(projectDir: string, database: boolean) {
  const authTemplateDir = path.join(PKG_ROOT, "templates/features/auth");
  if (database) {
    const authWithDbTemplateDir = path.join(
      authTemplateDir,
      "instance/with-postgres.ts",
    );
    await fs.copy(
      authWithDbTemplateDir,
      path.join(projectDir, "lib/auth/index.ts"),
    );
  } else {
    const authBaseTemplateDir = path.join(authTemplateDir, "instance/base.ts");
    await fs.copy(
      authBaseTemplateDir,
      path.join(projectDir, "lib/auth/index.ts"),
    );
  }
  const authClientTemplateDir = path.join(authTemplateDir, "client.ts");
  await fs.copy(
    authClientTemplateDir,
    path.join(projectDir, "lib/auth/client.ts"),
  );

  const appTemplateDir = path.join(PKG_ROOT, "templates/features/app");
  const appProjectDir = path.join(projectDir, "app");
  await fs.copy(appTemplateDir, appProjectDir);
}

async function addDatabase(projectDir: string, authentication: boolean) {
  const dbTemplateDir = path.join(PKG_ROOT, "templates/features/db");

  if (authentication) {
    const dbWithAuthTemplateDir = path.join(
      dbTemplateDir,
      "schemas/auth-postgres.ts",
    );
    await fs.copy(
      dbWithAuthTemplateDir,
      path.join(projectDir, "lib/db/schema.ts"),
    );
  } else {
    const dbBaseTemplateDir = path.join(
      dbTemplateDir,
      "schemas/base-postgres.ts",
    );
    await fs.copy(dbBaseTemplateDir, path.join(projectDir, "lib/db/schema.ts"));
  }

  const dbInstanceTemplateDir = path.join(dbTemplateDir, "index.ts");
  await fs.copy(
    dbInstanceTemplateDir,
    path.join(projectDir, "lib/db/index.ts"),
  );

  const dbDrizzleConfigTemplateDir = path.join(
    dbTemplateDir,
    "drizzle.config.ts",
  );
  await fs.copy(
    dbDrizzleConfigTemplateDir,
    path.join(projectDir, "drizzle.config.ts"),
  );
}

export async function addLinting(projectDir: string, linting: LintingOption) {
  if (linting === "biome") {
    const linterTemplateDir = path.join(PKG_ROOT, "templates/features/linter");
    const linterBaseTemplateDir = path.join(linterTemplateDir, "biome.json");
    await fs.copy(linterBaseTemplateDir, path.join(projectDir, "biome.json"));
  } else if (linting === "eslint") {
    const linterTemplateDir = path.join(PKG_ROOT, "templates/features/linter");
    const linterBaseTemplateDir = path.join(
      linterTemplateDir,
      "eslint.config.mjs",
    );
    await fs.copy(
      linterBaseTemplateDir,
      path.join(projectDir, "eslint.config.mjs"),
    );
  }
}

export async function createProject({
  projectRoot,
  projectName,
  pkgManager,
  authentication,
  database,
  linting,
}: {
  projectRoot: string;
  projectName: string;
  pkgManager: string;
  authentication: boolean;
  database: boolean;
  linting: LintingOption;
}) {
  const templateDir = path.join(PKG_ROOT, "templates/base");
  const projectDir = path.join(projectRoot, projectName);

  await fs.copy(templateDir, projectDir);

  if (authentication) {
    await addAuth(projectDir, database);
  }

  if (database) {
    await addDatabase(projectDir, authentication);
  }

  if (linting) {
    await addLinting(projectDir, linting);
  }

  await updatePackageJson(projectDir, {
    projectName,
    database,
    authentication,
    linting,
  });
  await updateReadme(projectDir, { projectName, pkgManager });
}
