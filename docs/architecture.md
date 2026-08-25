# PayShield AI - System Architecture

## Overview
**PayShield AI** is an enterprise-grade payment risk scoring and AI forensic investigation prototype. It demonstrates a multi-stage risk evaluation pipeline combining deterministic rule checks, statistical behavioral baseline analysis, supervised machine learning risk classification, and automated Generative AI (Gemini 3.7) forensic investigations.

---

## High-Level Architecture Diagram

```
                                  [ INCOMING TRANSACTION ]
                                             │
                                             ▼
                             [ STAGE 1: INGESTION & PARSING ]
                     (Amount, Merchant, Geolocation, Device Fingerprint)
                                             │
                                             ▼
                        [ STAGE 2: FEATURE EXTRACTION (15 Features) ]
                      (Baseline Velocity, Amount Ratio, Hardware Delta)
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               │                             │                             │
               ▼                             ▼                             ▼
       [ STAGE 3: RULES ]           [ STAGE 4: BEHAVIOR ]         [ STAGE 5: ML GBDT ]
      (Deterministic Matrix)        (User Baseline Delta)        (Supervised Forest)
          [Weight: 40%]                 [Weight: 35%]                [Weight: 25%]
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             │
                                             ▼
                           [ STAGE 6: COMPOSITE RISK SYNTHESIS ]
                 Final Score = (0.40 * Rule) + (0.35 * Beh) + (0.25 * ML)
                                             │
                                             ▼
                          [ STAGE 7: POLICY DECISION ENGINE ]
                       (ALLOW / STEP_UP / MANUAL_REVIEW / HOLD)
                                             │
                                             ▼
                         [ STAGE 8: GEMINI 3.7 AI INVESTIGATOR ]
                     (Forensic Dossier Synthesis & Explainable XAI)
                                             │
                                             ▼
                         [ STAGE 9: ANALYST TRIAGE & COPILOT ]
                     (Interactive Dashboard, Alert Center, AI Chat)
```

---

## Architectural Principles

### 1. Deterministic Policy Separation
- **Policy Enforcement is 100% Deterministic**: Transaction blocking, step-up challenges, and manual review routing are strictly executed by hardcoded policy rules (`DecisionEngine`).
- **Generative AI Never Acts as a Gatekeeper**: The Gemini 3.7 AI agent acts purely as an Explainable AI (XAI) Forensic Investigator, synthesizing human-readable reports and answering analyst queries.

### 2. API Key Security & Server Isolation
- All LLM interactions (Gemini API) and ML inference execute exclusively within server-side endpoints (`/server/src/agents/geminiInvestigator.ts`).
- No API keys, credentials, or secrets are ever exposed to the client-side browser bundle.

### 3. Graceful Fallback Resilience
- If the Gemini API key is missing or the service is temporarily unreachable, the system automatically falls back to an offline deterministic forensic report without crashing or throwing unhandled errors in the UI.

### 4. Synthetic Data Integrity & Zero Leakage
- All transaction records and customer profiles are engineered synthetically using a pseudo-random number generator (Mulberry32, Seed 42).
- Predictive features are derived strictly from pre-transaction historical baselines and ingress payloads, guaranteeing zero target leakage.
