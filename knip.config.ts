import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/**/*.{ts,tsx}", "scripts/**/*.{ts,tsx}"],
  project: ["src/**/*.{ts,tsx}", "scripts/**/*.{ts,tsx}"],
  playwright: true,
  // dotenv-cli is a devDependency; needed so `knip --production` passes
  ignoreBinaries: ["dotenv"],
  typescript: true,
  rules: {
    binaries: "error",
    dependencies: "off",
    devDependencies: "off",
    duplicates: "error",
    enumMembers: "error",
    exports: "error",
    files: "error",
    nsExports: "error",
    nsTypes: "error",
    types: "error",
    unlisted: "error",
    unresolved: "error",
  },
};

export default config;
