#!/usr/bin/env node

/**
 * Helper script to restart the frontend development server
 * This is needed because Next.js loads .env files at startup
 */

const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const FRONTEND_DIR = path.join(__dirname, "..");
const ENV_FILE = path.join(FRONTEND_DIR, ".env");

function log(message) {
  // eslint-disable-next-line no-console
  console.log(`[Frontend Restart] ${message}`);
}

function checkEnvFile() {
  return fs.existsSync(ENV_FILE);
}

function killExistingProcess() {
  return new Promise((resolve) => {
    // Try to kill any existing process on port 4000
    exec("lsof -ti:4000 | xargs kill -9", () => {
      // Ignore errors - process might not be running
      resolve();
    });
  });
}

function startDevelopmentServer() {
  return new Promise((resolve, reject) => {
    log("Starting development server...");

    const child = spawn("pnpm", ["run", "dev"], {
      cwd: FRONTEND_DIR,
      stdio: "inherit",
      shell: true,
    });

    child.on("error", reject);

    // Give it a moment to start
    setTimeout(() => {
      log("Development server started");
      resolve();
    }, 2000);
  });
}

async function restart() {
  try {
    log("Checking for .env file...");

    if (!checkEnvFile()) {
      log("No .env file found. Setup might not be complete.");

      return;
    }

    log("Found .env file. Restarting frontend...");

    await killExistingProcess();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait a bit
    await startDevelopmentServer();

    log("Frontend restart complete!");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error restarting frontend:", error);
    process.exit(1);
  }
}

// Check if this is being called from setup completion
const isFromSetup = process.argv.includes("--from-setup");

if (isFromSetup) {
  log("Triggered from setup completion");
}

restart();
