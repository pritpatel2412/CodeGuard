import { db } from "../server/db.js";
import { runCrossFileTaintAnalysis } from "../server/taint/taint-orchestrator.js";
import { Octokit } from "@octokit/rest";

async function runEndToEndTest() {
  console.log("Setting up local e2e test environment...");
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    console.log("Starting Cross-File Taint Orchestrator manually...");
    
    await runCrossFileTaintAnalysis({
      octokit,
      owner: "testuser",
      repo: "mock-taint-repo",
      ref: "abcdef1234567890",
      reviewId: "5df627a5-58a8-48a8-8239-881039b2b59a", // dummy review ID
      repositoryId: "db0e5c5c-fdb5-4e60-9c11-699c2e1d64b8", // dummy repo ID
      repoDescription: "End-to-End Local Mock Test"
    });

    console.log("Execution finished successfully.");
    console.log("Check the database for 'semanticGraphs' and 'taintPaths' to verify insertion.");
    process.exit(0);
  } catch (error) {
    console.error("End-to-End test failed:", error);
    process.exit(1);
  }
}

runEndToEndTest();
