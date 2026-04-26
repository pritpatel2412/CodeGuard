/**
 * SOURCES: Patterns that indicate user-controlled (tainted) input.
 * These are checked against variable declarations and parameter assignments.
 */
export const TAINT_SOURCE_PATTERNS: RegExp[] = [
  // Express request object
  /req\.(body|params|query|headers|cookies)\b/,
  // Raw process input
  /process\.argv/,
  /process\.env\b/,           // Note: env vars can carry injected values
  // File system reads (could be user-influenced paths)
  /fs\.readFile|fs\.readFileSync/,
  // External HTTP responses
  /axios\.(get|post|put|patch|delete)|fetch\(|http\.get/,
  // WebSocket / Socket.io messages
  /socket\.(on|emit)|ws\.message/,
  // GraphQL / gRPC inputs
  /args\b|context\.user\b|input\b/,
];

/**
 * SINKS: Patterns that represent dangerous operations.
 * Mapped to vulnerability type.
 */
export const TAINT_SINK_PATTERNS: Array<{
  pattern: RegExp;
  type: "SQLI" | "XSS" | "CMD_INJECTION" | "PATH_TRAVERSAL" | "SENSITIVE_LEAK" | "PROTOTYPE_POLLUTION";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}> = [
  // SQL Injection sinks
  { pattern: /\.query\s*\(`|\.query\s*\(["']|\.raw\s*\(|db\.execute\s*\(/,        type: "SQLI",             severity: "CRITICAL" },
  { pattern: /knex\.raw|sequelize\.query|prisma\.\$queryRaw/,                       type: "SQLI",             severity: "CRITICAL" },

  // Command Injection sinks
  { pattern: /exec\s*\(|execSync\s*\(|spawn\s*\(|spawnSync\s*\(/,                  type: "CMD_INJECTION",    severity: "CRITICAL" },
  { pattern: /child_process/,                                                         type: "CMD_INJECTION",    severity: "CRITICAL" },

  // Code execution sinks
  { pattern: /\beval\s*\(|new Function\s*\(|vm\.runInContext/,                      type: "CMD_INJECTION",    severity: "CRITICAL" },

  // XSS sinks
  { pattern: /innerHTML\s*=|outerHTML\s*=|document\.write\s*\(/,                   type: "XSS",              severity: "HIGH"     },
  { pattern: /res\.send\s*\(|res\.render\s*\(|res\.write\s*\(/,                    type: "XSS",              severity: "MEDIUM"   },

  // Path Traversal sinks
  { pattern: /fs\.(readFile|writeFile|appendFile|unlink)\s*\(/,                     type: "PATH_TRAVERSAL",   severity: "HIGH"     },
  { pattern: /path\.join\s*\(|path\.resolve\s*\(/,                                  type: "PATH_TRAVERSAL",   severity: "MEDIUM"   },

  // Sensitive data leak sinks
  { pattern: /console\.(log|debug|info|warn)\s*\(/,                                 type: "SENSITIVE_LEAK",   severity: "LOW"      },
  { pattern: /res\.json\s*\(|res\.send\s*\(/,                                       type: "SENSITIVE_LEAK",   severity: "MEDIUM"   },

  // Prototype Pollution sinks
  { pattern: /Object\.assign\s*\(|merge\s*\(|extend\s*\(/,                          type: "PROTOTYPE_POLLUTION", severity: "HIGH"  },
  { pattern: /\[.*?\]\s*=\s*|__proto__/,                                             type: "PROTOTYPE_POLLUTION", severity: "HIGH"  },
];

/**
 * SANITIZERS: Functions/patterns that clean tainted data.
 * If tainted data passes through one of these before a sink, it's considered safe.
 * IMPORTANT: The bypass detection tracks if sanitization is applied to only SOME paths.
 */
export const SANITIZER_PATTERNS: RegExp[] = [
  // SQL parameterization
  /parameterized|prepared|placeholder|\$\d+|\?/,
  // Input validation libraries
  /validator\.|Joi\.|yup\.|zod\./,
  /\.escape\s*\(|\.sanitize\s*\(|DOMPurify\./,
  // Encoding
  /encodeURIComponent|htmlspecialchars|entities\.encode/,
  // Type assertion (casting to safe type)
  /parseInt\s*\(|parseFloat\s*\(|Number\s*\(/,
  // Custom patterns (common in projects)
  /sanitize|validate|clean|escape|encode/i,
];
