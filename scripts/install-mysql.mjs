import { spawnSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync, rmSync, statSync } from "fs";
import https from "https";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtime = path.join(root, ".runtime");
const zipPath = path.join(runtime, "mysql.zip");
const dest = path.join(root, ".runtime", "mysql");
const urls = [
  "https://dev.mysql.com/get/Downloads/MySQL-8.4/mysql-8.4.13-winx64.zip",
  "https://cdn.mysql.com/Downloads/MySQL-8.4/mysql-8.4.13-winx64.zip",
  "https://cdn.mysql.com//Downloads/MySQL-8.4/mysql-8.4.13-winx64.zip",
  "https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.44-winx64.zip",
  "https://cdn.mysql.com/Downloads/MySQL-8.0/mysql-8.0.44-winx64.zip",
  "https://downloads.mysql.com/archives/get/p/23/file/mysql-8.4.7-winx64.zip",
];

mkdirSync(runtime, { recursive: true });

function download(url) {
  return new Promise((resolve, reject) => {
    const request = (current, hops = 0) => {
      if (hops > 12) {
        reject(new Error("Too many redirects"));
        return;
      }
      const client = current.startsWith("http://") ? http : https;
      const req = client.get(
        current,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
            Accept: "*/*",
            Cookie: "oraclelicense=accept-mysql-community-license-agreement; mysql_license=accepted",
          },
        },
        (response) => {
          if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            const next = new URL(response.headers.location, current).toString();
            response.resume();
            request(next, hops + 1);
            return;
          }
          if (response.statusCode !== 200) {
            reject(new Error(`Download failed ${response.statusCode} for ${current}`));
            return;
          }
          const file = createWriteStream(zipPath);
          response.pipe(file);
          file.on("finish", () => file.close(() => resolve(true)));
          file.on("error", reject);
        },
      );
      req.on("error", reject);
    };
    request(url);
  });
}

if (existsSync(path.join(dest, "bin", "mysqld.exe"))) {
  console.log("MySQL already installed in .runtime/mysql");
  process.exit(0);
}

let downloaded = false;
for (const url of urls) {
  try {
    console.log("Downloading", url);
    await download(url);
    const size = existsSync(zipPath) ? statSync(zipPath).size : 0;
    if (size < 20_000_000) {
      console.warn("Download was too small:", size, "bytes");
      continue;
    }
    downloaded = true;
    break;
  } catch (error) {
    console.warn(String(error));
  }
}
if (!downloaded) {
  console.error("Could not download MySQL Community Server zip.");
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
const expand = spawnSync(
  "powershell",
  ["-NoProfile", "-Command", `Expand-Archive -Force '${zipPath}' '${runtime}'`],
  { encoding: "utf8" },
);
if (expand.status !== 0) {
  console.error(expand.stderr || expand.stdout);
  process.exit(1);
}

const listing = spawnSync(
  "powershell",
  [
    "-NoProfile",
    "-Command",
    `Get-ChildItem '${runtime}' -Directory | Where-Object { $_.Name -like 'mysql-*' -or $_.Name -eq 'mysql' } | Select-Object -ExpandProperty FullName`,
  ],
  { encoding: "utf8" },
);
const extracted = (listing.stdout || "").trim().split(/\r?\n/).filter(Boolean)[0];
if (!extracted) {
  console.error("Extracted MySQL folder was not found.");
  process.exit(1);
}
if (extracted !== dest) {
  spawnSync("powershell", ["-NoProfile", "-Command", `if (Test-Path '${dest}') { Remove-Item -Recurse -Force '${dest}' }; Rename-Item -Force '${extracted}' 'mysql'`], {
    encoding: "utf8",
  });
}
if (!existsSync(path.join(dest, "bin", "mysqld.exe"))) {
  console.error("mysqld.exe was not found after extraction.");
  process.exit(1);
}
console.log("MySQL files are ready in .runtime/mysql");
process.exit(0);
