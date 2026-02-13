#!/usr/bin/env node

import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { spawnSync } from "node:child_process";
import { createLogger, ensureDir } from "@teehex/shared";

type Choice<T> = {
  label: string;
  value: T;
  available: boolean;
  note?: string;
};

type FrontendSelection = "react" | "vue" | "svelte" | "solid" | "preact";
type OverlaySelection = "none" | "tailwind" | "daisyui" | "bootstrap";
type BackendSelection = "vercel";
type DbSelection =
  | "memory"
  | "sqlite"
  | "postgres"
  | "postgres-supabase"
  | "postgres-neon";

type InstallerOptions = {
  projectName: string;
  frontend: FrontendSelection;
  overlay: OverlaySelection;
  backend: BackendSelection;
  db: DbSelection;
  workersEnabled: boolean;
  gitEnabled: boolean;
};

const logger = createLogger("create-hexagon-ts");
const require = createRequire(import.meta.url);

function printHelp(): void {
  logger.info("create-hexagon-ts - hexagonal TypeScript scaffold generator");
  logger.info("usage: npx create-hexagon-ts <project-name>");
  logger.info("interactive prompts: frontend, UI overlay, backend, DB, workers, git init");
}

function toKebabCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function promptSelect<T>(
  rl: ReturnType<typeof createInterface>,
  label: string,
  choices: readonly Choice<T>[],
  defaultIndex: number
): Promise<T> {
  while (true) {
    logger.info(label);

    choices.forEach((choice, index) => {
      const marker = index === defaultIndex ? "(default)" : "";
      const availability = choice.available ? "" : " [planned]";
      const note = choice.note ? ` - ${choice.note}` : "";
      logger.info(`  ${index + 1}) ${choice.label}${availability} ${marker}${note}`.trim());
    });

    const answer = (await rl.question(`Choose 1-${choices.length}: `)).trim();
    const selectedIndex =
      answer.length === 0 ? defaultIndex : Number.parseInt(answer, 10) - 1;

    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= choices.length) {
      logger.warn("Invalid selection. Try again.");
      continue;
    }

    const selected = choices[selectedIndex]!;
    if (!selected.available) {
      logger.warn("That option is planned but not available yet. Please pick another option.");
      continue;
    }

    return selected.value;
  }
}

async function promptConfirm(
  rl: ReturnType<typeof createInterface>,
  label: string,
  defaultValue: boolean
): Promise<boolean> {
  while (true) {
    const hint = defaultValue ? "Y/n" : "y/N";
    const answer = (await rl.question(`${label} (${hint}): `)).trim().toLowerCase();

    if (answer.length === 0) {
      return defaultValue;
    }

    if (answer === "y" || answer === "yes") {
      return true;
    }

    if (answer === "n" || answer === "no") {
      return false;
    }

    logger.warn("Please answer yes or no.");
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergePlainObjects(
  base: Record<string, unknown>,
  additions: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(additions)) {
    const current = merged[key];

    if (isPlainObject(current) && isPlainObject(value)) {
      merged[key] = mergePlainObjects(current, value);
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

async function mergePackageJson(targetPath: string, additionsPath: string): Promise<void> {
  const current = (await readJson<Record<string, unknown>>(targetPath)) ?? {};
  const additions = (await readJson<Record<string, unknown>>(additionsPath)) ?? {};
  const merged = mergePlainObjects(current, additions);
  await writeJson(targetPath, merged);
}

function isTextFile(filePath: string): boolean {
  return /\.(ts|tsx|js|jsx|json|md|css|scss|sass|less|html|vue|svelte|sql|cjs|mjs|yml|yaml)$/i.test(
    filePath
  );
}

async function copyFileWithOptionalTransform(
  sourcePath: string,
  targetPath: string,
  transform?: (content: string, sourcePath: string) => string
): Promise<void> {
  await ensureDir(dirname(targetPath));

  if (!isTextFile(sourcePath)) {
    const binary = await readFile(sourcePath);
    await writeFile(targetPath, binary);
    return;
  }

  const text = await readFile(sourcePath, "utf8");
  const nextText = transform ? transform(text, sourcePath) : text;
  await writeFile(targetPath, nextText, "utf8");
}

async function copyDirectory(
  sourceDir: string,
  targetDir: string,
  transform?: (content: string, sourcePath: string) => string
): Promise<void> {
  await ensureDir(targetDir);
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry.name);
    const targetPath = join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath, transform);
      continue;
    }

    await copyFileWithOptionalTransform(sourcePath, targetPath, transform);
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function getTemplatesRoot(): string {
  const packageJsonPath = require.resolve("@teehex/templates/package.json");
  return dirname(packageJsonPath);
}

function getFrontendTemplateFolder(frontend: FrontendSelection): string {
  switch (frontend) {
    case "react":
      return "frontend-react";
    case "vue":
      return "frontend-vue";
    case "svelte":
      return "frontend-svelte";
    case "solid":
      return "frontend-solid";
    case "preact":
      return "frontend-preact";
    default:
      return "frontend-react";
  }
}

function toDbProviderLabel(selection: DbSelection): string {
  switch (selection) {
    case "postgres-neon":
      return "postgres-neon";
    case "postgres-supabase":
      return "postgres-supabase";
    case "postgres":
      return "postgres";
    case "sqlite":
      return "sqlite";
    case "memory":
    default:
      return "memory";
  }
}

async function applyOverlay(
  templatesRoot: string,
  targetDir: string,
  overlay: OverlaySelection
): Promise<void> {
  if (overlay === "none") {
    return;
  }

  const overlayRoot = join(templatesRoot, "overlays", overlay, "vite");
  const overlayConfig = await readJson<{
    copy: Array<{ from: string; to: string }>;
    merge: Array<{ from: string; to: string }>;
  }>(join(overlayRoot, "overlay.json"));

  for (const copyItem of overlayConfig.copy) {
    await copyFileWithOptionalTransform(
      join(overlayRoot, copyItem.from),
      join(targetDir, copyItem.to)
    );
  }

  for (const mergeItem of overlayConfig.merge) {
    await mergePackageJson(join(targetDir, mergeItem.to), join(overlayRoot, mergeItem.from));
  }

  const mainCandidates = ["src/main.ts", "src/main.tsx"];
  for (const candidate of mainCandidates) {
    const mainPath = join(targetDir, candidate);
    if (!(await fileExists(mainPath))) {
      continue;
    }

    const content = await readFile(mainPath, "utf8");
    const next = content.includes("./styles.css")
      ? content.replace("./styles.css", "./styles.overlay.css")
      : content;
    await writeFile(mainPath, next, "utf8");
    break;
  }
}

async function copyDbAdapter(
  templatesRoot: string,
  projectDir: string,
  db: DbSelection
): Promise<void> {
  const persistenceDir = join(projectDir, "src", "adapters", "persistence");
  await rm(persistenceDir, { recursive: true, force: true });
  await ensureDir(persistenceDir);

  const adapterFolder =
    db === "sqlite" ? "sqlite" : db === "memory" ? "in-memory" : "postgres";
  const source = join(templatesRoot, "adapters", "db", adapterFolder);

  const replaceImports = (content: string): string =>
    content.replaceAll("../../../base/src/core/", "../../core/");

  const todoSourceFile =
    adapterFolder === "in-memory"
      ? "create-in-memory-todo-repo.ts"
      : adapterFolder === "sqlite"
        ? "create-sqlite-todo-repo.ts"
        : "create-postgres-todo-repo.ts";

  await copyFileWithOptionalTransform(
    join(source, todoSourceFile),
    join(persistenceDir, "todo-repo.ts"),
    replaceImports
  );

  if (await fileExists(join(source, "README.md"))) {
    await copyFileWithOptionalTransform(join(source, "README.md"), join(persistenceDir, "README.md"));
  }

  if (await fileExists(join(source, "init.sql"))) {
    await copyFileWithOptionalTransform(join(source, "init.sql"), join(persistenceDir, "init.sql"));
  }

  if (await fileExists(join(source, "init.ts"))) {
    await copyFileWithOptionalTransform(join(source, "init.ts"), join(persistenceDir, "init.ts"));
  }

  if (await fileExists(join(source, "package.additions.json"))) {
    await mergePackageJson(
      join(projectDir, "package.json"),
      join(source, "package.additions.json")
    );
  }
}

function buildContainerFile(options: InstallerOptions): string {
  const baseImports = [
    "import {",
    "  createTodoUseCase,",
    "  listTodos,",
    "  toggleTodoUseCase,",
    "  type ClockPort,",
    "  type IdPort,",
    "  type LoggerPort,",
    "  type TodoRepo",
    "} from \"../../core\";",
    "import { systemClock } from \"../adapters/system/clock\";",
    "import { cryptoId } from \"../adapters/system/id\";",
    "import { consoleLogger } from \"../adapters/system/logger\";"
  ];

  if (options.db === "memory") {
    baseImports.push("import { createInMemoryTodoRepo } from \"../adapters/persistence/todo-repo\";");
  } else if (options.db === "sqlite") {
    baseImports.push("import { createSqliteTodoRepo } from \"../adapters/persistence/todo-repo\";");
  } else {
    baseImports.push("import { createPostgresTodoRepo } from \"../adapters/persistence/todo-repo\";");
  }

  if (options.workersEnabled) {
    baseImports.push(
      "import { createWorkerAdapter, type WorkerAdapter } from \"../adapters/worker_threads/run-heavy-task\";"
    );
  }

  const workerType = options.workersEnabled ? "\n    worker: WorkerAdapter;" : "";
  const workerAssignment = options.workersEnabled
    ? "\n      worker: createWorkerAdapter()"
    : "";

  let todoRepoFactory = "const todoRepo = createInMemoryTodoRepo();";
  if (options.db === "sqlite") {
    todoRepoFactory =
      "const todoRepo = createSqliteTodoRepo({ dbFilePath: process.env.TODO_SQLITE_PATH ?? \"./data/app.sqlite\" });";
  }

  if (options.db === "postgres" || options.db === "postgres-neon" || options.db === "postgres-supabase") {
    todoRepoFactory = [
      "const databaseUrl = process.env.DATABASE_URL;",
      "",
      "if (databaseUrl === undefined || databaseUrl.length === 0) {",
      "  throw new Error(\"DATABASE_URL is required for postgres provider\");",
      "}",
      "",
      "const todoRepo = createPostgresTodoRepo({",
      "  databaseUrl,",
      "  ssl: process.env.DATABASE_SSL === \"disable\" ? \"disable\" : \"require\",",
      "  maxConnections: Number.parseInt(process.env.DATABASE_MAX_CONNECTIONS ?? \"1\", 10)",
      "});"
    ].join("\n");
  }

  const dbLabel = toDbProviderLabel(options.db);

  return `${baseImports.join("\n")}

type Container = {
  adapters: {
    todoRepo: TodoRepo;
    id: IdPort;
    clock: ClockPort;
    logger: LoggerPort;${workerType}
  };
  usecases: {
    listTodos: typeof listTodos;
    createTodoUseCase: typeof createTodoUseCase;
    toggleTodoUseCase: typeof toggleTodoUseCase;
  };
  meta: {
    db: string;
  };
};

declare global {
  var __teehexContainer: Container | undefined;
}

function buildContainer(): Container {
  ${todoRepoFactory}

  return {
    adapters: {
      todoRepo,
      id: cryptoId,
      clock: systemClock,
      logger: consoleLogger,${workerAssignment}
    },
    usecases: {
      listTodos,
      createTodoUseCase,
      toggleTodoUseCase
    },
    meta: {
      db: "${dbLabel}"
    }
  };
}

export function getContainer(): Container {
  if (globalThis.__teehexContainer === undefined) {
    globalThis.__teehexContainer = buildContainer();
  }

  return globalThis.__teehexContainer;
}
`;
}

function buildRootPackageJson(options: InstallerOptions): Record<string, unknown> {
  return {
    name: options.projectName,
    private: true,
    version: "0.1.0",
    packageManager: "pnpm@9.15.4",
    type: "module",
    workspaces: ["web"],
    scripts: {
      build: "pnpm build:api && pnpm build:web",
      "build:api": "tsc -p tsconfig.json --noEmit",
      "build:web": "pnpm --dir web build",
      dev: "concurrently -k -n api,web -c cyan,magenta \"pnpm dev:api\" \"pnpm dev:web\"",
      "dev:api": "pnpm exec vercel dev --listen 3000",
      "dev:web": "pnpm --dir web dev",
      "dev:vercel": "pnpm exec vercel dev --listen 3000"
    },
    devDependencies: {
      "@types/node": "^22.13.10",
      concurrently: "^9.1.2",
      vercel: "^41.1.4",
      typescript: "^5.8.2"
    }
  };
}

function buildTsConfig(): Record<string, unknown> {
  return {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      noEmit: true,
      types: ["node"],
      skipLibCheck: true
    },
    include: ["src/**/*.ts", "api/**/*.ts"]
  };
}

function buildEnvExample(options: InstallerOptions): string {
  const lines = [
    `TODO_DB_PROVIDER=${toDbProviderLabel(options.db)}`,
    "",
    "# SQLite",
    "TODO_SQLITE_PATH=./data/app.sqlite",
    "",
    "# Postgres / Neon / Supabase",
    "DATABASE_URL=",
    "DATABASE_SSL=require",
    "DATABASE_MAX_CONNECTIONS=1"
  ];

  return `${lines.join("\n")}\n`;
}

function buildVercelConfig(): Record<string, unknown> {
  return {
    framework: null,
    installCommand: "pnpm install",
    buildCommand: "pnpm build:web",
    outputDirectory: "web/dist",
    functions: {
      "api/**/*.ts": {
        runtime: "nodejs20.x"
      }
    },
    rewrites: [
      { source: "/api/(.*)", destination: "/api/$1" },
      { source: "/(.*)", destination: "/index.html" }
    ]
  };
}

function buildGeneratedReadme(options: InstallerOptions): string {
  return `# ${options.projectName}

Generated by create-hexagon-ts.

## Stack

- Frontend: ${options.frontend}
- Backend: ${options.backend}
- UI overlay: ${options.overlay}
- DB adapter: ${toDbProviderLabel(options.db)}
- Worker API: ${options.workersEnabled ? "enabled" : "disabled"}

## Commands

- pnpm install
- pnpm build
- pnpm dev
- pnpm dev:vercel

## Structure

- src/core: framework-agnostic domain, ports, use cases
- src/adapters: system/db/worker adapters
- src/bootstrap: container wiring
- api: Vercel Functions
- web: Vite frontend app

## Local development

- One command dev loop:
  - pnpm dev
  - Runs vercel dev for local functions on port 3000 and Vite frontend dev server.
- Frontend API calls are proxied to http://localhost:3000/api.
- If vercel dev is unavailable in your environment, run frontend only with:
  - pnpm dev:web

## Deploy (Vercel)

- Ensure env vars in .env (local) or Vercel project settings.
- Vercel config is pre-generated in vercel.json for monorepo output.
- Deploy steps:
  1. pnpm install
  2. pnpm build
  3. vercel (or connect repo in Vercel dashboard)

## Environment variables

- TODO_DB_PROVIDER=${toDbProviderLabel(options.db)}
- TODO_SQLITE_PATH=./data/app.sqlite
- DATABASE_URL=
- DATABASE_SSL=require
- DATABASE_MAX_CONNECTIONS=1

## Swapping adapters

- Persistence adapter lives in src/adapters/persistence/todo-repo.ts.
- Change DB provider env vars and replace adapter implementation as needed.
- Core use cases in src/core/usecases stay unchanged because they depend only on TodoRepo port.
`;
}

function buildPnpmWorkspaceYaml(): string {
  return "packages:\n  - \"web\"\n";
}

async function patchViteProxy(webDir: string): Promise<void> {
  const viteConfigPath = join(webDir, "vite.config.ts");
  if (!(await fileExists(viteConfigPath))) {
    return;
  }

  const content = await readFile(viteConfigPath, "utf8");
  if (content.includes("\"/api\": \"http://localhost:3000\"")) {
    return;
  }

  const replaced = content.replace(
    /plugins:\s*\[[\s\S]*?\]\s*\n\}\);/m,
    (match) => `${match.replace(/\n\}\);$/, ",\n  server: {\n    proxy: {\n      \"/api\": \"http://localhost:3000\"\n    }\n  }\n});")}`
  );

  await writeFile(viteConfigPath, replaced, "utf8");
}

async function initializeGitRepository(projectDir: string): Promise<void> {
  const initResult = spawnSync("git", ["init"], {
    cwd: projectDir,
    stdio: "ignore"
  });

  if (initResult.status !== 0) {
    logger.warn("git init failed. Skipping git initialization.");
    return;
  }

  spawnSync("git", ["add", "."], {
    cwd: projectDir,
    stdio: "ignore"
  });

  const commitResult = spawnSync(
    "git",
    ["commit", "-m", "chore: initial scaffold via create-hexagon-ts"],
    {
      cwd: projectDir,
      stdio: "ignore"
    }
  );

  if (commitResult.status !== 0) {
    logger.warn("Initial git commit failed (likely missing git user config). Repository is initialized.");
  }
}

async function selectProjectName(
  rl: ReturnType<typeof createInterface>,
  argv: string[]
): Promise<string> {
  const argName = argv.find((value) => !value.startsWith("-"));

  if (argName !== undefined && argName.trim().length > 0) {
    const normalized = toKebabCase(argName);
    if (normalized.length === 0) {
      throw new Error("Project name is invalid");
    }
    return normalized;
  }

  const prompted = await rl.question("Project name: ");
  const normalized = toKebabCase(prompted);

  if (normalized.length === 0) {
    throw new Error("Project name is required");
  }

  return normalized;
}

async function collectOptions(argv: string[]): Promise<InstallerOptions> {
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const projectName = await selectProjectName(rl, argv);

    const frontend = await promptSelect(
      rl,
      "Select frontend framework",
      [
        { label: "React", value: "react", available: true },
        { label: "Vue", value: "vue", available: true },
        { label: "Svelte", value: "svelte", available: true },
        { label: "Solid", value: "solid", available: true },
        { label: "Preact", value: "preact", available: true },
        { label: "Lit", value: "react", available: false },
        { label: "Qwik", value: "react", available: false },
        { label: "Astro", value: "react", available: false },
        { label: "Angular", value: "react", available: false },
        { label: "Ember", value: "react", available: false }
      ] as const,
      0
    );

    const overlay = await promptSelect(
      rl,
      "Select UI overlay",
      [
        { label: "None", value: "none", available: true },
        { label: "Tailwind", value: "tailwind", available: true },
        { label: "DaisyUI", value: "daisyui", available: true },
        { label: "Bootstrap", value: "bootstrap", available: true },
        { label: "Bulma", value: "none", available: false },
        { label: "UnoCSS", value: "none", available: false },
        {
          label: "shadcn/ui (React only)",
          value: "none",
          available: false,
          note: "planned"
        }
      ] as const,
      0
    );

    const backend = await promptSelect(
      rl,
      "Select backend",
      [
        { label: "Vercel Functions", value: "vercel", available: true },
        { label: "Fastify", value: "vercel", available: false },
        { label: "Express", value: "vercel", available: false }
      ] as const,
      0
    );

    const db = await promptSelect(
      rl,
      "Select database adapter",
      [
        { label: "InMemory", value: "memory", available: true },
        { label: "SQLite", value: "sqlite", available: true },
        { label: "Postgres", value: "postgres", available: true },
        { label: "Supabase (Postgres)", value: "postgres-supabase", available: true },
        { label: "Neon (Postgres)", value: "postgres-neon", available: true },
        { label: "Turso", value: "memory", available: false },
        { label: "MySQL", value: "memory", available: false },
        { label: "Mongo", value: "memory", available: false },
        { label: "Redis", value: "memory", available: false }
      ] as const,
      0
    );

    const workersEnabled = await promptConfirm(rl, "Enable worker routes/adapters?", true);
    const gitEnabled = await promptConfirm(rl, "Initialize git + initial commit?", true);

    return {
      projectName,
      frontend,
      overlay,
      backend,
      db,
      workersEnabled,
      gitEnabled
    };
  } finally {
    rl.close();
  }
}

async function scaffoldProject(options: InstallerOptions): Promise<void> {
  const templatesRoot = getTemplatesRoot();
  const projectDir = resolve(process.cwd(), options.projectName);

  if (await fileExists(projectDir)) {
    const entries = await readdir(projectDir);
    if (entries.length > 0) {
      throw new Error(`Target directory already exists and is not empty: ${projectDir}`);
    }
  }

  await ensureDir(projectDir);

  const backendRoot = join(templatesRoot, "backend-vercel");
  const coreRoot = join(templatesRoot, "base", "src", "core");
  const frontendRoot = join(templatesRoot, getFrontendTemplateFolder(options.frontend));

  await copyDirectory(join(backendRoot, "api"), join(projectDir, "api"));
  await copyDirectory(join(backendRoot, "src"), join(projectDir, "src"));
  await copyDirectory(coreRoot, join(projectDir, "src", "core"));
  await copyDirectory(frontendRoot, join(projectDir, "web"));
  await patchViteProxy(join(projectDir, "web"));

  await writeJson(join(projectDir, "package.json"), buildRootPackageJson(options));
  await writeJson(join(projectDir, "tsconfig.json"), buildTsConfig());
  await writeJson(join(projectDir, "vercel.json"), buildVercelConfig());
  await writeFile(join(projectDir, "pnpm-workspace.yaml"), buildPnpmWorkspaceYaml(), "utf8");
  await writeFile(join(projectDir, ".env.example"), buildEnvExample(options), "utf8");
  await writeFile(join(projectDir, ".gitignore"), "node_modules\n.env\nweb/dist\n", "utf8");
  await writeFile(join(projectDir, "README.md"), buildGeneratedReadme(options), "utf8");

  await applyOverlay(templatesRoot, join(projectDir, "web"), options.overlay);
  await copyDbAdapter(templatesRoot, projectDir, options.db);

  const containerPath = join(projectDir, "src", "bootstrap", "container.ts");
  await writeFile(containerPath, buildContainerFile(options), "utf8");

  if (!options.workersEnabled) {
    await rm(join(projectDir, "api", "heavy.ts"), { force: true });
    await rm(join(projectDir, "src", "adapters", "worker_threads"), {
      recursive: true,
      force: true
    });
  }

  if (options.gitEnabled) {
    await initializeGitRepository(projectDir);
  }
}

export async function run(argv: string[]): Promise<number> {
  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    return 0;
  }

  try {
    const options = await collectOptions(argv);
    await scaffoldProject(options);
    logger.info(`Scaffolded project: ${options.projectName}`);
    logger.info(`Next steps: cd ${options.projectName} && pnpm install && pnpm dev`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(message);
    return 1;
  }
}

void run(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
