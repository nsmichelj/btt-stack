import chalk from "chalk";
import { logger } from "./logger";

export function logNextSteps({
  projectName,
  pkgManager,
}: {
  projectName: string;
  pkgManager: string;
}) {
  logger.success("🎉 Your project is ready!");
  console.log("");
  console.log(`Next steps:`);
  console.log(`  ${chalk.green("cd")} ${projectName}`);
  console.log(`  ${chalk.green(pkgManager)} run dev`);
  console.log("");
  logger.info(`🚀 Start building something better.`);
}
