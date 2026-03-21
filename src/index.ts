

import { Command } from "commander";

import { APP_DESCRIPTION, APP_NAME } from "@/consts";
import { getVersion } from "@/utils/get-version";
import { renderTitle } from "@/utils/renderTitle";
const program = new Command();

process.on("SIGINT", () => {
  console.log("\nInitialization canceled.");
  process.exit(0);
});

function main() {
  renderTitle();
  program
    .name(APP_NAME)
    .description(APP_DESCRIPTION)
    .version(
      getVersion(),
      "-v, --version",
      "Output the current version",
    );

  program.parse();
}

main();