import type { RepoFile } from "./repository-crawler";
import type { SemanticGraph, FunctionNode, CallEdge } from "./types";
import { parseFileToGraph } from "./ast-parser";

/**
 * Builds a complete inter-procedural semantic graph from all repo files.
 * Resolves cross-file function references using export name matching.
 */
export async function buildSemanticGraph(files: RepoFile[]): Promise<SemanticGraph> {
  const graph: SemanticGraph = {
    nodes: new Map<string, FunctionNode>(),
    edges: [],
  };

  // Step 1: Parse every file and collect all function nodes
  const allUnresolvedCalls: Array<CallEdge & { calleeName: string }> = [];

  for (const file of files) {
    const { functions, calls } = parseFileToGraph(file.path, file.content);

    for (const fn of functions) {
      graph.nodes.set(fn.id, fn);
    }

    // Store calls with the raw callee name for cross-file resolution later
    for (const call of calls) {
      allUnresolvedCalls.push({ ...call, calleeName: call.toNodeId });
    }
  }

  // Step 2: Build a name → nodeId lookup for exported functions
  // Key: functionName, Value: array of nodeIds (same name can exist in multiple files)
  const nameIndex = new Map<string, string[]>();
  graph.nodes.forEach((node, id) => {
    const existing = nameIndex.get(node.functionName) ?? [];
    existing.push(id);
    nameIndex.set(node.functionName, existing);
  });

  // Step 3: Resolve each call's toNodeId to a real node ID
  for (const call of allUnresolvedCalls) {
    const candidates = nameIndex.get(call.calleeName);
    if (!candidates || candidates.length === 0) continue;

    // If there's only one candidate, resolve directly
    // If multiple (same name across files), prefer the one in the same file first
    let resolved = candidates.find((id) => id.startsWith(call.fromNodeId.split("::")[0]));
    if (!resolved) resolved = candidates[0];

    if (resolved) {
      graph.edges.push({
        ...call,
        toNodeId: resolved,
      });
    }
  }

  return graph;
}
