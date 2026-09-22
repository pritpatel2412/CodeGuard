import React from "react";
import { SiGithub, SiReact, SiNodedotjs, SiPostgresql } from "react-icons/si";
import { Cpu } from "lucide-react";

export function TechBadgesSection() {
  const techs = [
    { name: "GitHub", icon: SiGithub, label: "GitHub-Native" },
    { name: "React", icon: SiReact, label: "React" },
    { name: "Node.js", icon: SiNodedotjs, label: "Node.js" },
    { name: "PostgreSQL", icon: SiPostgresql, label: "PostgreSQL" },
    { name: "AI", icon: Cpu, label: "AI Models" },
  ];

  return (
    <section className="py-12 border-y border-zinc-800/80 bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-zinc-400">
          Built for modern development workflows
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          {techs.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <Icon className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium">{tech.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
