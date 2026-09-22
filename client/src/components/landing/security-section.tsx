import React from "react";
import { ShieldCheck, Cpu, Sliders, Lock, GitBranch } from "lucide-react";

export function SecuritySection() {
  const principles = [
    {
      title: "Secure by Design",
      description:
        "Engineered with least privilege and ephemeral execution for all diff analyses.",
      icon: ShieldCheck,
    },
    {
      title: "AI-Assisted Analysis",
      description:
        "Multi-model synthesis with rigorous structured verification to prevent hallucinations.",
      icon: Cpu,
    },
    {
      title: "Policy Enforcement",
      description:
        "Deterministic rule evaluation adhering to OWASP ASVS and organization policies.",
      icon: Sliders,
    },
    {
      title: "Protected Remediation",
      description:
        "Automated guardrails preventing AI from altering sensitive authentication or billing files.",
      icon: Lock,
    },
    {
      title: "GitHub-Native Workflow",
      description:
        "Seamless webhooks and status checks integrated directly into developer PR discussions.",
      icon: GitBranch,
    },
  ];

  return (
    <section id="security" className="py-24 border-t border-zinc-800/80 bg-zinc-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400">
            Enterprise Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Security is part of the workflow.
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            We hold our platform to the same uncompromising security engineering standards we enforce on your repositories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {principles.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
