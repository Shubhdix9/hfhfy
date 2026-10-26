---
name: krishisetu-autopilot
description: >-
  Self-healing QA, Feature Manager and Safe Release Agent for the KrishiSetu AgriTech platform.
  Audits repository features against the feature manifest, runs bounded repair loops, executes
  automated tests, manages features safely, and gates release pushes.
---

# KrishiSetu Autopilot: Self-Healing QA & Feature Management Protocol

`krishisetu-autopilot` is a project-local automation skill designed for the **KrishiSetu (कृषि सेतु)** Smart Agriculture Platform. It inspects real code, verifies feature behavior, diagnoses errors, implements bounded fixes, and enforces release gates.

---

## 1. Core Operating Constraints

When executing any mode of this skill:
1. **Design Integrity**: The platform UI strictly uses **forest green (`#1b4332`)**, **natural green (`#2d6a4f`)**, **white**, **warm cream (`#fbf8f1`)**, and **charcoal (`#264653`)**.  
   * **STRICT PROHIBITION**: Zero purple, violet, magenta, neon colors, glassmorphism, glowing borders, or sci-fi gradients.
2. **Zero AI Gimmicks**: Do not introduce any AI chatbots, AI diagnosis buttons, AI menus, or promotional copy.
3. **JKLU Geographic Anchor**: All location math must anchor to **JK Lakshmipat University (JKLU)**, Mahapura, Jaipur (`26.8378° N, 75.6499° E`).
4. **Authentic Photography**: All map pins and listing drawers must display real photographs of Indian farmland, Indian tractors, and Indian commercial transport vehicles.
5. **Truthful Data**: Never fabricate payment success or invent live external farmer datasets.
6. **Bounded Repair**: Maximum 5 attempts per issue. Never disable a test to make it pass.

---

## 2. Invocable Modes & Command Workflows

### Mode 1: `/krishisetu-autopilot audit`
* **Purpose**: Perform a deep static and functional audit of the entire repository against `features/feature-manifest.json`.
* **Execution Steps**:
  1. Read `features/feature-manifest.json` and `docs/FEATURE_REGISTRY.md`.
  2. Run `npm run ks:audit` to verify all DOM element IDs, routes, script dependencies, and data sources exist.
  3. Verify that zero purple/neon hex codes or AI promotional terms exist in HTML/CSS/JS.
  4. Emit the updated audit report in `reports/audit-report.json`.

### Mode 2: `/krishisetu-autopilot repair`
* **Purpose**: Self-healing diagnostic loop to fix discovered defects with minimal, justified code modifications.
* **Execution Loop (Max 5 Passes per Issue)**:
  ```
  Pass 1..5:
    1. Capture exact failing command, file, line number, and stack trace.
    2. Analyze root cause (inspect DOM, logic branch, or test assertion).
    3. Formulate minimal drop-in replacement.
    4. Apply fix using replace_file_content.
    5. Re-run failed test: npm test or npm run ks:doctor.
    6. IF passed -> Record fix in reports/changelog-repairs.md and break loop.
    7. IF failed 5 times -> HALT, log blocker in reports/, DO NOT PUSH.
  ```

### Mode 3: `/krishisetu-autopilot add <feature>`
* **Purpose**: Safely implement a new feature following KrishiSetu architectural standards.
* **Execution Steps**:
  1. Define acceptance criteria and user persona (Farmer, Buyer, Transporter, Admin).
  2. Create/update UI elements in `index.html` adhering strictly to the forest green/cream palette.
  3. Implement modular state and logic under `src/` or `src/modules/`.
  4. Wire event listeners and window exports in `src/main.js`.
  5. Add unit and integration assertions in `scripts/run-tests.mjs`.
  6. Register the new feature entry in `features/feature-manifest.json` and `docs/FEATURE_REGISTRY.md`.
  7. Run `npm run ks:doctor` to verify zero regressions.

### Mode 4: `/krishisetu-autopilot remove <feature>`
* **Purpose**: Safely deprecate or remove a feature without breaking dependent modules.
* **Execution Steps**:
  1. Perform a full `grep_search` across `index.html`, `src/`, `api/`, and `scripts/` to map all callers and event handlers.
  2. If dependent features exist, mark as `deprecated` in `features/feature-manifest.json` first.
  3. Cleanly remove orphaned DOM nodes and JS event listeners.
  4. Update `scripts/run-tests.mjs` and remove dead assertions.
  5. Run `npm run ks:doctor` to confirm no uncaught reference errors or broken layouts remain.

### Mode 5: `/krishisetu-autopilot release`
* **Purpose**: Complete release verification gate and safe Git publishing.
* **Execution Steps**:
  1. Run `npm run ks:prepush`. This executes:
     * Full feature audit (`npm run ks:audit`).
     * Comprehensive health check (`npm run ks:doctor`).
     * Unit & regression test suite (`npm test`).
     * Production build (`npm run build`).
     * Secret scan (verifying `.env`, API keys, or private tokens are not staged).
     * `git diff --check` for whitespace and merge conflict markers.
  2. If any check fails, abort release and report failure.
  3. Stage ONLY agent-owned files explicitly (avoiding `git add .`).
  4. Create descriptive commit message: `fix(platform): [summary of verified changes]`.
  5. Push to current branch only if remote permissions and authentication are verified.

---

## 3. Failure Escalation & Recovery Protocol

If an unexpected build error or test failure occurs:
* Check `reports/farmops-sentinel-report.json` for component-level breakdowns.
* Check Vite bundle logs for oversized module warnings or unclosed tags.
* Ensure Leaflet overlay containers have `z-index: 3000` to prevent being hidden beneath tile layers.
* Never reset git working trees destructively (`git reset --hard` and `git clean -fd` are prohibited).
