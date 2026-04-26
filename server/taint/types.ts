// A single function/method node in the semantic graph
export interface FunctionNode {
  id: string;                 // Unique: "filepath::functionName"
  filePath: string;           // Relative path from repo root
  functionName: string;
  startLine: number;
  endLine: number;
  isAsync: boolean;
  isExported: boolean;
  parameters: string[];       // Parameter names
  // Taint markers set during propagation
  isTaintSource?: boolean;
  isTaintSink?: boolean;
  taintedParams?: Set<string>;
}

// A directed call edge between two function nodes
export interface CallEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  callSiteLine: number;
  // Which argument positions carry tainted data: e.g. [0, 2]
  taintedArgPositions: number[];
}

// The full inter-procedural graph
export interface SemanticGraph {
  nodes: Map<string, FunctionNode>;
  edges: CallEdge[];
}

// A taint source — user-controlled input entry point
export interface TaintSource {
  nodeId: string;
  expression: string;   // e.g. "req.body", "req.params.id"
  paramName: string;
  line: number;
}

// A taint sink — dangerous operation
export interface TaintSink {
  nodeId: string;
  expression: string;
  sinkType: "SQLI" | "XSS" | "CMD_INJECTION" | "PATH_TRAVERSAL" | "SENSITIVE_LEAK" | "PROTOTYPE_POLLUTION";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  line: number;
}

// A sanitizer that cleans tainted data
export interface TaintSanitizer {
  nodeId: string;
  functionPattern: RegExp;
  paramPositions: number[];   // Which params it cleans
}

// One complete detected vulnerability path
export interface TaintPath {
  source: TaintSource;
  sink: TaintSink;
  chain: Array<{ nodeId: string; line: number; expression: string }>;
  sanitizerBypassed: boolean;
  sanitizerLocation?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}
