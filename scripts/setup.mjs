import { spawnSync } from "child_process";
import { existsSync, writeFileSync } from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const port = process.env.MYSQL_PORT || "3307";

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status || 1);
}

if (!existsSync(envPath)) {
  const secret = crypto.randomBytes(48).toString("hex");
  writeFileSync(
    envPath,
    [
      `DATABASE_URL="mysql://ninexn:ninexn_pass@127.0.0.1:${port}/nine_xn_garments"`,
      `APP_URL="http://localhost:3000"`,
      `NODE_ENV="development"`,
      `SESSION_SECRET="${secret}"`,
      `OTP_DISPLAY_MODE="true"`,
      `MYSQL_PORT="${port}"`,
      `RAZORPAY_KEY_ID=""`,
      `RAZORPAY_KEY_SECRET=""`,
      `RAZORPAY_WEBHOOK_SECRET=""`,
      `SEED_DEMO="false"`,
      "",
    ].join("\n"),
    "utf8",
  );
  console.log("Wrote .env");
}

run("node", ["scripts/install-mysql.mjs"]);
run("node", ["scripts/ensure-mysql.mjs"]);
run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "db", "push"]);
run("npx", ["prisma", "db", "seed"]);
console.log("Nine XN Garments MySQL setup is complete.");
