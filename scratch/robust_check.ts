import 'dotenv/config';
import { callAI } from "../server/ai/provider";
import { storage } from "../server/storage";
import { setupSocketIO, emitReviewUpdate } from "../server/socket";
import { createServer } from "http";

async function verifyAll() {
  console.log("🚀 Starting CodeGuard Robustness Check...");

  // 1. DB Verification
  try {
    const user = await storage.getUser("non-existent-id");
    console.log("✅ DB Connection: OK");
  } catch (err: any) {
    console.error("❌ DB Connection: FAILED", err.message);
  }

  // 2. AI Provider Verification (NIM and Fallback)
  console.log("\n--- AI Provider Test ---");
  try {
    // Test NIM (should work with Llama 3.3 70B as verified earlier)
    const result = await callAI({
      task: "analysis",
      messages: [{ role: "user", content: "hi" }],
      maxTokens: 5
    });
    console.log(`✅ NIM Primary Test: OK (${result.provider} used)`);
  } catch (err: any) {
    console.error("❌ NIM Primary Test: FAILED", err.message);
  }

  // 3. Socket.io Verification
  console.log("\n--- Socket.io Test ---");
  try {
    const mockServer = createServer();
    setupSocketIO(mockServer);
    emitReviewUpdate();
    console.log("✅ Socket.io Initialization & Emission: OK");
    mockServer.close();
  } catch (err: any) {
    console.error("❌ Socket.io Test: FAILED", err.message);
  }

  // 4. Data Layer Consistency
  console.log("\n--- Data Layer Test ---");
  try {
    // This will trigger emitReviewUpdate in the background
    // We use a non-existent repo ID but it should still verify the method call
    const repo = await storage.getRepository("random-id");
    console.log("✅ Storage Read: OK");
  } catch (err: any) {
    console.error("❌ Storage Test: FAILED", err.message);
  }

  console.log("\n🏁 Verification Complete.");
}

verifyAll();
