import type { SemanticGraph, TaintSource, TaintSink, TaintPath, FunctionNode } from "./types.js";
import { TAINT_SOURCE_PATTERNS, TAINT_SINK_PATTERNS, SANITIZER_PATTERNS } from "./taint-sources-sinks.js";
import type { RepoFile } from "./repository-crawler.js";

/**
 * Main taint propagation engine.
 * 
 * Algorithm: Forward reachability BFS from each taint source node,
 * following call edges in the semantic graph.
 * At each visited node, checks if the function body contains sink patterns.
 * Tracks the full propagation chain.
 */
export function runTaintPropagation(
  graph: SemanticGraph,
  files: RepoFile[],
): TaintPath[] {

  // Build a quick file content lookup
  const fileContents = new Map<string, string>(files.map((f) => [f.path, f.content]));

  // Build adjacency list: nodeId → outbound edges
  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const existing = adjacency.get(edge.fromNodeId) ?? [];
    existing.push(edge.toNodeId);
    adjacency.set(edge.fromNodeId, existing);
  }

  const detectedPaths: TaintPath[] = [];

  // Step 1: Identify all source nodes
  const sourceNodes: Array<{ node: FunctionNode; sources: TaintSource[] }> = [];

  graph.nodes.forEach((node) => {
    const fileContent = fileContents.get(node.filePath) ?? "";
    const relevantLines = extractLines(fileContent, node.startLine, node.endLine);
    const sources = detectSources(node, relevantLines);
    if (sources.length > 0) {
      sourceNodes.push({ node, sources });
    }
  });

  // Step 2: BFS/DFS forward propagation from each source node
  for (const { node: sourceNode, sources } of sourceNodes) {
    for (const source of sources) {
      const visited = new Set<string>();
      const chain: TaintPath["chain"] = [];

      propagate(
        sourceNode.id,
        source,
        visited,
        chain,
        graph,
        adjacency,
        fileContents,
        detectedPaths,
      );
    }
  }

  // Deduplicate by source+sink pair
  return deduplicatePaths(detectedPaths);
}

function propagate(
  currentNodeId: string,
  source: TaintSource,
  visited: Set<string>,
  chain: TaintPath["chain"],
  graph: SemanticGraph,
  adjacency: Map<string, string[]>,
  fileContents: Map<string, string>,
  results: TaintPath[],
  depth: number = 0
): void {
  // Guard: max call depth to prevent infinite recursion on circular calls
  if (depth > 15 || visited.has(currentNodeId)) return;
  visited.add(currentNodeId);

  const node = graph.nodes.get(currentNodeId);
  if (!node) return;

  const fileContent = fileContents.get(node.filePath) ?? "";
  const relevantLines = extractLines(fileContent, node.startLine, node.endLine);

  // Check if this node body contains a sanitizer
  const hasSanitizer = SANITIZER_PATTERNS.some((p) => p.test(relevantLines));

  // Check if this node body contains a sink
  const sinks = detectSinks(node, relevantLines);

  for (const sink of sinks) {
    // If a sanitizer is present in the same function, check if it's bypassable.
    // Simplification: if the sink and sanitizer co-exist in the same function,
    // we flag as "sanitizer present but potentially bypassed" only when
    // the sink pattern appears AFTER the sanitizer pattern in the function body.
    const sanitizerLine = hasSanitizer ? findPatternLine(relevantLines, SANITIZER_PATTERNS) : null;
    const isBypassed = hasSanitizer && sanitizerLine !== null && sink.line > sanitizerLine;

    // Only report if no sanitizer, or sanitizer is bypassable
    if (!hasSanitizer || isBypassed) {
      results.push({
        source,
        sink,
        chain: [...chain, { nodeId: currentNodeId, line: node.startLine, expression: node.functionName }],
        sanitizerBypassed: isBypassed,
        sanitizerLocation: isBypassed ? `${node.filePath}:${node.startLine}` : undefined,
        severity: sink.severity,
      });
    }
  }

  // Add to propagation chain and continue BFS
  const currentChainEntry = { nodeId: currentNodeId, line: node.startLine, expression: node.functionName };

  const neighbors = adjacency.get(currentNodeId) ?? [];
  for (const neighborId of neighbors) {
    propagate(
      neighborId,
      source,
      new Set(visited), // Copy visited to allow multiple paths
      [...chain, currentChainEntry],
      graph,
      adjacency,
      fileContents,
      results,
      depth + 1
    );
  }
}

// ---- Helper functions ----

function extractLines(content: string, start: number, end: number): string {
  const lines = content.split("\n");
  return lines.slice(Math.max(0, start - 1), end).join("\n");
}

function detectSources(node: FunctionNode, body: string): TaintSource[] {
  const sources: TaintSource[] = [];
  const lines = body.split("\n");
  lines.forEach((line, i) => {
    for (const pattern of TAINT_SOURCE_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        sources.push({
          nodeId: node.id,
          expression: match[0],
          paramName: match[0],
          line: node.startLine + i,
        });
        break;
      }
    }
  });
  return sources;
}

function detectSinks(node: FunctionNode, body: string): TaintSink[] {
  const sinks: TaintSink[] = [];
  const lines = body.split("\n");
  lines.forEach((line, i) => {
    for (const sinkDef of TAINT_SINK_PATTERNS) {
      if (sinkDef.pattern.test(line)) {
        sinks.push({
          nodeId: node.id,
          expression: line.trim(),
          sinkType: sinkDef.type,
          severity: sinkDef.severity,
          line: node.startLine + i,
        });
        break;
      }
    }
  });
  return sinks;
}

function findPatternLine(body: string, patterns: RegExp[]): number | null {
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (patterns.some((p) => p.test(lines[i]))) return i + 1;
  }
  return null;
}

function deduplicatePaths(paths: TaintPath[]): TaintPath[] {
  const seen = new Set<string>();
  return paths.filter((p) => {
    const key = `${p.source.nodeId}|${p.sink.nodeId}|${p.sink.sinkType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
