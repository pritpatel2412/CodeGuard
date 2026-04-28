import 'dotenv/config';
import OpenAI from "openai";

const nimClient = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_NIM_API_KEY ?? "",
});

const modelsToTest = [
  "meta/llama-3.3-70b-instruct",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "nvidia/nemotron-70b-instruct",
  "meta/llama-3.1-70b-instruct",
  "meta/llama3-70b-instruct",
  "nvidia/llama-3.1-nemotron-51b-instruct",
  "nvidia/llama-3.1-nemotron-70b-v1"
];

async function testModels() {
  console.log("Testing NIM models...");
  for (const model of modelsToTest) {
    try {
      const start = Date.now();
      await nimClient.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 5,
      });
      console.log(`✅ ${model} is WORKING (${Date.now() - start}ms)`);
    } catch (err: any) {
      console.log(`❌ ${model} FAILED: [${err.status}] ${err.message}`);
    }
  }
}

testModels();
