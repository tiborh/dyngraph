# DynGraph Copilot Instructions

## Project Overview

DynGraph is a vanilla JavaScript web-based visualization of dynamic graphs using node simulation with attraction/repulsion physics. It provides an interactive canvas-based interface for studying node grouping and graph behavior.

**Tech Stack:** Vanilla JavaScript (no build process, no package.json)

## Architecture

### Core Data Structure
- **Graph** (`graph.js`): Central data structure managing vertices and edges
  - `ns`: Object mapping vertex indices to Node objects
  - `sn`: Object mapping node names to indices (reverse lookup)
  - `adj`: Adjacency list storing edge connections
  - Methods: `add_vertex()`, `add_edge()`, `rem_vertex()`, `is_connected()`

### Modules
- **main.js**: Application logic, UI controls, color management, input parsing
- **graph.js**: Graph class with vertex/edge operations and path-finding
- **node.js**: Node physics simulation (forces, velocity, position updates)
- **paths.js**: Graph algorithms (connectivity, pathfinding)

### Physics Simulation
Node-level parameters in `node_params` object control simulation behavior:
- `link_max_length` / `link_min_length`: Desired edge length range
- `dist_modifier`, `large_dist_div`, `small_dist_div`: Force calculations
- `dist_threshold`: Distance at which different force rules apply
- `fx_multip`, `fy_multip`: Force multipliers for x/y axes
- `anim_timeout`: Animation frame delay (milliseconds)

Physics forces applied in `Node` class:
- Attraction: Links pull nodes together
- Repulsion: Nodes push away from each other based on distance
- Canvas updates run at `anim_timeout` intervals

### UI Integration
- Canvas element manages rendering; Node stores reference as `c2d` (2D context)
- HTML elements controlled via ID selectors (dropdowns, text areas)
- Configuration persists through browser localStorage via save/restore

### Input Formats
- **Edge list**: Quoted pairs with configurable delimiters (default: comma-separated)
  ```
  "node1","node2"
  "node2","node3"
  ```
- **Sedgewick format**: Direct input to graph
- Settings: JSON serialization for save/restore

## Key Conventions

### Naming & Identifiers
- Node names: String identifiers; indices are numeric
- DOM element IDs follow descriptive pattern: `sel_*` (selects), `area_*` (textareas), `nu_*` (numeric inputs)
- Global color object: `colours` (background, fill, font, outline, line, trace variants)

### Physics Parameters
- All modifiable at runtime through `modify_params()` function
- Range: No hard limits; test with typical values (see node.js defaults)
- Changes apply immediately to next animation frame

### Graph Algorithms
- Graph algorithms assume undirected edges (bidirectional adjacency lists)
- Node state: `visited` flag for traversal algorithms
- Path storage: `g.path` array holds vertex indices

### Performance Considerations
- Practical limits: ~1000 nodes, ~1500 edges
- Performance degrades with increased node count due to O(n²) repulsion calculations
- Canvas rendering is main bottleneck; optimize by reducing animation rate or node count

### Browser Compatibility
- **Primary:** Chromium-based browsers (full functionality)
- **Secondary:** Firefox (~70% functionality; layout issues with controls, unreliable button states)
- **Not recommended:** Safari, IE

### Known Limitations
- Manual label placement; automated formatting is absent
- Settings restoration doesn't correctly reposition labels
- No seeded random number generation (Math.random() cannot be seeded)

## Working with the Code

### Adding New Node Parameters
1. Add property to `node_params` object in `node.js`
2. Expose via HTML control (selector, input, etc.)
3. Call `modify_params()` on change event
4. Apply parameter in physics calculation (typically in Node update methods)

### Modifying Physics Forces
- Update force calculations in `Node` class methods
- Apply distance threshold logic where needed
- Test on graphs of varying sizes; watch for stability issues

### Adding Graph Algorithms
- Implement in `paths.js` or as Graph class methods
- Use adjacency lists (`g.adj[vertex]`) for connections
- Use `visited` flag for traversal tracking
- Return results as vertex index arrays or modify `g.path` for visualization

### Creating New Node Shapes
- Shape codes: `'c'` (circle), `'r'` (rectangle), `'s'` (square), `'t'` (triangle), etc.
- Define rendering in Node's draw method
- Square nodes require only `size0`; others use both `size0` and `size1`

### Adding UI Controls
1. Add HTML control (select, input, etc.) with descriptive ID
2. Create change event listener in `index.html` `<script>` section
3. Call relevant update function (`update_inp_vals()`, `update_node_params()`, etc.)

## Testing Approach

No automated test framework exists. Manual testing:
- Load various graph sizes to check performance
- Verify node grouping behavior with different force parameters
- Test in Chromium and Firefox; note any layout/interactivity issues
- Validate edge list parsing with different formats
- Check settings save/restore cycle

## File Organization

```
dyngraph/
├── index.html / dyngraph.html  # Main entry point
├── js/
│   ├── main.js                 # App logic & UI
│   ├── graph.js                # Graph data structure
│   ├── node.js                 # Node simulation
│   └── paths.js                # Algorithms
├── img/                         # Icons, favicon
├── example_edge_lists/          # Sample input data
└── README.md                    # Project overview
```

## Common Tasks

### Modify Force Behavior
Edit Node class force calculations in `node.js`. Use `node_params` for tunable values.

### Parse New Input Format
Update input parsing logic in `main.js`. Adapt delimiter/quoting logic for edge list format.

### Add Color Scheme
Extend `colours` object in `main.js`. Update selectors if adding new color type.

### Debug Graph State
Inspect `g.ns` (nodes), `g.adj` (adjacency), `g.sn` (name map) in browser console during runtime.

### Profile Performance
Reduce `anim_timeout` to see impact on responsiveness; increase node count to find practical limits.
