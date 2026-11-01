import { spawn, spawnSync } from "child_process";
import { createConnection } from "net";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtime = path.join(root, ".runtime");
const mysqlHome = path.join(runtime, "mysql");
const dataDir = path.join(runtime, "mysql-data");
const mysqld = path.join(mysqlHome, "bin", "mysqld.exe");
const mysqlAdmin = path.join(mysqlHome, "bin", "mysqladmin.exe");
const mysql = path.join(mysqlHome, "bin", "mysql.exe");
const port = Number(process.env.MYSQL_PORT || 3307);
const dbUser = "ninexn";
const dbPass = "ninexn_pass";
const dbName = "nine_xn_garments";

function waitForPort(timeoutMs = 45000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const socket = createConnection({ host: "127.0.0.1", port }, () => {
        socket.end();
        resolve(true);
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) reject(new Error("MySQL did not open port " + port));
        else setTimeout(tryOnce, 500);
      });
    };
    tryOnce();
  });
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { encoding: "utf8", ...opts });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `Failed ${cmd}`).toString());
  }
  return result;
}

function pingOurs() {
  const result = spawnSync(mysqlAdmin, ["-u", "root", `-P${port}`, "-h", "127.0.0.1", "--protocol=TCP", "ping"], {
    encoding: "utf8",
  });
  return result.status === 0;
}

function createSchema() {
  run(mysql, [
    "-u",
    "root",
    `-P${port}`,
    "-h",
    "127.0.0.1",
    "--protocol=TCP",
    "-e",
    `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${dbUser}'@'127.0.0.1' IDENTIFIED BY '${dbPass}';
CREATE USER IF NOT EXISTS '${dbUser}'@'localhost' IDENTIFIED BY '${dbPass}';
GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost';
FLUSH PRIVILEGES;`,
  ]);
}

if (!existsSync(mysqld)) {
  console.error("MySQL is not installed in .runtime/mysql. Run: npm run mysql:install");
  process.exit(1);
}

if (pingOurs()) {
  createSchema();
  console.log("MySQL already listening on 127.0.0.1:" + port);
  process.exit(0);
}

mkdirSync(dataDir, { recursive: true });
const myIni = path.join(runtime, "my.ini");
writeFileSync(
  myIni,
  `[mysqld]
basedir=${mysqlHome.replace(/\\/g, "/")}
datadir=${dataDir.replace(/\\/g, "/")}
port=${port}
bind-address=127.0.0.1
mysqlx=0
`,
);

if (!existsSync(path.join(dataDir, "mysql"))) {
  console.log("Initializing MySQL data directory...");
  run(mysqld, [`--defaults-file=${myIni}`, "--initialize-insecure"]);
}

const child = spawn(mysqld, [`--defaults-file=${myIni}`], {
  detached: true,
  stdio: "ignore",
  cwd: mysqlHome,
});
child.unref();
await waitForPort();
createSchema();
run(mysqlAdmin, ["-u", "root", `-P${port}`, "-h", "127.0.0.1", "--protocol=TCP", "ping"]);
console.log("MySQL is ready on 127.0.0.1:" + port);
