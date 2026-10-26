# KrishiSetu Autopilot: Self-Healing QA, Feature Manager & Safe Release Manual

`krishisetu-autopilot` is a comprehensive, project-local automation system created for the **KrishiSetu** platform. It provides automated feature audits, self-healing diagnostic repair loops, safe feature lifecycle management, and pre-push release safeguards.

---

## 1. Quick Command Reference

### NPM Scripts
```bash
# 1. Audit manifest against real codebase and DOM
npm run ks:audit

# 2. Comprehensive platform doctor & key workflow verifier
npm run ks:doctor

# 3. Pre-push release gate & FarmOps Sentinel report generator
npm run ks:prepush

# 4. Standard unit test suite
npm test
```

### Antigravity Agent Skill Invocations
* `/krishisetu-autopilot audit` — Discovers and reports real implementation status of all platform features.
* `/krishisetu-autopilot repair` — Diagnoses failing tests, traces root causes, and applies minimal safe drop-in fixes (max 5 iterations).
* `/krishisetu-autopilot add <feature description>` — Scaffolds, implements, tests, and registers a new feature adhering strictly to the forest green aesthetic.
* `/krishisetu-autopilot remove <feature ID>` — Analyzes dependencies, deprecates/removes orphaned elements, and verifies zero regression.
* `/krishisetu-autopilot release` — Executes full prepush audit and pushes agent-owned changes safely to the designated Git branch.

---

## 2. Directory Architecture

```
.
├── .agents/
│   ├── hooks.json                      # Antigravity lifecycle hooks configuration
│   └── skills/
│       └── krishisetu-autopilot/
│           └── SKILL.md                # Reusable Antigravity agent skill definition
├── docs/
│   ├── FEATURE_REGISTRY.md             # Human-readable feature catalogue & audit log
│   └── KRISHISETU_AUTOPILOT.md         # This operational manual
├── features/
│   └── feature-manifest.json           # Machine-readable source of truth for features
├── reports/
│   ├── audit-report.json               # Emitted by scripts/krishisetu-audit.mjs
│   ├── farmops-sentinel-report.json    # Emitted by scripts/krishisetu-prepush.mjs
│   └── farmops-sentinel-summary.md     # Markdown FarmOps Sentinel quality summary
└── scripts/
    ├── krishisetu-audit.mjs            # DOM integrity & manifest audit script
    ├── krishisetu-doctor.mjs           # End-to-end platform workflow verifier
    ├── krishisetu-prepush.mjs          # Release gatekeeper & secret scanner
    └── run-tests.mjs                   # Unit & arithmetic test suite (15 test suites)
```

---

## 3. Safe Feature Lifecycle (ADD & REMOVE)

### Adding a Feature
1. **Acceptance Criteria**: Define user role, UI container, and exact expected behavior.
2. **Design Constraints**:
   * Color palette: Forest Green (`#1b4332`), Natural Green (`#2d6a4f`), Warm Cream (`#fbf8f1`), Off-White, Charcoal (`#264653`).
   * **Never use**: Purple, violet, neon glow, sci-fi styling, or AI chatbots.
3. **Location Pinning**: Ground all geospatial distances to the JKLU anchor (`26.8378, 75.6499`).
4. **Automated Verification**:
   * Add assertion in `scripts/run-tests.mjs`.
   * Add entry in `features/feature-manifest.json` and `docs/FEATURE_REGISTRY.md`.
5. **Validation**: Run `npm run ks:doctor`.

### Removing a Feature
1. **Dependency Analysis**: Search codebase using `grep_search` to find all DOM IDs, imports, and handlers.
2. **Safe Deprecation**: If external modules depend on it, mark status as `"deprecated"` in `features/feature-manifest.json`.
3. **Focused Cleanup**: Remove only the specifically designated feature. Never touch unrelated features.
4. **Regression Run**: Run `npm run ks:doctor` to ensure no uncaught exceptions.

---

## 4. Git Push & Safeguards Policy

The pre-push script (`scripts/krishisetu-prepush.mjs`) enforces the following gates before any push:
1. **Zero Secret Leaks**: Checks `git status --porcelain` to ensure `.env`, secret tokens, or private credentials are never staged.
2. **All Tests Pass**: Unit tests (`npm test`) and build verification (`vite build`) must exit with code 0.
3. **No Unrelated Files**: Only agent-owned files explicitly related to the task are staged. Blind `git add .` is forbidden.
4. **Push Authorization**: If working on `main`, changes are committed cleanly. Direct force-pushes or history rewrites are strictly prohibited.
