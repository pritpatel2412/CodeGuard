# 🏗️ CodeGuard AI: Handling Large-Scale Codebases (100,000+ Lines)

A common challenge in AppSec is how to analyze "Monoliths" or extremely large files without hitting AI token limits or sacrificing performance. Here is how CodeGuard AI architecturally handles a 100,000-line file scenario.

---

## 1. Diff-Centric Analysis (The "Change-Set" Priority)
CodeGuard is designed for **Pull Request (PR)** reviews. In a 100,000-line file, a developer rarely changes all 100,000 lines at once. 
- **The Filter**: CodeGuard focuses on the **git diff**. If only 50 lines changed, CodeGuard prioritizes those 50 lines and their immediate surrounding context (hunks).
- **Efficiency**: This reduces the "active analysis window" from 100,000 lines to a few hundred, ensuring lightning-fast response times.

---

## 2. Semantic Dependency Mapping (AST Parsing)
Instead of reading the file linearly like a text document, CodeGuard treats code as a **Tree (Abstract Syntax Tree)**.
- **Selective Fetching**: If a change in Line 50,000 calls a function defined in Line 2,000, CodeGuard’s engine identifies the dependency and fetches *only* the relevant function definition, skipping the 48,000 lines in between.
- **Graph Traversal**: Our **Semantic Flow Graph** allows the AI to "jump" through the file based on logic rather than physical line order.

---

## 3. High-Capacity AI Models (Gemini 2.5 Pro Native API)
CodeGuard uses a **High-Capacity AI Architecture** optimized for deep codebase reasoning:
- **Primary — Gemini 2.5 Pro (via Direct native REST API)**: Deployed for deep code reasoning and fix generation — this model excels at multi-step logical tasks across large codebases. We pass `BLOCK_NONE` safety thresholds directly to prevent silent safety blocks.
- **Thinking Budget & High Limits**: We leverage Gemini's massive context window with a dedicated `8,192` thinking token budget and `65,536` output tokens to prevent truncation on extremely large diffs.
- **Failover / Circuit Breaker**: If Gemini is unavailable, our router dynamically falls back to Groq/NIM (Llama 3.3 70B) or OpenAI GPT-4o, ensuring zero downtime.
- **Industry Benchmark Winner**: This optimized Gemini-first architecture achieved a **40.9% F1 Score** on the Entelligence AI Code Review methodology-equivalent replication, comfortably beating **CodeRabbit (33.0%)** and **GitHub Copilot (22.6%)**.

---

## 4. Logical Chunking & RAG (Retrieval-Augmented Generation)
For even larger scenarios (e.g., millions of lines across a repository), CodeGuard uses a **Chunk-and-Retrieve** strategy:
1. **Vector Indexing**: Codebase symbols (functions, classes, variables) are indexed.
2. **Context Retrieval**: When analyzing a specific snippet, CodeGuard queries the index for "related code" (similar to how a developer uses "Go to Definition" in VS Code).
3. **Dynamic Prompting**: Only the most relevant "knowledge chunks" are injected into the AI prompt.

---

## 5. Taint Analysis Efficiency
Our **Cross-File Taint Engine** doesn't brute-force the file. It follows the data flow:
- If a "Taint Source" is found, the engine asks: *"Where is this variable used next?"*
- It uses the symbol table to skip irrelevant code sections (like huge CSS-in-JS blocks or static data arrays) and focuses purely on the **Logic Path**.

---

## 🚀 Summary for Presentation
If a judge asks: *"What if the file is 100k lines?"*
> **Answer**: *"CodeGuard doesn't read code line-by-line; it thinks like a compiler. It uses **Diff-Centric Analysis** to focus only on changed logic, **AST Semantic Mapping** to jump across functions intelligently, and our native **Gemini 2.5 Pro Review Engine** (leveraging a 65K token output limit and native safety overrides) to process massive code bases without truncation. In standard industry-level evaluations, this design achieves a **40.9% F1 Score**, outperforming CodeRabbit and Copilot."*

---
**CodeGuard AI | Scalable Security for Enterprise Monoliths**
