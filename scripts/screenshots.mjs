import { chromium } from "playwright";
import { execSync, spawn } from "child_process";
import { existsSync } from "fs";
import path from "path";

const REPOS_DIR = "/Users/jonathanmartin/Desktop/Github Repos";
const OUTPUT_DIR = path.join(REPOS_DIR, "portfolio/public/screenshots");

// Projects to screenshot with their dev commands and ports
const projects = [
  {
    name: "portfolio",
    dir: path.join(REPOS_DIR, "portfolio"),
    port: 3000,
    pages: [
      { path: "/", file: "portfolio-home.png" },
      { path: "/projects", file: "portfolio-projects.png" },
      { path: "/projects/pottery-friends", file: "portfolio-pottery-friends.png" },
      { path: "/projects/swob", file: "portfolio-swob.png" },
      { path: "/projects/1406-adventures", file: "portfolio-1406.png" },
      { path: "/projects/health-dashboard", file: "portfolio-health.png" },
      { path: "/about", file: "portfolio-about.png" },
    ],
    alreadyRunning: true,
  },
  {
    name: "health",
    dir: path.join(REPOS_DIR, "health"),
    port: 3001,
    pages: [{ path: "/", file: "health-home.png" }],
  },
  {
    name: "1406-adventures",
    dir: path.join(REPOS_DIR, "1406-adventures"),
    port: 5173,
    devCommand: "npx vite --port 5173",
    pages: [{ path: "/", file: "1406-home.png" }],
  },
  {
    name: "potteryfriends-web",
    dir: path.join(REPOS_DIR, "potteryfriends-web"),
    port: 3002,
    pages: [{ path: "/", file: "potteryfriends-home.png" }],
  },
  {
    name: "swob-app",
    dir: path.join(REPOS_DIR, "swob-app"),
    port: 3003,
    pages: [{ path: "/", file: "swob-home.png" }],
  },
];

async function waitForServer(port, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://localhost:${port}`);
      if (res.ok || res.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function takeScreenshots(browser, baseUrl, pages) {
  const results = [];
  for (const pg of pages) {
    const url = `${baseUrl}${pg.path}`;
    const outFile = path.join(OUTPUT_DIR, pg.file);
    try {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(1000); // let animations settle
      await page.screenshot({ path: outFile, fullPage: true });
      await page.close();
      console.log(`  ✓ ${pg.file}`);
      results.push({ file: pg.file, success: true });
    } catch (err) {
      console.log(`  ✗ ${pg.file}: ${err.message}`);
      results.push({ file: pg.file, success: false, error: err.message });
    }
  }
  return results;
}

async function main() {
  console.log("Starting screenshot capture...\n");

  const browser = await chromium.launch();
  const childProcesses = [];

  for (const project of projects) {
    console.log(`\n📸 ${project.name}`);

    if (!existsSync(project.dir)) {
      console.log(`  ⏭ Directory not found, skipping`);
      continue;
    }

    // Check if node_modules exist
    if (!existsSync(path.join(project.dir, "node_modules")) && !project.alreadyRunning) {
      console.log(`  ⏭ No node_modules, skipping (run npm install first)`);
      continue;
    }

    let serverProcess = null;

    if (!project.alreadyRunning) {
      // Start dev server
      const cmd = project.devCommand || `npx next dev -p ${project.port}`;
      console.log(`  Starting dev server on port ${project.port}...`);
      serverProcess = spawn("sh", ["-c", cmd], {
        cwd: project.dir,
        stdio: "ignore",
        detached: true,
      });
      childProcesses.push(serverProcess);

      const ready = await waitForServer(project.port);
      if (!ready) {
        console.log(`  ✗ Server failed to start on port ${project.port}`);
        continue;
      }
    }

    const baseUrl = `http://localhost:${project.port}`;
    await takeScreenshots(browser, baseUrl, project.pages);

    // Kill the dev server if we started one
    if (serverProcess) {
      try {
        process.kill(-serverProcess.pid, "SIGTERM");
      } catch {}
    }
  }

  await browser.close();

  // Cleanup any remaining child processes
  for (const proc of childProcesses) {
    try {
      process.kill(-proc.pid, "SIGTERM");
    } catch {}
  }

  console.log("\n✅ Done! Screenshots saved to public/screenshots/");
}

main().catch(console.error);
