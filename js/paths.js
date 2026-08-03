class BreadthFirstPathsIterative {
    marked;
    edge_to;
    queue;
    source;
    constructor(g,s) {
	this.source = s;
	this.marked = new Array(g.nu_vertices);
	for (let i = 0; i < this.marked.length; ++i)
	    this.marked[i] = false;
	this.marked[this.source] = true;
	this.edge_to = [];
	this.queue = [];
	this.queue.push(this.source);
	this.bfs(g);
    }
    bfs(g) {
	while(this.queue.length > 0) {
	    const vertex = this.queue.shift();
	    const adj = g.adj[vertex];
	    for(let w of adj)
		if (!this.marked[w]) {
		    this.edge_to[w] = vertex;
		    this.marked[w] = true;
		    this.queue.push(w);
		}
	}
    }
    has_path_to(w) { return this.marked[w]; }
    path_to(v) {
	if(!this.has_path_to(v)) return null;
	let path = [];
	for(let x = v; x != this.source; x = this.edge_to[x])
	    path.unshift(x);
	path.unshift(this.source);
	return path;
    }
}

/**
 * Union-Find (Disjoint Set) with path compression and union by rank.
 * Used internally by Kruskal's MST algorithm.
 */
class UnionFind {
    constructor(keys) {
	this.parent = {};
	this.rank = {};
	for (const k of keys) {
	    this.parent[k] = k;
	    this.rank[k] = 0;
	}
    }
    find(x) {
	if (this.parent[x] !== x)
	    this.parent[x] = this.find(this.parent[x]);
	return this.parent[x];
    }
    union(x, y) {
	const rx = this.find(x), ry = this.find(y);
	if (rx === ry) return false;
	if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
	else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
	else { this.parent[ry] = rx; this.rank[rx]++; }
	return true;
    }
}

/**
 * Kruskal's Minimum Spanning Tree using visual (Euclidean) distance as weight.
 * Returns an array of edge pairs [[v1,v2], ...] forming the MST.
 * Only spans the largest connected component if graph is disconnected.
 * @param {Graph} g - The graph instance
 * @returns {Array} Array of [v1, v2] index pairs forming the MST edges
 */
function kruskal_mst(g) {
    // Collect all undirected edges with distances as weights
    const edges = [];
    for (let i in g.adj) {
	for (const j of g.adj[i]) {
	    if (Number(j) > Number(i)) { // each undirected edge once
		const ni = g.ns[i], nj = g.ns[j];
		const dx = ni.x - nj.x, dy = ni.y - nj.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		edges.push({ u: Number(i), v: Number(j), w: dist });
	    }
	}
    }
    // Sort by weight (distance)
    edges.sort((a, b) => a.w - b.w);
    // Union-Find over all vertex keys
    const keys = Object.keys(g.ns).map(Number);
    const uf = new UnionFind(keys);
    const mst = [];
    for (const e of edges) {
	if (uf.union(e.u, e.v)) {
	    mst.push([e.u, e.v]);
	    if (mst.length === keys.length - 1) break;
	}
    }
    return mst;
}

/**
 * Find bridges (cut edges) and articulation points (cut vertices) in an
 * undirected graph using Tarjan's algorithm.
 * @param {Graph} g - The graph instance
 * @returns {{bridges: Array, articulations: Array}}
 *   bridges: array of [v1, v2] edge pairs
 *   articulations: array of vertex indices
 */
function find_bridges_and_articulations(g) {
    const keys = Object.keys(g.ns).map(Number);
    const disc = {}, low = {}, parent = {};
    const visited = new Set();
    const bridges = [];
    const articulationSet = new Set();
    let timer = 0;

    function dfs(u) {
	visited.add(u);
	disc[u] = low[u] = timer++;
	let children = 0;

	for (const v of g.adj[u]) {
	    if (!visited.has(v)) {
		children++;
		parent[v] = u;
		dfs(v);
		low[u] = Math.min(low[u], low[v]);

		// Bridge: no back-edge from subtree of v reaches above u
		if (low[v] > disc[u]) {
		    bridges.push([u, v]);
		}
		// Articulation point conditions:
		// 1. u is root with 2+ children
		// 2. u is not root and low[v] >= disc[u]
		if (parent[u] === undefined && children > 1) {
		    articulationSet.add(u);
		}
		if (parent[u] !== undefined && low[v] >= disc[u]) {
		    articulationSet.add(u);
		}
	    } else if (v !== parent[u]) {
		low[u] = Math.min(low[u], disc[v]);
	    }
	}
    }

    // Run DFS from each unvisited node (handles disconnected graphs)
    for (const k of keys) {
	if (!visited.has(k)) {
	    parent[k] = undefined;
	    dfs(k);
	}
    }

    return { bridges, articulations: Array.from(articulationSet) };
}

/**
 * Dijkstra's shortest path using Euclidean distance between connected
 * nodes as edge weight. This means the "cost" of traversing an edge is
 * the current physical distance between the two nodes on screen.
 *
 * @param {Graph} g - The graph instance
 * @param {number} source - Source vertex index
 * @returns {{dist: Object, prev: Object}}
 *   dist: map of vertex index -> shortest distance from source
 *   prev: map of vertex index -> previous vertex on shortest path
 */
function dijkstra(g, source) {
    const dist = {}, prev = {}, visited = new Set();
    const keys = Object.keys(g.ns).map(Number);

    for (const k of keys) {
	dist[k] = Infinity;
	prev[k] = null;
    }
    dist[source] = 0;

    // Simple O(V²) implementation (sufficient for interactive graphs)
    for (let count = 0; count < keys.length; count++) {
	// Find unvisited vertex with minimum distance
	let u = null, minDist = Infinity;
	for (const k of keys) {
	    if (!visited.has(k) && dist[k] < minDist) {
		minDist = dist[k];
		u = k;
	    }
	}
	if (u === null) break; // remaining vertices unreachable
	visited.add(u);

	// Relax edges from u
	for (const v of g.adj[u]) {
	    if (visited.has(v)) continue;
	    const nu = g.ns[u], nv = g.ns[v];
	    const dx = nu.x - nv.x, dy = nu.y - nv.y;
	    const weight = Math.sqrt(dx * dx + dy * dy);
	    const alt = dist[u] + weight;
	    if (alt < dist[v]) {
		dist[v] = alt;
		prev[v] = u;
	    }
	}
    }
    return { dist, prev };
}

/**
 * Reconstruct path from Dijkstra result.
 * @param {Object} prev - Previous-vertex map from dijkstra()
 * @param {number} target - Target vertex index
 * @returns {Array|null} Array of vertex indices from source to target, or null
 */
function dijkstra_path(prev, target) {
    if (prev[target] === null && target !== undefined) return null;
    const path = [];
    let current = target;
    while (current !== null) {
	path.unshift(current);
	current = prev[current];
    }
    return path.length > 0 ? path : null;
}

if (typeof globalThis !== 'undefined') {
    globalThis.BreadthFirstPathsIterative = BreadthFirstPathsIterative;
    globalThis.UnionFind = UnionFind;
    globalThis.kruskal_mst = kruskal_mst;
    globalThis.find_bridges_and_articulations = find_bridges_and_articulations;
    globalThis.dijkstra = dijkstra;
    globalThis.dijkstra_path = dijkstra_path;
}
