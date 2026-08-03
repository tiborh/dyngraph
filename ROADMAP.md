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
- fix-firefox-compat: Firefox compatibility verified (30 e2e tests passing)
- fix-label-placement: Auto label placement with periodic recomputation
- perf-large-graphs: Optimized calc_forces (Set lookup, Newton's 3rd law, Manhattan skip)
- graph-algorithms: MST (Kruskal), bridges/articulations (Tarjan), Dijkstra (distance-weighted)
- force-balance: 7 force-balance presets for different graph topologies

## Next (medium priority)
- backlink-forces: Asymmetric forces on links vs backlinks (swirling patterns)
- color-animations: Animated color changes (sine-function controlled)
- improved-input-formats: Support GML/GraphML/DOT formats
- node-size-by-group: Configurable node size/color by group (expand existing)

## Low priority / Nice-to-have
- safari-support: Test and fix Safari-specific issues
- interactive-tutorials: Guided tours/presets for common use cases
- standalone-build: Bundle as Electron/PWA for offline use

## How to get involved
- See IMPROVEMENT_IDEAS.md for the canonical list of ideas and their IDs.
- Open issues referencing idea IDs for discussion or claim them via PRs.
- For development guidance (file layout, testing, and running the app) see .github/copilot-instructions.md.
