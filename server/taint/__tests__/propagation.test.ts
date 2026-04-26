import assert from "assert";
import { runTaintPropagation } from "../propagation-engine.js";
import { SemanticGraph, RepoFile } from "../types.js";

// Mock Data
const files: RepoFile[] = [
  {
    path: "controller.ts",
    content: `
export function handleRequest(req, res) {
  const userId = req.body.userId;
  const data = req.query.data;
  dbService.queryData(userId);
}
    `,
  },
  {
    path: "dbService.ts",
    content: `
export const dbService = {
  queryData: function(id) {
    const query = "SELECT * FROM users WHERE id = " + id;
    db.execute(query);
  }
}
    `,
  }
];

const graph: SemanticGraph = {
  nodes: new Map([
    ["n1", { id: "n1", filePath: "controller.ts", startLine: 2, endLine: 6, functionName: "handleRequest" }],
    ["n2", { id: "n2", filePath: "dbService.ts", startLine: 3, endLine: 6, functionName: "queryData" }]
  ]),
  edges: [
    { fromNodeId: "n1", toNodeId: "n2", callSiteLine: 5, expression: "dbService.queryData" }
  ]
};

async function runTests() {
  console.log("Running Taint Propagation Tests...");

  try {
    const paths = runTaintPropagation(graph, files);
    
    console.log("Detected Paths:", JSON.stringify(paths, null, 2));

    assert.strictEqual(paths.length, 1, "Should detect exactly one SQL injection path");
    const path = paths[0];

    // Source assertion
    assert.strictEqual(path.source.nodeId, "n1", "Source should be in handleRequest (n1)");
    assert.ok(path.source.expression.includes("req.body") || path.source.expression.includes("req.query"), "Source should identify user input");

    // Sink assertion
    assert.strictEqual(path.sink.nodeId, "n2", "Sink should be in queryData (n2)");
    assert.strictEqual(path.sink.sinkType, "SQLI", "Should detect SQL Injection");
    assert.strictEqual(path.severity, "CRITICAL", "Severity should be CRITICAL");

    // Chain assertion
    assert.strictEqual(path.chain.length, 2, "Path chain should have 2 hops (n1 -> n2)");
    assert.strictEqual(path.chain[0].nodeId, "n1");
    assert.strictEqual(path.chain[1].nodeId, "n2");

    console.log("[PASS] All tests passed successfully!");
  } catch (error) {
    console.error("[FAIL] Test failed:", error);
    process.exit(1);
  }
}

runTests();
