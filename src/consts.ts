import path from "path";
import { fileURLToPath } from "url";

const APP_NAME = "BTT Stack";
const APP_DESCRIPTION = "A modern fullstack toolkit built with Next.js, authentication, database ORM, and UI primitives for rapid and scalable development.";
const DEFAULT_PROJECT_NAME = "my-btt-app";

const APP_BANNER = ` ____ _____ _____   ____ _____  _    ____ _  __
| __ )_   _|_   _| / ___|_   _|/ \\  / ___| |/ /
|  _ \\ | |   | |   \\___ \\ | | / _ \\| |   | ' / 
| |_) || |   | |    ___) || |/ ___ \\ |___| . \\ 
|____/ |_|   |_|   |____/ |_/_/   \\_\\____|_|\\_\\
`

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");

export { APP_BANNER, APP_DESCRIPTION, APP_NAME, DEFAULT_PROJECT_NAME };

