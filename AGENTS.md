# AGENTS.md

## Project context
This is a mock "actionable inventory dashboard" for retail HQ decision makers
(e.g. central inventory planning / merchandising teams).

The goal is not visualization, but to demonstrate a realistic decision loop:
identifying inventory issues, taking actions, recording them, and evaluating outcomes.

No external integrations.
Mock data + browser localStorage only.

---

## Review guidelines

### Core priorities
- Prioritize correctness and consistency of the full decision loop:
  **Action → Dashboard state update → Action log → KPI before/after → Auto-generated outcome comment**.
- Treat this repository as a *decision-support prototype*, not a BI report or UI showcase.

### P0 (must not break)
- Never break persistence: data stored in `localStorage` must survive reloads, and derived states must remain consistent.
- Actions must be reflected immediately in the dashboard state (badges, projected KPIs, status),
  without requiring a hard refresh.
- Action logs and outcome data must stay logically consistent with the dashboard view.

### P1 (strongly preferred)
- Recommendation, risk scoring, and priority logic must be deterministic and explainable
  (seeded randomness is acceptable).
- Evaluation logic must allow **neutral or worsened outcomes**; actions do not always succeed in reality.
- Favor actionability over UI polish:
  top-priority lists, clear rationale, and confirmation modals matter more than visual refinement.

### P2 (nice to have)
- Code style and naming consistency.
- Clear separation between domain logic (mock data, scoring, projections, evaluation)
  and UI components.

### Explicit constraints
- Do not add external services, APIs, authentication, or real production integrations.
- Do not use real brand names, real store names, or real company identifiers.
  Names should be *realistic but clearly dummy*.
- Prefer small, reviewable diffs.
  When refactoring, keep behavior unchanged and protect invariants.

---

## Commands
- Dev: `npm run dev`
- Test: none
- Lint / format: `npm run lint`
