# PayShield AI — Intelligent Payment Risk & XAI Forensic Investigation Platform

PayShield AI is a fintech risk assessment and forensic investigation platform built with a multi-vector risk architecture combining **Deterministic Policy Enforcement (40%)**, **Behavioral Baseline Anomaly Profiling (35%)**, **Supervised Gradient Boosted Decision Trees (25%)**, and **Generative Forensic XAI Reasoning (Gemini 3.7)**.

> **Disclaimer:** PayShield AI operates on engineered synthetic transaction records and behavioral baselines for testing, portfolio evaluation, and benchmark demonstration purposes. It does not interface with real customer banking records.

---

## 1. Architectural Overview & Risk Pipeline

```
Transaction Event Ingress
       │
       ▼
Feature Engineering Vector (15 Features)
       │
  ┌────┴──────────────────────────┬────────────────────────┐
  ▼                               ▼                        ▼
Deterministic Rule Engine    Behavioral Anomaly Model    Supervised GBDT ML Model
(40% Weight, 7 Rules)        (35% Weight, Deviation)   (25% Weight, Trees & Gains)
  │                               │                        │
  └───────────────────────────────┼────────────────────────┘
                                  ▼
                   Composite Risk Synthesis Score (0–100)
             Score = (0.40 × Rule) + (0.35 × Beh) + (0.25 × ML)
                                  │
                                  ▼
                   Deterministic Policy Engine
          (ALLOW | STEP_UP | MANUAL_REVIEW | TEMPORARY_HOLD)
                                  │
                                  ▼
              Gemini 3.7 AI Forensic XAI Investigator
                 (Structured Intelligence Dossier)
```

---

## 2. Machine Learning Model Specifications

- **Architecture:** Supervised Gradient Boosted Decision Tree (GBDT) with gain-based tree splitting and Platt log-loss optimization.
- **Training Set:** 5,000 synthetic transaction records generated via seeded pseudo-random distribution (`Seed 42`) across fraud patterns (Account Takeover, Velocity Bursts, Device Spoofing, High-Value Wealth Baseline Spikes).
- **Inference Time:** `< 2.5 ms` in pure TypeScript/Node.js runtime without external binary dependencies.
- **Explainability (XAI):** Accumulated feature gain attribution producing per-transaction top predictive contributions.
- **Fallback Guarantee:** Automatic deterministic scoring fallback if model weights or tensors encounter runtime exceptions.

### 15-Feature Engineering Vector:
1. `amount`: Raw INR transaction value.
2. `amount_to_hist_ratio`: Ratio of current transaction to historical average.
3. `log_amount`: Natural log transformation.
4. `velocity_5m_count`: Count of transactions in the last 5 minutes.
5. `velocity_1h_count`: Count of transactions in the last 60 minutes.
6. `velocity_24h_amount`: Total cumulative spend in 24 hours.
7. `is_new_device`: Binary indicator for unverified hardware ID.
8. `is_foreign_country`: Geolocation shift outside home territory.
9. `is_high_risk_mcc`: Flag for cryptocurrency, bullion, gift cards, or high-risk MCC.
10. `is_night_time`: Nocturnal transaction window (00:00 - 05:00).
11. `account_age_days`: Age of account in days.
12. `lifetime_tx_count`: Total historical completed transactions.
13. `recent_failures_30d`: Failed/declined transactions count in last 30 days.
14. `hour_of_day`: Normalized diurnal cyclicity factor.
15. `user_risk_tier_encoded`: Customer tier weighting (LOW, STANDARD, HIGH_RISK, AFFLUENT_VIP).

---

## 3. Strict Separation of Concerns

1. **Policy Decisions are 100% Deterministic:** Financial hold and block gates are strictly executed by deterministic threshold rules.
2. **Generative AI is an Explainer (XAI):** Gemini 3.7 is invoked to synthesize forensic evidence, cite telemetry flags, and answer analyst queries, ensuring complete auditability and zero black-box automated blocking.
