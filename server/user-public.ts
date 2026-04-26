import type { User } from "../shared/schema.js";

/** Fields safe to expose to the browser session / `/api/user`. */
export type PublicUser = Pick<
  User,
  | "id"
  | "username"
  | "githubId"
  | "avatarUrl"
  | "bugDetection"
  | "securityAnalysis"
  | "performanceIssues"
  | "maintainability"
  | "skipStyleIssues"
  | "postComments"
  | "highRiskAlerts"
  | "autoFixStrictMode"
  | "autoFixSafetyGuards"
>;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    githubId: user.githubId ?? null,
    avatarUrl: user.avatarUrl ?? null,
    bugDetection: user.bugDetection,
    securityAnalysis: user.securityAnalysis,
    performanceIssues: user.performanceIssues,
    maintainability: user.maintainability,
    skipStyleIssues: user.skipStyleIssues,
    postComments: user.postComments,
    highRiskAlerts: user.highRiskAlerts,
    autoFixStrictMode: user.autoFixStrictMode,
    autoFixSafetyGuards: user.autoFixSafetyGuards,
  };
}
