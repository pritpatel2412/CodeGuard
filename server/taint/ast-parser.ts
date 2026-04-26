import { parse } from "@typescript-eslint/typescript-estree";
import { AST_NODE_TYPES } from "@typescript-eslint/types";
import type { TSESTree } from "@typescript-eslint/types";
import type { FunctionNode, CallEdge } from "./types";

/**
 * Parses a single TypeScript/JavaScript file.
 * Returns all function definitions and outbound call edges found.
 */
export function parseFileToGraph(
  filePath: string,
  sourceCode: string
): { functions: FunctionNode[]; calls: CallEdge[] } {

  const functions: FunctionNode[] = [];
  const calls: CallEdge[] = [];

  let ast: TSESTree.Program;
  try {
    ast = parse(sourceCode, {
      jsx: true,
      loc: true,
      range: true,
      tolerant: true,    // Don't throw on minor syntax errors
      comment: false,
    });
  } catch {
    return { functions: [], calls: [] }; // Skip unparseable files gracefully
  }

  // Stack to track current function scope during traversal
  const scopeStack: FunctionNode[] = [];

  function nodeId(filePath: string, name: string) {
    return `${filePath}::${name}`;
  }

  function extractFunctionName(node: TSESTree.Node, parent?: TSESTree.Node): string {
    if (node.type === AST_NODE_TYPES.FunctionDeclaration && node.id) {
      return node.id.name;
    }
    if (parent?.type === AST_NODE_TYPES.VariableDeclarator && parent.id.type === AST_NODE_TYPES.Identifier) {
      return parent.id.name;
    }
    if (parent?.type === AST_NODE_TYPES.MethodDefinition && parent.key.type === AST_NODE_TYPES.Identifier) {
      return parent.key.name;
    }
    if (parent?.type === AST_NODE_TYPES.Property && parent.key.type === AST_NODE_TYPES.Identifier) {
      return parent.key.name;
    }
    return `anonymous_${node.loc?.start.line ?? 0}`;
  }

  function extractParams(params: TSESTree.Parameter[]): string[] {
    return params.map((p) => {
      if (p.type === AST_NODE_TYPES.Identifier) return p.name;
      if (p.type === AST_NODE_TYPES.AssignmentPattern && p.left.type === AST_NODE_TYPES.Identifier) return p.left.name;
      if (p.type === AST_NODE_TYPES.RestElement && p.argument.type === AST_NODE_TYPES.Identifier) return p.argument.name;
      return "unknown";
    });
  }

  // ---- Recursive AST traversal ----
  function traverse(node: TSESTree.Node, parent?: TSESTree.Node) {
    if (!node) return;

    const isFunctionNode =
      node.type === AST_NODE_TYPES.FunctionDeclaration ||
      node.type === AST_NODE_TYPES.FunctionExpression ||
      node.type === AST_NODE_TYPES.ArrowFunctionExpression;

    if (isFunctionNode) {
      const fn = node as TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
      const name = extractFunctionName(node, parent);
      const funcNode: FunctionNode = {
        id: nodeId(filePath, name),
        filePath,
        functionName: name,
        startLine: fn.loc!.start.line,
        endLine: fn.loc!.end.line,
        isAsync: fn.async,
        isExported: parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                    parent?.type === AST_NODE_TYPES.ExportNamedDeclaration,
        parameters: extractParams(fn.params),
        taintedParams: new Set(),
      };
      functions.push(funcNode);
      scopeStack.push(funcNode);

      // Traverse the function body
      if (fn.body) traverse(fn.body, node);

      scopeStack.pop();
      return; // Don't fall through to generic child traversal
    }

    // Detect call expressions: foo(args), obj.method(args)
    if (node.type === AST_NODE_TYPES.CallExpression) {
      const call = node as TSESTree.CallExpression;
      const currentScope = scopeStack[scopeStack.length - 1];

      let calleeName = "";
      if (call.callee.type === AST_NODE_TYPES.Identifier) {
        calleeName = call.callee.name;
      } else if (call.callee.type === AST_NODE_TYPES.MemberExpression) {
        const me = call.callee as TSESTree.MemberExpression;
        if (me.property.type === AST_NODE_TYPES.Identifier) {
          calleeName = me.property.name;
        }
      }

      if (currentScope && calleeName) {
        // We record the call — cross-file resolution happens in the graph builder
        calls.push({
          id: `${currentScope.id}→${calleeName}@${call.loc?.start.line}`,
          fromNodeId: currentScope.id,
          toNodeId: calleeName, // Resolved to full id later
          callSiteLine: call.loc?.start.line ?? 0,
          taintedArgPositions: [],
        });
      }
    }

    // Generic child traversal for all other node types
    for (const key of Object.keys(node)) {
      if (key === "parent" || key === "tokens" || key === "comments") continue;
      const child = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(child)) {
        child.forEach((c) => { if (c && typeof c.type === "string") traverse(c as TSESTree.Node, node); });
      } else if (child && typeof (child as TSESTree.Node).type === "string") {
        traverse(child as TSESTree.Node, node);
      }
    }
  }

  traverse(ast);
  return { functions, calls };
}
