
import packageJson from "../../package.json";

export const getVersion = () => {
  return packageJson.version ?? "1.0.0";
};