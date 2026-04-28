import 'dotenv/config';
import { callAI } from "../server/ai/provider";

async function verifyFixModel() {
  console.log("🛠️ Testing Fix Model (Llama 3.1 405b)...");

  try {
    const result = await callAI({
      task: "fix",
      messages: [{ role: "user", content: "fix this code: eval(x)" }],
      maxTokens: 10
    });
    console.log(`✅ Fix Model Test: OK (${result.provider} used, model: ${result.model})`);
  } catch (err: any) {
    console.error("❌ Fix Model Test: FAILED", err.message);
  }
}

verifyFixModel();
