<!-- SPECKIT START -->
Current plan: specs/004-manager-control-hub-integration/plan.md
This is the implementation plan for the Manager Control Hub integration — merging all 5 FloorPlan modules into star-app with a fresh InsForge database that matches the code exactly.

Read it for full technical context and to proceed to the tasks phase.

Available speckit commands in .hermes/cmds/:
  - speckit.constitution — Establish project principles
  - speckit.specify — Create a feature specification from a description
  - speckit.plan — Create implementation plan from the spec
  - speckit.tasks — Generate actionable tasks from the plan
  - speckit.implement — Execute implementation from tasks
  - speckit.clarify — Ask structured questions to de-risk ambiguous areas
  - speckit.analyze — Cross-artifact consistency & alignment report
  - speckit.checklist — Generate quality checklists
  - speckit.taskstoissues — Convert tasks to GitHub issues

When the user asks to run a speckit command (e.g., "/speckit.specify" or "run speckit.specify"), read the corresponding .md file from .hermes/cmds/ and follow its instructions step by step. Handoffs between commands (e.g., handoffs → agent: speckit.plan) mean loading the next command file from .hermes/cmds/.
<!-- SPECKIT END -->

## Active Feature: 004 — Manager Control Hub Integration

**Branch**: `004-manager-control-hub-integration`
**Spec**: `specs/004-manager-control-hub-integration/spec.md`
**Plan**: `specs/004-manager-control-hub-integration/plan.md`
**Data Model**: `specs/004-manager-control-hub-integration/data-model.md`
**Research**: `specs/004-manager-control-hub-integration/research.md`

### What's Being Built
1. **New InsForge database** on "Dond my first project" (2y542jyv) matching star-app schema
2. **New data layer** `src/data/insforge/` wired to new database
3. **Floor Plan Editor** from FloorPlan project — drag-and-drop canvas
4. **Menu CRUD** from FloorPlan — replaces adminApi.ts menu ops
5. **Pricing** from FloorPlan — inline in catalog inspector
6. **Promotions/Events** from FloorPlan — replaces adminApi.ts promos
7. **File Imports** from FloorPlan — CSV/images/docs

### Key Decisions
- Fresh database, not adapting to qr-restaurant-app's different schema
- Data model in data-model.md defines exact columns matching star-app types
- FloorPlan modules supersede overlapping star-app features
- Non-overlapping features (customer flow, kitchen, analytics, dine-in) preserved
