# Project Overview

## Purpose
llm-ts-example is a collection of TypeScript examples demonstrating various LLM (Large Language Model) implementations and frameworks. The project showcases different approaches to building AI agents and applications using modern TypeScript tooling.

## Tech Stack
- **Language**: TypeScript
- **Package Manager**: pnpm (v10.14.0)
- **Build System**: TypeScript compiler (tsc)
- **Testing**: Vitest
- **Linting**: ESLint with TypeScript support
- **Runtime**: Node.js with tsx for development

## Main Components
The project is organized into several example directories:
- `basic/` - Basic chat implementation with LangChain.js and LangGraph.js
- `rag/` - RAG (Retrieval Augmented Generation) examples
- `agents/` - Various agent implementations including:
  - `agent-mastra/` - Mastra framework examples
  - `agent-voltagent/` - VoltAgent examples
  - `langgraph-deep-agent/` - LangGraph Deep Agent implementation
- `node-llama-cpp/` - Local LLM examples using node-llama-cpp
- `webllm/` - WebLLM examples
- `mpc/` - MPC (Multi-Party Computation) examples
- `common/` - Shared utilities and core components

## Architecture
- Monorepo structure using pnpm workspaces
- Each subdirectory is a separate package with its own dependencies
- Shared common packages for backend and core functionality