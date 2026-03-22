import fs from "fs-extra";

export async function projectExists(projectDir: string) {
  return fs.existsSync(projectDir);
}
