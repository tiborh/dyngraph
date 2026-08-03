/**
 * PERFORMANCE NOTES — Force Calculation Optimization Approaches
 * ==============================================================
 *
 * The main performance bottleneck in force-directed graph layouts is the
 * all-pairs repulsion calculation: every unconnected node pair must be
 * checked for proximity. Three optimization strategies exist:
 *
 * OPTION A — Spatial Grid (uniform partitioning)
 * -----------------------------------------------
 * Divide the canvas into cells of size dist_threshold. Each frame, bin
 * nodes into grid cells (O(n)). For repulsion, only check nodes in the
 * same cell + 8 neighbors. Effective complexity: O(n × k) where k is
 * the average number of nodes per local neighborhood.
 * Pros: Simple, cache-friendly, works well when dist_threshold is fixed.
 * Cons: Degrades to O(n²) if all nodes cluster in a small area.
 * Best for: Graphs up to ~5000 nodes with a fixed interaction radius.
 *
 * OPTION B — Barnes-Hut (quadtree approximation)
 * ------------------------------------------------
 * Build a quadtree of node positions each frame (O(n log n)). When
 * computing repulsion for a node, traverse the tree: if a group of
 * distant nodes subtends a small angle (width/distance < θ, typically
 * θ ≈ 0.7), treat the group as a single body at their center of mass.
 * Effective complexity: O(n log n) per frame.
 * Pros: Handles any distribution gracefully, scales to 10k+ nodes.
 * Cons: More code (~100-150 lines), tree rebuilds add constant overhead.
 * Best for: Graphs with 5000–100000 nodes, or non-uniform distributions.
 *
 * OPTION C — Quick Wins (currently implemented)
 * -----------------------------------------------
 * 1. Parallel Set (adjSet) for O(1) adjacency lookup instead of
 *    Array.includes() which is O(degree).
 * 2. Upper-triangle iteration: compute each unconnected pair once and
 *    apply Newton's 3rd law symmetrically (halves pair iterations).
 * 3. Manhattan distance pre-filter: skip pairs where |dx| or |dy|
 *    alone exceeds dist_threshold (avoids sqrt for far-away pairs).
 * 4. Connected forces iterated via adjacency list: O(edges), not O(n²).
 * Combined, these reduce constant factors by ~3-5× without changing
 * the asymptotic complexity (still O(n²/2) worst case for repulsion).
 * Best for: Moderate improvement up to ~2000 nodes.
 *
 * Migration path: If graphs grow beyond 2000 nodes, implement Option A
 * first (spatial grid). If distribution becomes highly non-uniform or
 * node count exceeds 5000, switch to Option B (Barnes-Hut).
 */

/**
 * Graph data structure with undirected edges and physics simulation support.
 * Maintains three mappings: nodes by index (ns), nodes by name (sn), and adjacency list (adj).
 * @class Graph
 */
class Graph {
    /**
    * Initialize a new graph.
    * @param {string} name - Identifier for the graph
    */
    constructor(name) {
       this.name = name;
	this.nu_vertices = 0;
	this.nu_edges = 0;
	this.counter = 0;
       this.ns = {};        // index -> Node mapping
	this.sn = {};        // name -> index mapping (reverse lookup)
	this.adj = {};       // adjacency list: index -> [connected indices]
	this.adjSet = {};    // adjacency sets: index -> Set (O(1) lookup)
	this.path = [];      // vertex indices for path visualization
	this.path_col = "#ff00ff";
	this.edges_overlay = [];  // [[v1,v2],...] edge pairs to highlight
	this.edges_overlay_col = "#00ff00";
	this.highlight_nodes = []; // vertex indices to highlight
	this.highlight_nodes_col = "#ff0000";
    }
    /**
    * Add a vertex (node) to the graph.
    * @param {Node} node - The Node object to add
    * @returns {number} The index assigned to this vertex
    */
    add_vertex(node) {
       this.ns[this.counter] = node;
	this.sn[node.name] = this.counter;
	this.adj[this.counter] = [];
	this.adjSet[this.counter] = new Set();
	++this.counter;
	++this.nu_vertices;
        return this.counter - 1;
    }
    /**
    * Remove a vertex by name.
    * @param {string} name - The name of the node to remove
    * @returns {boolean} True if removed, false if not found
    */
    rem_vertex_by_name(name) {
	if(this.sn[name]===undefined)
	    return false;
	return this.rem_vertex(this.sn[name]);
    }
    /**
    * Remove a vertex by index. Also removes all connected edges.
    * @param {number} ind - The index of the vertex to remove
    * @returns {boolean} True if removed, false if not found
    */
    rem_vertex(ind) {
	if(!Object.keys(this.ns).includes(ind.toString()))
	    return false;
	delete this.sn[this.ns[ind].name];
	delete this.ns[ind];
	this.rem_edges(ind);
	delete this.adj[ind];
	delete this.adjSet[ind];
	--this.nu_vertices;
	return true;
    }
    /**
    * Remove all edges connected to a vertex.
    * @param {number} ind - The vertex index
    * @private
    */
    rem_edges(ind) {
	for(let i = this.adj[ind].length - 1; i > -1; --i)
	    this.rem_edge(ind,this.adj[ind][i]);
    }
    /**
    * Add an undirected edge between two vertices (creates bidirectional connection).
    * @param {number} v1 - First vertex index
    * @param {number} v2 - Second vertex index
    * @returns {boolean} True if edge added, false if already connected or v1==v2
    */
    add_edge(v1,v2) {
	if(v1 == v2)
	    return false;
	if(this.is_connected(v1,v2))
	    return false;
	this.add_uni_edge(v1,v2);
	this.add_uni_edge(v2,v1);
	return true;
    }
    /**
    * Remove an undirected edge (removes both directions).
    * @param {number} v1 - First vertex index
    * @param {number} v2 - Second vertex index
    * @returns {boolean} True if removed, false if edge didn't exist
    */
    rem_edge(v1,v2) {
	if(!this.is_connected(v1,v2))
	    return false;
	this.rem_uni_edge(v1,v2);
	if (v1 != v2)
	    this.rem_uni_edge(v2,v1);
	return true;
    }
    /**
    * Add a directional edge (internal; use add_edge for undirected).
    * @param {number} v1 - Source vertex
    * @param {number} v2 - Target vertex
    * @private
    */
    add_uni_edge(v1,v2) {
	this.adj[v1].push(Number(v2));
	this.adjSet[v1].add(Number(v2));
	++this.nu_edges;
    }
    /**
    * Remove a directional edge (internal; use rem_edge for undirected).
    * @param {number} v1 - Source vertex
    * @param {number} v2 - Target vertex
    * @private
    */
    rem_uni_edge(v1,v2) {
	this.adj[v1].splice(this.adj[v1].indexOf(v2),1);
	this.adjSet[v1].delete(Number(v2));
	--this.nu_edges;
    }
    /**
    * Move a vertex to a new position.
    * @param {number} key - Vertex index
    * @param {number} xpos - New x coordinate
    * @param {number} ypos - New y coordinate
    */
    reposition_node(key,xpos,ypos) {
	this.ns[key].x = xpos;
	this.ns[key].y = ypos;
    }
    /**
    * Check if two vertices are connected (O(1) via Set lookup).
    * @param {number} index1 - First vertex index
    * @param {number} index2 - Second vertex index
    * @returns {boolean} True if connected, false otherwise
    */
    is_connected(index1,index2) {
	return(this.adjSet[index1].has(Number(index2)) || this.adjSet[index2].has(Number(index1)));
    }
    /**
    * Draw the current path stored in this.path array.
    * @private
    */
    draw_path() {
	for(let i = 1; i < this.path.length; ++i) {
	    let n0 = this.ns[this.path[i-1]];
	    let n1 = this.ns[this.path[i]];
	    n0.c2d.beginPath();
	    n0.c2d.strokeStyle = this.path_col;
	    n0.c2d.moveTo(n0.x,n0.y);
	    n0.c2d.lineTo(n1.x,n1.y);
	    n0.c2d.stroke();
	}
    }
    /**
    * Draw highlighted edge overlay (for MST, bridges, etc.).
    * @private
    */
    draw_edges_overlay() {
	if (this.edges_overlay.length === 0) return;
	const ctx = this.ns[Object.keys(this.ns)[0]].c2d;
	const savedWidth = ctx.lineWidth;
	ctx.lineWidth = 3;
	ctx.strokeStyle = this.edges_overlay_col;
	for (const [u, v] of this.edges_overlay) {
	    const n0 = this.ns[u], n1 = this.ns[v];
	    if (!n0 || !n1) continue;
	    ctx.beginPath();
	    ctx.moveTo(n0.x, n0.y);
	    ctx.lineTo(n1.x, n1.y);
	    ctx.stroke();
	}
	ctx.lineWidth = savedWidth;
    }
    /**
    * Draw highlighted nodes (for articulation points, etc.).
    * Draws a ring around each highlighted node.
    * @private
    */
    draw_highlight_nodes() {
	if (this.highlight_nodes.length === 0) return;
	const ctx = this.ns[Object.keys(this.ns)[0]].c2d;
	const savedWidth = ctx.lineWidth;
	ctx.lineWidth = 3;
	ctx.strokeStyle = this.highlight_nodes_col;
	for (const idx of this.highlight_nodes) {
	    const n = this.ns[idx];
	    if (!n) continue;
	    ctx.beginPath();
	    ctx.arc(n.x, n.y, n.size0 + 5, 0, 2 * Math.PI);
	    ctx.stroke();
	}
	ctx.lineWidth = savedWidth;
    }
    /**
    * Draw all nodes and edges to the canvas.
    * @param {object} params - Node drawing parameters (from node_params)
    * @param {boolean} draw_trace - Whether to draw trace lines
    * @param {boolean} draw_labels - Whether to draw node labels
    * @param {boolean} auto_labels - Whether to use per-node auto label offsets
    */
    draw(params,draw_trace,draw_labels,auto_labels) {
        for (let i in this.ns) {
            Node.draw(this.ns[i],params,draw_trace,draw_labels,auto_labels);
	    for (let j of this.adj[i])
		if (j < i)
		    this.constructor.draw_edge(this.ns[i],this.ns[j],params,draw_trace,draw_labels);
        }
	this.draw_path();
	this.draw_edges_overlay();
	this.draw_highlight_nodes();
    }
    /**
    * Calculate physics forces for all nodes (attraction/repulsion).
    * Optimized: uses Newton's 3rd law (each pair computed once),
    * Set-based O(1) adjacency lookup, and Manhattan distance pre-filter.
    * Time complexity: O(n²/2) pair iterations + O(edges) for connected forces.
    */
    calc_forces() {
        const keys = Object.keys(this.ns);
	const n = keys.length;
        for (let idx = 0; idx < n; idx++) {
            this.ns[keys[idx]].reset_force();
        }
	// Connected forces: iterate adjacency lists (O(edges) total)
	for (let idx = 0; idx < n; idx++) {
	    const i = keys[idx];
	    for (const j of this.adj[i]) {
		if (j > i) { // process each undirected edge once
		    this.ns[i].add_force_connected(this.ns[j]);
		    this.ns[j].add_force_connected(this.ns[i]);
		}
	    }
	}
	// Unconnected repulsion: iterate upper triangle (i < j)
	const threshold = node_params.dist_threshold;
	for (let a = 0; a < n; a++) {
	    const i = keys[a];
	    const ni = this.ns[i];
	    for (let b = a + 1; b < n; b++) {
		const j = keys[b];
		if (this.adjSet[i].has(Number(j))) continue; // skip connected pairs
		const nj = this.ns[j];
		// Manhattan distance pre-filter (cheaper than Euclidean)
		const mdx = Math.abs(ni.x - nj.x);
		if (mdx >= threshold) continue;
		const mdy = Math.abs(ni.y - nj.y);
		if (mdy >= threshold) continue;
		// Full Euclidean check
		const dist = Math.sqrt(mdx * mdx + mdy * mdy);
		if (dist >= threshold || dist === 0) continue;
		// Apply repulsion symmetrically (Newton's 3rd law)
		const fx = (ni.x - nj.x) / dist;
		const fy = (ni.y - nj.y) / dist;
		ni.fx += fx;
		ni.fy += fy;
		nj.fx -= fx;
		nj.fy -= fy;
	    }
	}
    }
    /**
    * Perform one animation step: calculate forces and update node positions.
    */
    step() {
        this.calc_forces();
        for(let a_key in this.ns) {
            this.ns[a_key].step();
        }
    }
    /**
    * Update node colors (applies to all nodes).
    * @param {object} cols - Color object with CSS color values
    * @param {object} rnd - Random color flags for each color type
    */
    refresh_colours(cols,rnd) {
	for(let a_key in this.ns)
	    this.ns[a_key].refresh_colours(cols,rnd);
    }
    /**
    * Nudge all nodes in a direction.
    * @param {string} dir - Direction: 'up', 'down', 'left', 'right'
    */
    nudge(dir) {
	for(let a_key in this.ns) {
	    switch(dir) {
	    case 'up':
		this.ns[a_key].move_up();
		break;
	    case 'down':
		this.ns[a_key].move_down();
		break;
	    case 'left':
		this.ns[a_key].move_left();
		break;
	    case 'right':
		this.ns[a_key].move_right();
		break;
	    default:
		console.log("Undefined direction: " + dir);
	    }
        }
    }
    resize_nodes(new_size0,new_size1) {
	for (let a_key in this.ns) {
            this.ns[a_key].size0=Number(new_size0);
	    this.ns[a_key].size1=Number(new_size1);
        }
    }
    /**
    * Compute per-node label offsets based on neighbor directions.
    * Places each label away from the densest cluster of edges.
    * Called periodically (not every frame) to keep CPU cost low.
    */
    updateLabelPositions() {
	const MARGIN = 8; // extra pixels beyond node size
	const keys = Object.keys(this.ns);
	const n = keys.length;
	if (n === 0) return;

	// Phase 1: compute ideal offset direction for each node
	for (let i = 0; i < n; i++) {
	    const key = keys[i];
	    const node = this.ns[key];
	    const neighbors = this.adj[key];
	    let avg_dx = 0, avg_dy = 0;

	    if (neighbors && neighbors.length > 0) {
		for (const j of neighbors) {
		    const other = this.ns[j];
		    if (!other) continue;
		    const dx = other.x - node.x;
		    const dy = other.y - node.y;
		    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
		    avg_dx += dx / dist;
		    avg_dy += dy / dist;
		}
		// Normalize average direction
		const mag = Math.sqrt(avg_dx * avg_dx + avg_dy * avg_dy) || 1;
		avg_dx /= mag;
		avg_dy /= mag;
		// Place label in opposite direction
		const offset_dist = node.size0 + MARGIN;
		node.label_dx = -avg_dx * offset_dist;
		node.label_dy = -avg_dy * offset_dist;
	    } else {
		// No neighbors: default to upper-right
		const offset_dist = node.size0 + MARGIN;
		node.label_dx = offset_dist * 0.7;
		node.label_dy = -offset_dist * 0.7;
	    }

	    // Set textAlign based on horizontal direction
	    if (node.label_dx < -2) {
		node.label_align = 'end';
	    } else if (node.label_dx > 2) {
		node.label_align = 'start';
	    } else {
		node.label_align = 'center';
	    }
	}

	// Phase 2: simple overlap nudge (2 iterations max)
	// Approximate label bounding box as 50x14 pixels
	const LBL_W = 50, LBL_H = 14;
	for (let iter = 0; iter < 2; iter++) {
	    for (let i = 0; i < n; i++) {
		const ni = this.ns[keys[i]];
		const ax = ni.x + ni.label_dx;
		const ay = ni.y + ni.label_dy;
		for (let j = i + 1; j < n; j++) {
		    const nj = this.ns[keys[j]];
		    const bx = nj.x + nj.label_dx;
		    const by = nj.y + nj.label_dy;
		    // Check overlap (AABB)
		    const ox = LBL_W - Math.abs(ax - bx);
		    const oy = LBL_H - Math.abs(ay - by);
		    if (ox > 0 && oy > 0) {
			// Push apart along smaller overlap axis
			const push = 0.5;
			if (ox < oy) {
			    const sign = (ax < bx) ? -1 : 1;
			    ni.label_dx += sign * ox * push;
			    nj.label_dx -= sign * ox * push;
			} else {
			    const sign = (ay < by) ? -1 : 1;
			    ni.label_dy += sign * oy * push;
			    nj.label_dy -= sign * oy * push;
			}
		    }
		}
	    }
	}
    }
    unvisit_nodes() {
	for (let a_key in this.ns)
	    this.ns[a_key].unvisit();
    }
    get_edge_list(delim,quot) {
	let output_string = "";
	for(let i in this.adj) {
		for(let j of this.adj[i]) {
		    output_string += quot + this.ns[i].name + quot + delim + quot + this.ns[j].name + quot + "\n";
		    //console.log(output_string);
		}
	}
	return output_string;
    }
    static draw_edge(n0,n1,p,draw_trace,draw_labels) {
	if (!p.line_colour)
            n0.c2d.strokeStyle = draw_trace ? n0.tracelinecolour : n0.linecolour;
        n0.c2d.beginPath();
	const coords1 = Node.get_point(n0,n1);
	const coords2 = Node.get_point(n1,n0);
	n0.c2d.moveTo(coords1[0], coords1[1]);
	n1.c2d.lineTo(coords2[0], coords2[1]);
	if (!p.line_colour)
            n0.c2d.stroke();
    }
    static discover_a_group(gr,adji,group_colour,the_group,cols) {
	for(let ni of gr.adj[adji]) {
	    if (!gr.ns[ni].visited)
		the_group.push(ni);
	     else
		continue;
	    if (cols)
		this.colour_node(gr,ni,group_colour);
	    gr.ns[ni].visit();
	    this.discover_a_group(gr,ni,group_colour,the_group,cols);
	}
    }
    static discover_node_groups(gr,cols=true) {
	const groups = [];
	gr.unvisit_nodes();
	for(let a_key in gr.ns) {
	    if (gr.ns[a_key].visited)
		continue;
	    const a_group = [];
	    const group_col = get_next_safe_colour();
	    this.colour_node(gr,a_key,group_col);
	    a_group.push(a_key);
	    this.discover_a_group(gr,a_key,group_col,a_group,cols);
	    groups.push(a_group);
	}
	gr.unvisit_nodes();
	return(groups)
    }
    static colour_node(gr,ni,col) {
	gr.ns[ni].fillcolour = "#" + col;
	gr.ns[ni].linecolour = "#" + col;
    }
    static connect_node_groups_first(gr) {
	const islands = this.discover_node_groups(gr);
	for(let i = 1; i < islands.length; ++i) {
	    const ind1 = islands[i][0];
	    const ind2 = islands[i-1][0];
	    gr.add_edge(ind1,ind2);
	}
    }
    static sort_islands_by_length(islnds) {
	return islnds.sort((a,b) => b.length - a.length);
    }
    static connect_node_groups_rand(gr) {
	let islands = this.sort_islands_by_length(this.discover_node_groups(gr));
	while(islands.length > 1) {
	    const i0 = Math.floor(rng()*islands[0].length);
	    const i1 = Math.floor(rng()*islands[1].length);
	    const ind0 = islands[0][i0];
	    const ind1 = islands[1][i1];
	    gr.add_edge(ind0,ind1);
	    islands = this.sort_islands_by_length(this.discover_node_groups(gr,false));
	}
    }
    static connect_node_groups(gr,rnd_id) {
	document.getElementById(rnd_id).checked ? this.connect_node_groups_rand(gr) : this.connect_node_groups_first(gr);
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.Graph = Graph;
}
