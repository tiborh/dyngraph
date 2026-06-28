# ROADMAP

This ROADMAP summarizes planned work and priorities for the dyngraph project. For a detailed developer-oriented overview see .github/copilot-instructions.md.

## Completed (quick wins)
- Seeded RNG support (seedrandom integration and set_seed UI)
- JSDoc-style code comments added for Graph and Node
- Group-based styles (per-group color/size mapping and persistence)
- Versioned settings export/import
- Unit tests (Mocha + Chai) for core graph logic
- Playwright e2e smoke tests (Firefox) and Playwright config
- GitHub Actions CI to run unit and e2e tests with caching

## Next (high priority)
- fix-label-placement: Improve label formatting & placement (high effort)
- fix-firefox-compat: Finalize Firefox compatibility checks and polish (medium effort)

## Medium-term
- perf-large-graphs: Optimize physics (spatial partitioning, Barnes-Hut, etc.)
- graph-algorithms: Add shortest path, MST, SCC and other algorithms
- force-balance: Tune/default presets for stable layouts

## Low priority / Nice-to-have
- node-size-by-group: Allow group-driven size/color
- color-animations: Add animated color schemes
- improved-input-formats: Support GML/GraphML/DOT
- interactive-tutorials and standalone builds

## How to get involved
- See IMPROVEMENT_IDEAS.md for the canonical list of ideas and their IDs.
- Open issues referencing idea IDs for discussion or claim them via PRs.
- For development guidance (file layout, testing, and running the app) see .github/copilot-instructions.md.

