import path from "path";
import fs from "fs/promises";

/**
 * Safely joins a base directory with an untrusted relative path.
 * Ensures the resulting absolute path remains strictly inside the base directory,
 * thwarting directory traversal attacks (e.g., "../../etc/passwd").
 */
export function safePathJoin(baseDir: string, untrustedPath: string): string {
  const normalizedBase = path.resolve(baseDir);
  const resolvedPath = path.resolve(normalizedBase, untrustedPath);

  if (!resolvedPath.startsWith(normalizedBase)) {
    throw new Error(`[Security] Path traversal attempt detected. Path escapes base directory.`);
  }

  return resolvedPath;
}

/**
 * Validates that the file does not point to a symlink outside the base directory.
 * Useful when reading files from cloned untrusted repositories.
 */
export async function validateNoSymlinkEscape(baseDir: string, filePath: string): Promise<boolean> {
  try {
    const absolutePath = safePathJoin(baseDir, filePath);
    
    // realpath resolves all symlinks
    const realPath = await fs.realpath(absolutePath);
    const normalizedBase = await fs.realpath(baseDir);
    
    if (!realPath.startsWith(normalizedBase)) {
      console.warn(`[Security] Symlink escape detected for ${filePath}`);
      return false; // Symlink points outside
    }
    return true;
  } catch (e: any) {
    // If file doesn't exist, it can't be an escaping symlink.
    // If it's another error, we might want to err on the side of caution.
    if (e.code === 'ENOENT') return true;
    console.error(`[Security] Error validating symlink for ${filePath}:`, e);
    return false;
  }
}
