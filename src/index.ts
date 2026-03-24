import path from "path";

import * as clack from "@clack/prompts";
import { Command } from "commander";
import { execa } from "execa";
import fs from "fs-extra";

import { APP_DESCRIPTION, APP_NAME, DEFAULT_PROJECT_NAME } from "@/consts";
import { createProject } from "@/utils/create-project";
import { getVersion } from "@/utils/get-version";
import { logNextSteps } from "@/utils/log-next-steps";
import { detectPackageManager } from "@/utils/package-manager";
import { renderTitle } from "@/utils/renderTitle";
import { validateProjectName } from "@/utils/validate-project-name";
import chalk from "chalk";
import { LintingOption } from "./types";

const program = new Command();

process.on("SIGINT", () => {
  console.log("\nInitialization canceled.");
  process.exit(0);
});

const defaultOptions = {
  projectName: DEFAULT_PROJECT_NAME,
  projectRoot: process.cwd(),
  authentication: true,
  database: true,
  linting: "biome" as LintingOption,
  overwrite: false,
  skipPrompts: false,
};

async function main() {
  renderTitle();

  program
    .name(APP_NAME)
    .description(APP_DESCRIPTION)
    .version(getVersion(), "-v, --version", "Output the current version")
    .option(
      "-c, --cwd <path>",
      "Current working directory",
      defaultOptions.projectRoot,
    )
    .option("-a, --auth", "Add authentication")
    .option("-d, --db", "Add database")
    .option("-l, --linting", "Add linting")
    .option(
      "-y, --yes",
      "Skip the interactive prompts",
      defaultOptions.skipPrompts,
    )
    .argument("[name]", "Name of the project")
    .action(async (args, options) => {
      const pkgManager = await detectPackageManager();
      const projectRoot = path.resolve(
        options.cwd ?? defaultOptions.projectRoot,
      );
      const providedProjectName = args;

      if (options.yes) {
        await createProject({
          projectRoot,
          pkgManager,
          projectName: providedProjectName ?? defaultOptions.projectName,
          authentication: defaultOptions.authentication,
          database: defaultOptions.database,
          linting: defaultOptions.linting,
        });
        logNextSteps({
          projectName: providedProjectName ?? defaultOptions.projectName,
          pkgManager,
        });
        return;
      }

      clack.intro("Welcome to the Better Tech Toolkit Stack CLI!");
      const project = await clack.group(
        {
          ...(!providedProjectName && {
            name: () =>
              clack.text({
                message: "What will your project be called?",
                defaultValue: defaultOptions.projectName,
                placeholder: defaultOptions.projectName,
                validate: (value) => {
                  return validateProjectName(
                    value ?? defaultOptions.projectName,
                  );
                },
              }),
          }),
          overwrite: async ({ results }) => {
            const projectDir = path.join(
              projectRoot,
              results.name ?? providedProjectName,
            );
            if (fs.existsSync(projectDir)) {
              const confirm = await clack.confirm({
                message: `Project ${chalk.cyan(results.name)} already exists. Do you want to overwrite it?`,
                initialValue: defaultOptions.overwrite,
              });

              if (!confirm) {
                clack.cancel("Project creation canceled.");
                process.exit(1);
              }
            } else {
              return undefined;
            }
          },
          ...(!options.auth && {
            authentication: () =>
              clack.confirm({
                message: "Do you want to add authentication?",
                initialValue: defaultOptions.authentication,
              }),
          }),
          ...(!options.db && {
            database: () =>
              clack.confirm({
                message: "Do you want to add a database?",
                initialValue: defaultOptions.database,
              }),
          }),
          ...(!options.linting && {
            linting: () =>
              clack.select<LintingOption>({
                message: "Select a linting option",
                options: [
                  {
                    label: "Biome",
                    value: "biome",
                    hint: "Fast formatter and linter",
                  },
                  {
                    label: "ESLint",
                    value: "eslint",
                    hint: "Standard linting with flexible rules",
                  },
                  {
                    label: "None",
                    value: "none",
                    hint: "skip linter configuration",
                  },
                ],
                initialValue: defaultOptions.linting,
              }),
          }),
        },
        {
          onCancel() {
            clack.cancel("Initialization canceled.");
            process.exit(1);
          },
        },
      );

      try {
        const projectName = project.name ?? providedProjectName;

        const s = clack.spinner();

        s.start(`Creating project ${chalk.cyan(projectName)}...`);
        await createProject({
          projectRoot,
          pkgManager,
          projectName,
          authentication: project.authentication ?? options.auth,
          database: project.database ?? options.db,
          linting: project.linting ?? options.linting,
        });
        s.stop("Project created successfully!");

        s.start(`Installing dependencies with ${pkgManager}...`);
        const projectDir = path.join(projectRoot, projectName);
        await execa(`${pkgManager} install`, {
          cwd: projectDir,
        });
        s.stop("Dependencies installed successfully!");

        clack.outro(`Project ${chalk.cyan(projectName)} created successfully!`);
        logNextSteps({ projectName, pkgManager });
      } catch (error) {
        clack.outro(`Error creating project: ${error}`);
        process.exit(1);
      }
    });

  program.parse();
}

main();
