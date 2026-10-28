import { input, select, confirm } from "@inquirer/prompts";
import {
  writeFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  readFileSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ProjectConfig {
  name: string;
  description: string;
  author: string;
  license: string;
  repository?: string;
}

async function main(): Promise<void> {
  console.log("🚀 Welcome to Web Extension Creator!\n");

  try {
    // Get project details from user
    const projectName = await input({
      message: "What is your project name?",
      default: "my-web-extension",
      validate: (input: string) => {
        if (!input.trim()) {
          return "Project name cannot be empty";
        }
        if (!/^[a-z0-9-]+$/.test(input)) {
          return "Project name can only contain lowercase letters, numbers, and hyphens";
        }
        return true;
      },
    });

    const description = await input({
      message: "What is your project description?",
      default: "A web extension built with React and TypeScript",
    });

    const author = await input({
      message: "What is your name (author)?",
      default: "Your Name",
    });

    const license = await select({
      message: "Choose a license:",
      choices: [
        { name: "MIT", value: "MIT" },
        { name: "Apache-2.0", value: "Apache-2.0" },
        { name: "GPL-3.0", value: "GPL-3.0" },
        { name: "UNLICENSED", value: "UNLICENSED" },
      ],
      default: "MIT",
    });

    const repository = await input({
      message: "GitHub repository URL (optional):",
      default: "",
    });

    const config: ProjectConfig = {
      name: projectName,
      description,
      author,
      license,
      repository: repository || undefined,
    };

    await createProject(config);
  } catch (error: any) {
    if (error.isTtyError) {
      console.error(
        "❌ Prompt couldn't be rendered in the current environment"
      );
    } else {
      console.error("❌ An error occurred:", error.message);
    }
    process.exit(1);
  }
}

async function createProject(config: ProjectConfig): Promise<void> {
  // Create project directory
  const projectPath = join(process.cwd(), config.name);

  if (existsSync(projectPath)) {
    const overwrite = await confirm({
      message: `Directory "${config.name}" already exists. Do you want to overwrite it?`,
      default: false,
    });

    if (!overwrite) {
      console.log("❌ Project creation cancelled.");
      process.exit(0);
    }
  }

  console.log(`\n📁 Creating project in: ${projectPath}`);
  mkdirSync(projectPath, { recursive: true });

  // Copy template files
  const templatePath = join(__dirname, "..");
  const filesToCopy = [
    "src",
    "e2e-tests",
    "scripts",
    "eslint.config.js",
    "knip.config.ts",
    "playwright.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
    "Dockerfile",
    "docker-compose.yml",
    ".gitignore",
    // nodeLinker: node-modules; Yarn's default PnP mode breaks the build
    ".yarnrc.yml",
  ];

  console.log("📋 Copying template files...");
  for (const file of filesToCopy) {
    const sourcePath = join(templatePath, file);
    const destPath = join(projectPath, file);

    if (existsSync(sourcePath)) {
      cpSync(sourcePath, destPath, { recursive: true });
    }
  }

  // Create custom package.json
  const packageJson = createPackageJson(config, templatePath);

  // Write package.json
  writeFileSync(
    join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2) + "\n"
  );

  // Create README.md
  const readmeContent = createReadme(config);
  writeFileSync(join(projectPath, "README.md"), readmeContent);

  console.log("\n✅ Project created successfully!");
  console.log(`\n📝 Next steps:`);
  console.log(`   cd ${config.name}`);
  console.log(`   yarn install`);
  console.log(`   yarn start`);
  console.log(`\n🎉 Happy coding!`);
}

// Packages only the template itself needs (publishing the CLI, releases)
function isTemplateOnlyDependency(name: string): boolean {
  return name === "@inquirer/prompts" || name.includes("semantic-release");
}

// Scripts only the template itself needs (building the CLI, releases)
const TEMPLATE_ONLY_SCRIPTS = new Set([
  "build:binary",
  "prepublishOnly",
  "semantic-release",
]);

// Read scripts and versions from the template's package.json so generated
// projects always match the template they were copied from
function templateFields(
  templatePath: string
): Record<
  "scripts" | "dependencies" | "devDependencies",
  Record<string, string>
> {
  const template = JSON.parse(
    readFileSync(join(templatePath, "package.json"), "utf8")
  );
  const pick = (
    entries: Record<string, string>,
    isTemplateOnly: (name: string) => boolean
  ) =>
    Object.fromEntries(
      Object.entries(entries).filter(([name]) => !isTemplateOnly(name))
    );

  return {
    scripts: pick(template.scripts, (name) => TEMPLATE_ONLY_SCRIPTS.has(name)),
    dependencies: pick(template.dependencies, isTemplateOnlyDependency),
    devDependencies: pick(template.devDependencies, isTemplateOnlyDependency),
  };
}

function createPackageJson(config: ProjectConfig, templatePath: string): any {
  return {
    name: config.name,
    version: "1.0.0",
    description: config.description,
    license: config.license,
    engines: {
      node: ">=22.13.0",
    },
    ...(config.repository && {
      repository: {
        type: "git",
        url: config.repository,
      },
    }),
    watch: {
      dev: {
        patterns: ["src"],
        extensions: "ts,tsx,html",
      },
    },
    type: "module",
    ...templateFields(templatePath),
    packageManager:
      "yarn@4.9.3+sha512.8295ee814f6b253e16f516416481b481a215ed03ef1ae38524d108084872560a9ed75aeb23b91ab64222062ac4149a594150ae538c2a9536fdbcefd4e49b11cc",
  };
}

function createReadme(config: ProjectConfig): string {
  return `# ${config.name}

${config.description}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   yarn install
   \`\`\`

2. Start development server:
   \`\`\`bash
   yarn start
   \`\`\`

3. Build for production:
   \`\`\`bash
   yarn build
   \`\`\`

## Development

- \`yarn start\` - Start development server with hot reload
- \`yarn build\` - Build for production
- \`yarn lint\` - Run ESLint
- \`yarn test:e2e\` - Run end-to-end tests

## License

${config.license}
`;
}

main();
