import { useQuery } from "@tanstack/react-query";
import { useMemo, useEffect, memo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
// @ts-ignore - dagre has no bundled types but works fine at runtime
import dagre from "dagre";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, FileCode2, Cpu, GitMerge } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface SemanticGraph {
  id: string;
  reviewId: string;
  graphData: {
    nodes: Array<{
      id: string;
      filePath: string;
      functionName: string;
      startLine: number;
      endLine: number;
      isAsync?: boolean;
      isExported?: boolean;
    }>;
    edges: Array<{
      id: string;
      from: string;
      to: string;
      line?: number;
    }>;
  };
  fileCount: number;
  functionCount: number;
  edgeCount: number;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 70;

// Custom Node Component for better theme support
const SemanticNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-3 py-2.5 rounded-lg border shadow-sm min-w-[200px] bg-card text-card-foreground group transition-colors">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary border-none" />
      <div className="flex flex-col items-center text-center">
        <div className="text-[11px] font-bold leading-tight truncate w-full group-hover:text-primary transition-colors">
          {String((data as { functionName?: unknown }).functionName ?? "")}
        </div>
        <div className="text-[10px] text-foreground/70 mt-1 font-mono truncate w-full border-t border-border/30 pt-1">
          {String((data as { fileName?: unknown }).fileName ?? "")}:{String((data as { line?: unknown }).line ?? "")}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary border-none" />
    </div>
  );
});

SemanticNode.displayName = "SemanticNode";

const nodeTypes = {
  semantic: SemanticNode,
};

function buildLayoutedElements(graphData: SemanticGraph["graphData"]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 70, ranksep: 100 }); // TB for vertical flow like in screenshot

  const rawNodes: Node[] = (graphData.nodes || []).map((node) => {
    return {
      id: node.id,
      type: "semantic",
      data: {
        functionName: node.functionName,
        fileName: node.filePath.split("/").pop(),
        line: node.startLine,
      },
      position: { x: 0, y: 0 },
    };
  });

  const rawEdges: Edge[] = (graphData.edges || []).map((edge, i) => ({
    id: `e-${edge.id ?? i}`,
    source: edge.from,
    target: edge.to,
    type: "smoothstep",
    animated: true,
    markerEnd: { 
      type: MarkerType.ArrowClosed, 
      color: "hsl(var(--primary))",
    },
    style: { stroke: "hsl(var(--primary))", strokeWidth: 2, opacity: 0.8 },
    label: edge.line ? `line ${edge.line}` : undefined,
    labelStyle: { fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 },
  }));

  rawNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  rawEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = rawNodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { layoutedNodes, layoutedEdges: rawEdges };
}

export function TaintGraphViewer({ reviewId }: { reviewId: string }) {
  const { theme } = useTheme();
  const { data: graphs, isLoading } = useQuery<SemanticGraph[]>({
    queryKey: [`/api/taint/${reviewId}/graph`],
  });

  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    if (!graphs || graphs.length === 0 || !graphs[0].graphData?.nodes?.length) {
      return { layoutedNodes: [], layoutedEdges: [] };
    }
    return buildLayoutedElements(graphs[0].graphData);
  }, [graphs]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (layoutedNodes.length > 0) {
      setNodes(layoutedNodes as any);
      setEdges(layoutedEdges as any);
    }
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  if (isLoading) {
    return <Skeleton className="w-full h-[500px] rounded-lg" />;
  }

  if (!graphs || graphs.length === 0) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="py-12 flex flex-col items-center gap-3">
          <GitBranch className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            No cross-file semantic graph available for this review.<br />
            Graph data is generated when the taint engine processes the PR.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (nodes.length === 0) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="py-12 flex flex-col items-center gap-3">
          <GitBranch className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Graph has no renderable nodes. The PR may only contain non-function changes.
          </p>
        </CardContent>
      </Card>
    );
  }

  const meta = graphs[0];

  // Theme-aware colors
  const colors = {
    background: theme === "light" ? "hsl(var(--background))" : theme === "midnight" ? "#000000" : "hsl(var(--background))",
    grid: theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
    miniMapNode: theme === "light" ? "#e2e8f0" : "#1e293b",
    miniMapMask: theme === "light" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
  };

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-1.5 bg-muted/30 border border-border/50 rounded-full px-3 py-1">
          <FileCode2 className="h-3.5 w-3.5 text-primary" />
          <span>{meta.fileCount} files</span>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/30 border border-border/50 rounded-full px-3 py-1">
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span>{meta.functionCount} functions</span>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/30 border border-border/50 rounded-full px-3 py-1">
          <GitMerge className="h-3.5 w-3.5 text-primary" />
          <span>{meta.edgeCount} call edges</span>
        </div>
      </div>

      {/* Graph canvas */}
      <div className="w-full h-[600px] border rounded-xl bg-background overflow-hidden relative shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          attributionPosition="bottom-right"
          colorMode={theme === "light" ? "light" : "dark"}
        >
          <Controls className="bg-card border-border fill-foreground" />
          <MiniMap
            nodeColor={colors.miniMapNode}
            maskColor={colors.miniMapMask}
            className="bg-card border-border"
            zoomable
            pannable
          />
          <Background color={colors.grid} gap={20} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
