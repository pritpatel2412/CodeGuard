export function isSensitiveFile(path: string, content: string): boolean {
  // 1. Expanded filename blocklist
  const restrictedPathPatterns = [
    /auth/i, /login/i, /payment/i, /billing/i, /session/i, /crypto/i,
    /stripe/i, /paypal/i, /\.env/i, /config/i, /credentials/i
  ];
  
  if (restrictedPathPatterns.some(pattern => pattern.test(path))) {
    return true;
  }

  // 2. Sensitive module imports
  const sensitiveImports = [
    /import.*from.*["'](?:stripe|paypal|crypto|jsonwebtoken|passport|bcrypt|scrypt)["']/i,
    /require\(["'](?:stripe|paypal|crypto|jsonwebtoken|passport|bcrypt|scrypt)["']\)/i,
    /import.*(?:auth|session|crypto|payment|billing|verifyToken|hashPassword)/i
  ];
  
  if (sensitiveImports.some(pattern => pattern.test(content))) {
    return true;
  }

  // 3. Known secret env var patterns
  const secretEnvVars = [
    /process\.env\.(?:STRIPE_.*|PAYPAL_.*|JWT_.*|SECRET_.*|.*_KEY|.*_TOKEN|DB_PASS.*)/i,
    /process\.env\[["'](?:STRIPE_.*|PAYPAL_.*|JWT_.*|SECRET_.*|.*_KEY|.*_TOKEN|DB_PASS.*)["']\]/i
  ];

  if (secretEnvVars.some(pattern => pattern.test(content))) {
    return true;
  }

  return false;
}
