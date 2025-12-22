import React from "react";
import { AiFixFlow } from "@/components/ai-fix-flow";

export default function DemoAiFixPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                    AI Agent Integration Demo
                </h1>
                <p className="text-muted-foreground">
                    Visualizing the automated security fix workflow
                </p>
            </div>

            <AiFixFlow />

            <div className="mt-12 max-w-2xl mx-auto p-6 bg-neutral-900/50 rounded-lg border border-neutral-800">
                <h3 className="text-lg font-semibold text-white mb-2">Component Usage</h3>
                <p className="text-neutral-400 text-sm mb-4">
                    This component is self-contained and manages its own animation state.
                    Drop it into any review page or modal.
                </p>
                <pre className="bg-black p-4 rounded text-xs text-neutral-300 font-mono overflow-x-auto border border-neutral-800">
                    {`import { AiFixFlow } from "@/components/ai-fix-flow";

export function ReviewPage() {
  return (
    <div>
      {/* ... content ... */}
      <AiFixFlow />
    </div>
  );
}`}
                </pre>
            </div>
        </div>
    );
}
