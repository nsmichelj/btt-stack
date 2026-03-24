import { PKG_ROOT } from "@/consts";
import { LintingOption } from "@/types";
import fs from "fs-extra";
import path from "path";

function resolveSrcPath(projectDir: string, srcDir: boolean) {
  return srcDir ? path.join(projectDir, "src") : projectDir;
}

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
    scripts["lint:check"] = "eslint .";
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

async function updateTsConfig(projectDir: string, srcDir: boolean) {
  if (!srcDir) return;

  const tsconfigPath = path.join(projectDir, "tsconfig.json");
  const tsconfig = await fs.readJson(tsconfigPath);

  tsconfig.compilerOptions = {
    ...tsconfig.compilerOptions,
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*"],
    },
  };

  await fs.writeJson(tsconfigPath, tsconfig, { spaces: 2 });
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

async function addAuth(projectDir: string, database: boolean, srcDir: boolean) {
  const baseDir = resolveSrcPath(projectDir, srcDir);

  const authTemplateDir = path.join(PKG_ROOT, "templates/features/auth");

  if (database) {
    await fs.copy(
      path.join(authTemplateDir, "instance/with-postgres.ts"),
      path.join(baseDir, "lib/auth/index.ts"),
    );
  } else {
    await fs.copy(
      path.join(authTemplateDir, "instance/base.ts"),
      path.join(baseDir, "lib/auth/index.ts"),
    );
  }

  await fs.copy(
    path.join(authTemplateDir, "client.ts"),
    path.join(baseDir, "lib/auth/client.ts"),
  );

  const appTemplateDir = path.join(
    PKG_ROOT,
    "templates/features/app/api/auth/[...all]",
  );
  await fs.copy(appTemplateDir, path.join(baseDir, "app/api/auth/[...all]"));
}

async function addDatabase(
  projectDir: string,
  authentication: boolean,
  srcDir: boolean,
) {
  const baseDir = resolveSrcPath(projectDir, srcDir);

  const dbTemplateDir = path.join(PKG_ROOT, "templates/features/db");

  if (authentication) {
    await fs.copy(
      path.join(dbTemplateDir, "schemas/auth-postgres.ts"),
      path.join(baseDir, "lib/db/schema.ts"),
    );
  } else {
    await fs.copy(
      path.join(dbTemplateDir, "schemas/base-postgres.ts"),
      path.join(baseDir, "lib/db/schema.ts"),
    );
  }

  await fs.copy(
    path.join(dbTemplateDir, "index.ts"),
    path.join(baseDir, "lib/db/index.ts"),
  );

  let content = await fs.readFile(
    path.join(dbTemplateDir, "drizzle.config.ts"),
    "utf-8",
  );

  const schemaPath = srcDir ? "./src/lib/db/schema.ts" : "./lib/db/schema.ts";
  const outPath = srcDir ? "./src/lib/db/migrations" : "./lib/db/migrations";
  content = content
    .replace(/{{SCHEMA_PATH}}/g, schemaPath)
    .replace(/{{OUT_PATH}}/g, outPath);
  await fs.writeFile(path.join(projectDir, "drizzle.config.ts"), content);
}

export async function addLinting(projectDir: string, linting: LintingOption) {
  const linterTemplateDir = path.join(PKG_ROOT, "templates/features/linter");

  if (linting === "biome") {
    await fs.copy(
      path.join(linterTemplateDir, "biome.json"),
      path.join(projectDir, "biome.json"),
    );
  } else if (linting === "eslint") {
    await fs.copy(
      path.join(linterTemplateDir, "eslint.config.mjs"),
      path.join(projectDir, "eslint.config.mjs"),
    );
  }
}

async function addBase(projectDir: string) {
  const templateDir = path.join(PKG_ROOT, "templates/base");
  await fs.copy(templateDir, projectDir);
}

async function addApp(projectDir: string, srcDir: boolean) {
  const baseDir = resolveSrcPath(projectDir, srcDir);
  const appTemplateDir = path.join(PKG_ROOT, "templates/features/app");

  await fs.copy(
    path.join(appTemplateDir, "/pages/base.tsx"),
    path.join(baseDir, "app/page.tsx"),
  );

  await fs.copy(
    path.join(appTemplateDir, "/layouts/base.tsx"),
    path.join(baseDir, "app/layout.tsx"),
  );

  await fs.copy(
    path.join(appTemplateDir, "/styles/base.css"),
    path.join(baseDir, "app/globals.css"),
  );
}

export async function createProject({
  projectRoot,
  projectName,
  pkgManager,
  authentication,
  database,
  linting,
  srcDir,
}: {
  projectRoot: string;
  projectName: string;
  pkgManager: string;
  authentication: boolean;
  database: boolean;
  linting: LintingOption;
  srcDir: boolean;
}) {
  const projectDir = path.join(projectRoot, projectName);

  await addBase(projectDir);
  await addApp(projectDir, srcDir);

  if (authentication) {
    await addAuth(projectDir, database, srcDir);
  }

  if (database) {
    await addDatabase(projectDir, authentication, srcDir);
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
  await updateTsConfig(projectDir, srcDir);
  await updateReadme(projectDir, { projectName, pkgManager });
}
