# Existing Architecture: REST-Based API Security Learning Platform (`block_existing`)

```mermaid
flowchart TD
    subgraph FRONTEND["React Frontend Workspace (Vite / React)"]
        UI["Student User Interface"]
        RB["HTTP Request Builder Workspace<br/>(Manual Method, Headers, JSON Body)"]
        QA["Qwen Floating Assistant<br/>(Passive LLM Chatbot via Local Ollama)"]
    end

    subgraph BACKEND["Django REST Framework Backend (Port 8000)"]
        subgraph VUN_APP["apps/vulnerable_service/ (Target REST APIs)"]
            BOLA["BOLA Endpoint<br/>GET /api/v1/users/1002"]
            BFLA["BFLA Endpoint<br/>POST /admin/access-keys/revoke"]
            MASS["Mass Assignment Endpoint<br/>PATCH /api/v1/users/me"]
            SSRF["SSRF Endpoint<br/>POST /api/v1/fetch-avatar"]
        end

        subgraph ORACLE_APP["apps/oracle/ (Ground-Truth Evaluator)"]
            EVAL["OracleEvaluator.evaluate()<br/>(Inspects URL, Status & Response Payload)"]
            KPI["KPIScorecard & AssessmentEvaluation<br/>(Calculates Transfer Score & Completion)"]
        end

        subgraph AUTH_APP["apps/api_sec/ (Authentication & Users)"]
            AUTH["JWT Auth & User Profiles"]
        end
    end

    %% Interactions
    UI -->|1. Opens Lab & Configures Payload| RB
    RB -->|2. Manual REST HTTP Request (JSON)| VUN_APP
    VUN_APP -->|3. Vulnerable Data / Flag Response| RB
    RB -->|4. Submits Request Logs for Verification| EVAL
    EVAL -->|5. Compares Rules & Updates| KPI
    UI <-->|6. Asks Lab Hints / Text Queries| QA

    %% Styling
    style FRONTEND fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff
    style BACKEND fill:#090d16,stroke:#ff9800,stroke-width:2px,color:#fff
    style VUN_APP fill:#1e293b,stroke:#ef4444,stroke-width:1px,color:#fff
    style ORACLE_APP fill:#1e293b,stroke:#10b981,stroke-width:1px,color:#fff
    style AUTH_APP fill:#1e293b,stroke:#6366f1,stroke-width:1px,color:#fff
```

## Detailed Description of Existing Architecture
1. **Frontend Layer (`src/`)**: Built with React & Vite. Students navigate lab exercises and use an HTTP Request Builder workspace to manually construct requests (`GET`, `POST`, `PATCH`, `DELETE`).
2. **Vulnerable Service App (`server/apps/vulnerable_service/`)**: Exposes REST endpoints simulating OWASP API Top 10 vulnerabilities (BOLA, BFLA, Mass Assignment, SSRF).
3. **Ground-Truth Oracle Evaluator (`server/apps/oracle/`)**: Inspects HTTP status codes and JSON response bodies to objectively score student submissions.
4. **Passive AI Assistant (`QwenFloatingAssistant.jsx`)**: Connects to a local Ollama instance (`qwen2.5-coder`) to provide text-based hints and recommendations.
