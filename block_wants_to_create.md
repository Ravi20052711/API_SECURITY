# Target Architecture: Autonomous AI Agent Protocols & Model Context Protocol (MCP) Security Platform (`block_wants_to_create`)

```mermaid
flowchart TD
    subgraph FRONTEND["Upgraded React Agent Workbench"]
        AUI["Agent Workbench & Telemetry Viewer"]
        ATV["Agent Reasoning Graph & Trace Log"]
    end

    subgraph AGENT_HOST["Autonomous AI Agent Host Engine (Host / Client Core)"]
        REACT["ReAct / Plan-and-Solve Reasoning Loop<br/>(Qwen / Claude / GPT-4 Core)"]
        MCP_CLIENT["MCP Client Core<br/>(JSON-RPC 2.0 Protocol Handler)"]
        CTX_MGR["Context Window Isolation Manager<br/>(Dual-LLM Privilege Separator)"]
    end

    subgraph TRANSPORT["MCP Transport Layer"]
        STDIO["stdio Process Pipe (Local Child Process)"]
        SSE["HTTP-SSE Stream (Remote Transport)"]
    end

    subgraph MCP_SERVERS["Vulnerable / Poisoned MCP Servers (apps/mcp_server/)"]
        subgraph PRIMITIVES["MCP Spec v1.0 Primitives"]
            TLIST["tools/list<br/>(Poisoned Metadata & Tool Descriptions)"]
            TCALL["tools/call<br/>(Executable API Tools & Functions)"]
            RREAD["resources/read<br/>(Poisoned URIs: file://, github://)"]
        end

        subgraph ATTACK_VECTORS["Agentic Flaw Scenarios"]
            TP["Semantic Tool Poisoning<br/>(Injected instructions in description)"]
            IPI["Indirect Prompt Injection<br/>(Poisoned text in fetched resource)"]
            TS["Tool Shadowing<br/>(Name collision hijacking)"]
            CD["Confused Deputy<br/>(Unintended high-privilege tool call)"]
        end
    end

    subgraph AGENT_ORACLE["Agentic Oracle & Telemetry Evaluator"]
        AEVAL["Agentic Trace Auditor<br/>(Evaluates Attention Hijacking & Reasoning Drift)"]
        AKPI["Agentic Security Scorecard<br/>(ASR, Refusal Precision, Tool Safety Score)"]
    end

    %% Interactions
    AUI -->|1. Gives Task Goal e.g. Fetch metrics| REACT
    REACT <-->|2. Discovers Capabilities| MCP_CLIENT
    MCP_CLIENT <-->|3. JSON-RPC 2.0 Messaging| TRANSPORT
    TRANSPORT <-->|4. Capability Queries & Tool Calls| PRIMITIVES
    PRIMITIVES -->|5. Injects Poisoned Metadata / Context| ATTACK_VECTORS
    ATTACK_VECTORS -->|6. Manipulates Agent Control Flow| REACT
    REACT -->|7. Streams Reasoning Traces & Payload Calls| ATV
    ATV -->|8. Audits Multi-Turn Execution Graph| AEVAL
    AEVAL -->|9. Outputs Security Metrics| AKPI

    %% Styling
    style FRONTEND fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    style AGENT_HOST fill:#0f0c36,stroke:#ff9800,stroke-width:2px,color:#fff
    style TRANSPORT fill:#1e1b4b,stroke:#8b5cf6,stroke-width:1px,color:#fff
    style MCP_SERVERS fill:#1e293b,stroke:#ef4444,stroke-width:2px,color:#fff
    style AGENT_ORACLE fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
```

## Detailed Description of Target Architecture
1. **Model Context Protocol (MCP v1.0) Integration**: Implementation of JSON-RPC 2.0 message handlers (`initialize`, `tools/list`, `tools/call`, `resources/read`, `prompts/get`) over `stdio` and HTTP-SSE transports.
2. **Autonomous Agent Host Engine**: Replacing manual human request building with an autonomous LLM reasoning engine (ReAct loop) that discovers capabilities and executes API calls dynamically.
3. **Agentic Flaw Testbed**:
   * **Semantic Tool Poisoning**: Malicious metadata in tool `description` fields.
   * **Indirect Prompt Injection**: Infected resources ingested into the agent context window.
   * **Tool Shadowing**: Un-namespaced duplicate tool definitions hijacking calls.
4. **Agentic Oracle Evaluator**: Audits multi-turn LLM reasoning traces, measuring **Attack Success Rate (ASR)**, refusal precision, and semantic context drift.
