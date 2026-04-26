import { Octokit } from "@octokit/rest";
import { crawlPRFiles } from "./repository-crawler";
import { buildSemanticGraph } from "./graph-builder";
import { runTaintPropagation } from "./propagation-engine";
import { enrichTaintPathsWithAI } from "./ai-enricher";
import { db } from "../db";
import { semanticGraphs, taintPaths } from "../../shared/schema";
import { eq } from "drizzle-orm";

export interface TaintAnalysisInput {
  octokit: Octokit;
  owner: string;
  repo: string;
  ref: string;          // Head SHA of the PR branch
  prNumber: number;     // PR number to scope file crawl
  reviewId: number | string;
  repositoryId: number | string;
  repoDescription?: string;
}

export async function runCrossFileTaintAnalysis(input: TaintAnalysisInput): Promise<void> {
  const {
    octokit, owner, repo, ref, prNumber,
    reviewId, repositoryId, repoDescription,
  } = input;

  const reviewIdStr = String(reviewId);
  const maxFiles = parseInt(process.env.TAINT_MAX_FILES ?? "300");

  console.log(`[Taint] Starting cross-file analysis for ${owner}/${repo} PR#${prNumber}@${ref}`);

  // ── Idempotency Guard ─────────────────────────────────────────────────────
  // Delete any previous analysis for this review before re-running.
  // This prevents duplicate rows when the PR is synchronised or re-analysed.
  const existing = await db
    .select({ id: semanticGraphs.id })
    .from(semanticGraphs)
    .where(eq(semanticGraphs.reviewId, reviewIdStr));

  if (existing.length > 0) {
    console.log(`[Taint] Clearing ${existing.length} previous graph(s) for review ${reviewIdStr}`);
    await db.delete(taintPaths).where(eq(taintPaths.reviewId, reviewIdStr));
    await db.delete(semanticGraphs).where(eq(semanticGraphs.reviewId, reviewIdStr));
  }

  // ── Phase 1: Crawl ONLY the files changed in this PR ─────────────────────
  // Scoping to changed files prevents unrelated files (e.g. getStudentInfo.js
  // from a different feature branch) from polluting the results.
  const files = await crawlPRFiles(octokit, owner, repo, prNumber, ref, maxFiles);
  console.log(`[Taint] Crawled ${files.length} PR-changed files`);

  if (files.length === 0) {
    console.warn("[Taint] No source files changed in this PR. Aborting.");
    return;
  }

  // ── Phase 2: Build Semantic Graph ─────────────────────────────────────────
  const graph = await buildSemanticGraph(files);
  console.log(`[Taint] Graph: ${graph.nodes.size} nodes, ${graph.edges.length} edges`);

  // Persist graph snapshot
  const [graphRecord] = await db.insert(semanticGraphs).values({
    reviewId: reviewIdStr,
    repositoryId: String(repositoryId),
    graphData: {
      nodes: Array.from(graph.nodes.values()).map((n) => ({
        id: n.id,
        filePath: n.filePath,
        functionName: n.functionName,
        startLine: n.startLine,
        endLine: n.endLine,
        isAsync: n.isAsync,
        isExported: n.isExported,
      })),
      edges: graph.edges.map((e) => ({
        id: e.id,
        from: e.fromNodeId,
        to: e.toNodeId,
        line: e.callSiteLine,
      })),
    },
    fileCount: files.length,
    functionCount: graph.nodes.size,
    edgeCount: graph.edges.length,
  }).returning();

  // ── Phase 3: Taint Propagation ─────────────────────────────────────────────
  const rawPaths = runTaintPropagation(graph, files);
  console.log(`[Taint] Found ${rawPaths.length} raw taint paths`);

  if (rawPaths.length === 0) {
    console.log("[Taint] No taint paths found. Repository appears clean.");
    return;
  }

  // Limit AI enrichment to top 10 highest-severity paths
  const prioritizedPaths = rawPaths
    .sort((a, b) => severityOrder(b.severity) - severityOrder(a.severity))
    .slice(0, 10);

  // ── Phase 4: AI Enrichment ─────────────────────────────────────────────────
  const enrichedPaths = await enrichTaintPathsWithAI(
    prioritizedPaths,
    repoDescription ?? `${owner}/${repo}`
  );
  console.log(`[Taint] AI enriched ${enrichedPaths.length} paths`);

  // ── Phase 5: Persist Findings ──────────────────────────────────────────────
  if (enrichedPaths.length > 0) {
    await db.insert(taintPaths).values(
      enrichedPaths.map((p) => ({
        reviewId: reviewIdStr,
        semanticGraphId: graphRecord.id,
        title: `${p.sink.sinkType.replace(/_/g, " ")} via ${p.chain.length}-hop chain`,
        vulnerabilityType: p.sink.sinkType,
        severity: p.severity,
        sourceFile: p.source.nodeId.split("::")[0],
        sourceFunction: p.source.nodeId.split("::")[1] ?? "unknown",
        sourceLine: p.source.line,
        sourceExpression: p.source.expression,
        sinkFile: p.sink.nodeId.split("::")[0],
        sinkFunction: p.sink.nodeId.split("::")[1] ?? "unknown",
        sinkLine: p.sink.line,
        sinkExpression: p.sink.expression,
        propagationChain: p.chain,
        sanitizerBypassed: p.sanitizerBypassed,
        sanitizerLocation: p.sanitizerLocation ?? null,
        aiExplanation: p.aiExplanation,
        aiFixSuggestion: p.aiFixSuggestion,
      }))
    );
  }

  console.log(`[Taint] Analysis complete. Persisted ${enrichedPaths.length} findings.`);
}

function severityOrder(s: string): number {
  return { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }[s] ?? 0;
}
