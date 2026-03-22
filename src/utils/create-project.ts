import { PKG_ROOT } from "@/consts";
import fs from "fs-extra";
import path from "path";

async function updatePackageJson(
  projectDir: string,
  { projectName }: { projectName: string },
) {
  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);
  packageJson.name = projectName;
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

async function updateReadme(
  projectDir: string,
  { projectName, pkgManager }: { projectName: string; pkgManager: string },
) {
  const readmePath = path.join(projectDir, "readme.md");
  const readme = await fs.readFile(readmePath, "utf-8");
  const updatedReadme = readme
    .replace(/{{PROJECT_NAME}}/g, projectName)
    .replace(/{{PKG_MANAGER}}/g, pkgManager);
  await fs.writeFile(readmePath, updatedReadme);
}

export async function createProject({
  projectRoot,
  projectName,
  pkgManager,
}: {
  projectRoot: string;
  projectName: string;
  pkgManager: string;
}) {
  const templateDir = path.join(PKG_ROOT, "templates/base");
  const projectDir = path.join(projectRoot, projectName);

  await fs.copy(templateDir, projectDir);
  await updatePackageJson(projectDir, { projectName });
  await updateReadme(projectDir, { projectName, pkgManager });
}
