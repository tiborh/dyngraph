# Improvement Ideas

This document exposes the improvement_ideas tracked during development. It is a direct, human-readable export of the ideas recorded in the project session database.

| id | title | priority | effort | status | description |
| --- | --- | --- | --- | --- | --- |
| fix-label-placement | Improve Label Formatting & Placement | high | high | pending | Automate label placement logic; current manual-only approach produces ugly results. Also fix label repositioning on settings restore. |
| fix-firefox-compat | Fix Firefox Compatibility Issues | high | medium | pending | Resolve control layout breakage and unreliable button inactivation in Firefox. Currently only ~70% functional. |
| standalone-build | Create Standalone Offline Build | low | high | pending | Bundle as desktop app (Electron) or progressive web app for offline use and easier distribution. |
| interactive-tutorials | Interactive Tutorials/Presets | low | high | pending | Add guided tours or preset configurations for common use cases (social networks, molecular structures, etc.). |
| settings-versioning | Version & Export Settings | low | low | pending | Allow explicit export/import of graph configurations and physics parameters; not just browser localStorage. Add version info to saved configs. |
| docs-code-comments | Improve Code Documentation | low | low | pending | Add JSDoc comments to class methods; document physics formulas and algorithm complexity. |
| backlink-forces | Asymmetric Forces on Links vs Backlinks | low | medium | pending | Implement different attraction/repulsion forces for forward vs backward edges. May create interesting swirling patterns. |
| color-animations | Animated Color Changes | low | medium | pending | Implement sine-function-controlled color animations. Allow nodes to change color based on time or state. |
| improved-input-formats | Support More Graph Formats | low | medium | pending | Add support for GML, GraphML, DOT, or other standard graph formats beyond current edge list + Sedgewick. |
| safari-support | Add Safari Compatibility | low | medium | pending | Test and fix Safari-specific issues. Currently not recommended; browser support would expand audience. |
| unit-tests | Add Unit Testing Framework | low | medium | pending | Introduce Jest or similar for testing Graph, Node, and algorithm logic. Currently no automated tests. |
| perf-large-graphs | Optimize for Large Graphs | medium | high | pending | Improve performance for graphs beyond 1000 nodes. O(n²) repulsion calculations are bottleneck. Consider spatial partitioning or force-directed algorithm optimizations. |
| seed-random | Seeded Random Number Generation | medium | low | pending | Implement seedable RNG (e.g., seedrandom library) so graph simulations can be reproduced. Currently Math.random() cannot be seeded. |
| node-size-by-group | Configurable Node Size/Color by Group | medium | low | pending | Allow node size and color to be set per-group, not just individually. Would help with group visualization. |
| graph-algorithms | Add Missing Graph Algorithms | medium | medium | pending | Implement shortest path, spanning tree, strongly connected components, etc. Current set only has basic connectivity checks. |
| force-balance | Better Force Balance Tuning | medium | medium | pending | Improve default physics parameters; help users find stable equilibrium. Could add presets for different graph types. |

To propose changes or claim an item, open a GitHub issue referencing the item id above (for example: `#fix-label-placement`).
