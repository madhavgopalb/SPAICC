import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import net from "node:net";
import { spawnSync } from "node:child_process";

const appUrl = "http://localhost:3000/login";
const demoEmails = [
  "admin@saicc.local",
  "executive@saicc.local",
  "security@saicc.local",
  "finance@saicc.local",
  "department@saicc.local"
];

function commandFor(command, args) {
  if (process.platform === "win32" && command === "npm") {
    return {
      file: process.env.ComSpec ?? "cmd.exe",
      args: ["/d", "/c", ["npm.cmd", ...args].join(" ")]
    };
  }

  return { file: command, args };
}

function configuredDbPort(env) {
  return env.SAICC_DB_PORT || "5432";
}

function databaseUrlForPort(port) {
  return `postgresql://saicc:saicc_dev_password@localhost:${port}/saicc?schema=public`;
}

function log(message = "") {
  process.stdout.write(`${message}\n`);
}

function run(command, args, options = {}) {
  const resolved = commandFor(command, args);
  const result = spawnSync(resolved.file, resolved.args, {
    stdio: options.stdio ?? "inherit",
    shell: false,
    env: process.env
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
  return result;
}

function capture(command, args) {
  const resolved = commandFor(command, args);
  return spawnSync(resolved.file, resolved.args, {
    encoding: "utf8",
    shell: false,
    env: process.env
  });
}

function readEnv() {
  if (!existsSync(".env")) {
    return {};
  }
  const entries = {};
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) {
      entries[match[1]] = match[2].replace(/^"|"$/g, "");
    }
  }
  return entries;
}

function ensureEnv() {
  const env = readEnv();
  const port = configuredDbPort(env);
  const databaseUrl = databaseUrlForPort(port);
  const secret =
    env.SAICC_SESSION_SECRET && !env.SAICC_SESSION_SECRET.includes("replace-with")
      ? env.SAICC_SESSION_SECRET
      : randomBytes(32).toString("hex");

  const next = [
    `SAICC_DB_PORT="${port}"`,
    `DATABASE_URL="${databaseUrl}"`,
    `SAICC_SESSION_SECRET="${secret}"`
  ].join("\n");

  writeFileSync(".env", `${next}\n`);
  process.env.DATABASE_URL = databaseUrl;
  process.env.SAICC_SESSION_SECRET = secret;
}

function dockerAvailable() {
  const result = capture("docker", ["version"]);
  return result.status === 0;
}

function dockerComposeAvailable() {
  const result = capture("docker", ["compose", "version"]);
  return result.status === 0;
}

function commandVersion(command, args) {
  const result = capture(command, args);
  return result.status === 0 ? result.stdout.trim().split(/\r?\n/)[0] : null;
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(1000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });
}

async function waitForPostgresHealth(timeoutMs = 90000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const result = capture("docker", ["inspect", "-f", "{{.State.Health.Status}}", "saicc-postgres"]);
    if (result.status === 0 && result.stdout.trim() === "healthy") {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  return false;
}

async function checkDatabase() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } finally {
    await prisma.$disconnect();
  }
}

function printDemoDetails() {
  log("");
  log("SAICC local login");
  log(`URL: ${appUrl}`);
  log("Demo emails:");
  for (const email of demoEmails) {
    log(`- ${email}`);
  }
  log("Demo password: SprintPark!2026");
}

async function setup() {
  ensureEnv();
  const env = readEnv();
  const dbPort = Number(configuredDbPort(env));
  log("PASS .env is configured for local SAICC PostgreSQL");

  if (!dockerAvailable()) {
    throw new Error("Docker CLI is not available. Start/install Docker Desktop and ensure the docker command is on PATH.");
  }
  if (!dockerComposeAvailable()) {
    throw new Error("Docker Compose is not available through docker compose.");
  }

  if ((await isPortOpen(dbPort)) && !(await waitForPostgresHealth(1000))) {
    throw new Error(`Port ${dbPort} is already in use and SAICC PostgreSQL is not healthy. Set SAICC_DB_PORT=5433 in .env and update DATABASE_URL to match, then rerun npm run dev:setup.`);
  }

  run("docker", ["compose", "up", "-d"]);
  log("PASS PostgreSQL container start requested");

  if (!(await waitForPostgresHealth())) {
    throw new Error("PostgreSQL container did not become healthy. Run npm run doctor for details.");
  }
  log("PASS PostgreSQL container is healthy");

  run("npm", ["run", "db:generate"]);
  run("npm", ["run", "db:deploy"]);
  run("npm", ["run", "db:seed"]);

  if (!(await checkDatabase())) {
    throw new Error("Prisma could not connect after setup.");
  }
  log("PASS Prisma database connectivity verified");

  printDemoDetails();
  log("");
  log("Next command: npm run dev:start");
}

async function doctor() {
  ensureEnv();
  const env = readEnv();
  const dbPort = Number(configuredDbPort(env));
  const checks = [];
  const add = (status, name, detail = "") => checks.push({ status, name, detail });

  add(commandVersion("node", ["--version"]) ? "PASS" : "FAIL", "Node.js", commandVersion("node", ["--version"]) ?? "not found");
  add(commandVersion("npm", ["--version"]) ? "PASS" : "FAIL", "npm", commandVersion("npm", ["--version"]) ?? "not found");
  add(dockerAvailable() ? "PASS" : "FAIL", "Docker CLI", dockerAvailable() ? "available" : "not found on PATH");
  add(dockerComposeAvailable() ? "PASS" : "FAIL", "Docker Compose", dockerComposeAvailable() ? "available" : "not available");
  add(env.DATABASE_URL ? "PASS" : "FAIL", "DATABASE_URL", env.DATABASE_URL ? "configured" : "missing");
  add(env.SAICC_SESSION_SECRET ? "PASS" : "FAIL", "SAICC_SESSION_SECRET", env.SAICC_SESSION_SECRET ? "configured" : "missing");

  const port5432 = await isPortOpen(dbPort);
  const port3000 = await isPortOpen(3000);
  add(port5432 ? "PASS" : "WARN", `PostgreSQL port ${dbPort}`, port5432 ? "open" : "not listening");
  add(port3000 ? "WARN" : "PASS", "Application port 3000", port3000 ? "already in use" : "available");

  if (dockerAvailable()) {
    const ps = capture("docker", ["compose", "ps"]);
    add(ps.status === 0 ? "PASS" : "WARN", "Compose project", ps.status === 0 ? "inspectable" : "compose ps failed");
    const health = capture("docker", ["inspect", "-f", "{{.State.Health.Status}}", "saicc-postgres"]);
    add(health.status === 0 && health.stdout.trim() === "healthy" ? "PASS" : "WARN", "PostgreSQL container health", health.stdout.trim() || "not healthy");
  }

  try {
    run("npm", ["run", "db:generate"], { stdio: "ignore" });
    add("PASS", "Prisma generation");
  } catch {
    add("FAIL", "Prisma generation");
  }

  let databaseConnected = false;
  try {
    databaseConnected = await checkDatabase();
    add(databaseConnected ? "PASS" : "FAIL", "Database connectivity");
  } catch (error) {
    add("FAIL", "Database connectivity", error instanceof Error ? error.message : "unknown error");
  }

  if (databaseConnected) {
    try {
      run("npm", ["run", "db:deploy"], { stdio: "ignore" });
      add("PASS", "Migration state", "migrations applied");
    } catch {
      add("FAIL", "Migration state", "migration check failed");
    }

    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const count = await prisma.user.count({ where: { email: { in: demoEmails } } });
      await prisma.$disconnect();
      add(count > 0 ? "PASS" : "FAIL", "Demo users", `${count} available`);
    } catch {
      add("FAIL", "Demo users", "could not query users");
    }
  } else {
    add("WARN", "Migration state", "skipped until database is reachable");
    add("WARN", "Demo users", "skipped until database is reachable");
  }

  for (const check of checks) {
    log(`${check.status} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
  }
}

const command = process.argv[2];

try {
  if (command === "setup") {
    await setup();
  } else if (command === "doctor") {
    await doctor();
  } else {
    log("Usage: node scripts/saicc-dev.mjs <setup|doctor>");
    process.exitCode = 1;
  }
} catch (error) {
  log(`FAIL ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exitCode = 1;
}
