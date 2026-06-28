const elem = {
    delim: ",",
    delim2: " ",
    quote: '"',
    endl: "\n",
};
let g;
// Seeded random number generator
let rng = Math.random;
function set_seed(seed) {
    if (seed === "" || seed === null) {
        rng = Math.random;
    } else if (typeof seedrandom === 'function') {
        rng = seedrandom(seed);
    } else if (typeof Math.seedrandom === 'function') {
        rng = Math.seedrandom(seed);
    } else if (typeof window !== 'undefined' && typeof window.seedrandom === 'function') {
        rng = window.seedrandom(seed);
    } else {
        console.warn('seedrandom not available; falling back to Math.random');
        rng = Math.random;
    }
    // Re-shuffle safe colors with new seed
    safe_colours.sort((a,b) => Math.floor(rng()*2) == 1 ? -1 : 0);
    safe_colour_index = 0;
}
//let node_radius = 5;
const colours = {
    back_colour: "#171412", // 墨色 「すみいろ」
    fill_colour: "#48929B", // 浅葱色「あさぎいろ」
    font_colour: "#DC3023", // 猩々緋「しょうじょうひ」
    outline_col: "#1D697C", // 浅葱色「あさぎいろ」
    line_colour: "#86ABA5", // 水色「みずいろ」
    trc_fil_col: "#2B3736", // 鉄御納戸「てつおなんど」
    trc_oli_col: "#364141", // 御納戸色「おなんどいろ」
    trc_lin_col: "#344D56", // 熨斗目花色「のしめはないろ」
};
// function str_reverse(str) {
//     return str.split("").reverse().join("");
// }
// Group-based styling (allows per-group color and size overrides)
const group_styles = {};  // Map of group names to {fillcolour, size0, size1, ...}

/**
 * Add or update a group with custom styling.
 * @param {string} groupName - Name of the group
 * @param {object} style - Style object with color/size properties {fillcolour, size0, size1, etc.}
 */
function add_group(groupName, style) {
    group_styles[groupName] = style;
}

/**
 * Remove a group and unassign all nodes in it.
 * @param {string} groupName - Name of the group to remove
 */
function remove_group(groupName) {
    if (g) {
	for (let i in g.ns) {
	    if (g.ns[i].group === groupName) {
		g.ns[i].set_group(null);
	    }
	}
    }
    delete group_styles[groupName];
}

/**
 * Assign a node to a group.
 * @param {string} nodeName - Name of the node
 * @param {string} groupName - Name of the group
 */
function assign_node_to_group(nodeName, groupName) {
    if (!g || !g.sn[nodeName]) {
	console.log("Node not found: " + nodeName);
	return false;
    }
    const node_idx = g.sn[nodeName];
    g.ns[node_idx].set_group(groupName);
    return true;
}

/**
 * Get all nodes in a group.
 * @param {string} groupName - Name of the group
 * @returns {Node[]} Array of nodes in the group
 */
function get_group_nodes(groupName) {
    if (!g) return [];
    const nodes = [];
    for (let i in g.ns) {
	if (g.ns[i].group === groupName) {
	    nodes.push(g.ns[i]);
	}
    }
    return nodes;
}

const safe_colours = ["000000","000033","000066","000099","0000CC","0000FF","003300","003333","003366","003399","0033CC","0033FF","006600","006633","006666","006699","0066CC","0066FF","009900","009933","009966","009999","0099CC","0099FF","00CC00","00CC33","00CC66","00CC99","00CCCC","00CCFF","00FF00","00FF33","00FF66","00FF99","00FFCC","00FFFF","330000","330033","330066","330099","3300CC","3300FF","333300","333333","333366","333399","3333CC","3333FF","336600","336633","336666","336699","3366CC","3366FF","339900","339933","339966","339999","3399CC","3399FF","33CC00","33CC33","33CC66","33CC99","33CCCC","33CCFF","33FF00","33FF33","33FF66","33FF99","33FFCC","33FFFF","660000","660033","660066","660099","6600CC","6600FF","663300","663333","663366","663399","6633CC","6633FF","666600","666633","666666","666699","6666CC","6666FF","669900","669933","669966","669999","6699CC","6699FF","66CC00","66CC33","66CC66","66CC99","66CCCC","66CCFF","66FF00","66FF33","66FF66","66FF99","66FFCC","66FFFF","990000","990033","990066","990099","9900CC","9900FF","993300","993333","993366","993399","9933CC","9933FF","996600","996633","996666","996699","9966CC","9966FF","999900","999933","999966","999999","9999CC","9999FF","99CC00","99CC33","99CC66","99CC99","99CCCC","99CCFF","99FF00","99FF33","99FF66","99FF99","99FFCC","99FFFF","CC0000","CC0033","CC0066","CC0099","CC00CC","CC00FF","CC3300","CC3333","CC3366","CC3399","CC33CC","CC33FF","CC6600","CC6633","CC6666","CC6699","CC66CC","CC66FF","CC9900","CC9933","CC9966","CC9999","CC99CC","CC99FF","CCCC00","CCCC33","CCCC66","CCCC99","CCCCCC","CCCCFF","CCFF00","CCFF33","CCFF66","CCFF99","CCFFCC","CCFFFF","FF0000","FF0033","FF0066","FF0099","FF00CC","FF00FF","FF3300","FF3333","FF3366","FF3399","FF33CC","FF33FF","FF6600","FF6633","FF6666","FF6699","FF66CC","FF66FF","FF9900","FF9933","FF9966","FF9999","FF99CC","FF99FF","FFCC00","FFCC33","FFCC66","FFCC99","FFCCCC","FFCCFF","FFFF00","FFFF33","FFFF66","FFFF99","FFFFCC","FFFFFF"].sort((a,b) => Math.floor(rng()*2) == 1 ? -1 : 0 );
let safe_colour_index = 0;
let graph_algorithm = "r2r";
let animate;
let first_step;
let scatter = 0.8;
const scat = {
    x: 800,
    y: 800
};
const offs = {
    x: 100,
    y: 100,
};
let node_shape;
const node_size = {
    s0: 5,
    s1: 5
};
//const time_out = 10;
const jitter = 1;
const min_num = 0;
const off_pairs = {};
const rnd_pairs = {};
for (let a_key in colours) {
    off_pairs[a_key] = false;
    rnd_pairs[a_key] = false;
}
function get_next_safe_colour() {
    if(safe_colour_index == safe_colours.length)
	safe_colour_index = 0;
    return(safe_colours[safe_colour_index++]);
}
function reset_safe_colour_index(sel_box_id="sel_starting_safe_colour") {
    safe_colour_index = document.getElementById(sel_box_id).selectedIndex;
}
// function factorial(n) {
//     let fact=1;
    
//     for (let i = 2; i <= n; ++i)
//         fact *= i;
//     return fact;
// }
function full_connect_nu(n) {
    let nu_edges = 0;
    for(let i = 0; i < n; ++i)
	nu_edges += i;
    return nu_edges;
}
function nudge(dir) {
    g.nudge(dir);
}
function refresh_colours() {
    g.refresh_colours(colours,rnd_pairs);
}
function change_shape(sel_id) {
    const sels = document.getElementById(sel_id);
    const seli = sels.selectedIndex;
    node_shape = sels[seli].value;
}
function sync_back_shape_selection(sel_id) {
    const sels = document.getElementById(sel_id);
    for(let seli = 0; seli < sels.length; ++seli) {
	if(sels[seli].value == node_shape)
	    sels[seli].selected = true;
	else
	    sels[seli].selected = false;
    }
    sels.dispatchEvent(new Event('change',{bubbles:true}));
}
function gen_num(nmax,nmin=min_num) {
    if (nmax < nmin) {
	const tmp = nmax;
	nmax = nmin;
	nmin = tmp;
    }
    return(Math.floor((rng() * (nmax-nmin+1)) + nmin));
}
function gen_colour(type=2,alpha=0.9) {
    const red = gen_num(255);
    const green = gen_num(255);
    const blue = gen_num(255);
    let the_colour;
    switch(type) {
    case 0:
	the_colour = "#"+Number(red).toString(16).padStart(2,'0')+Number(green).toString(16).padStart(2,'0')+Number(blue).toString(16).padStart(2,'0');
	break;
    case 1:
	the_colour = "rgba("+red+","+green+","+blue+","+alpha+")";
	break;
    case 2:
	the_colour = "rgb("+red+","+green+","+blue+")";
	break;
    default:
	console.log("Invalid colour type: " + type);
    }
    return the_colour;
}
function resize_linewidth(sz) {
    c2d.lineWidth = sz;
}
function resize_nodes(sz_id0,sz_id1) {
    const sz0 = document.getElementById(sz_id0);
    let sz1 = document.getElementById(sz_id1);
    if (!sz1)
	sz1 = sz0;
    node_size.s0 = Number(sz0.value);
    node_size.s1 = Number(sz1.value);
    g.resize_nodes(node_size.s0,node_size.s1);
}
function sync_back_node_sizes(sz_id0,sz_id1) {
    const sz0 = document.getElementById(sz_id0);
    const sz1 = document.getElementById(sz_id1);
    sz0.value = Number(node_size.s0);
    if(sz1)
	sz1.value = Number(node_size.s1);
}
function update_scatter(scatter_value,c=canv) {
    scatter = Math.abs(Number(scatter_value) / 100);
    const sc_off = Math.abs(1 - scatter) / 2;
    scat.x = Math.round(c.width * scatter);
    scat.y = Math.round(c.height * scatter);
    offs.x = Math.round(c.width * sc_off);
    offs.y = Math.round(c.height * sc_off);
}
function set_graph_alg(a) {
    graph_algorithm = a;
}
function add_node_at_pos(gr,name,xpos,ypos,shape=node_shape,sz=node_size,cols=colours,rpairs=rnd_pairs,c=c2d) {
    gr.add_vertex(new Node(name,
			shape,
			sz.s0,
			sz.s1,
			cols,
			rpairs,
			xpos,
			ypos,
			c
		       )
	      );
}
function add_node_at_random_pos(gr,name,sc=scat,os=offs) {
    add_node_at_pos(gr,name,
		    rng()*sc.x+os.x,
		    rng()*sc.y+os.y);
}
function add_nodes_at_same_pos(gr,names,posx=0,posy=0) {
    const len = names.length;
    for(let i = 0; i < len; ++i)
	add_node_at_pos(gr,names[i],posx,posy);
}
function scatter_nodes(gr,sc=scat,os=offs) {
    for(let a_key in gr.ns)
	gr.reposition_node(a_key,rng()*sc.x+os.x,rng()*sc.y+os.y);
}
function hline_nodes(gr,jit=jitter,os=offs,c=canv) {
    const len = Object.keys(gr.ns).length;
    const vpos = c.height / 2;
    let vpos_mod = jit;
    const h_incr = (c.width - (2 * os.x))/len;
    let hpos = os.x;
    for(let a_key in gr.ns) {
	gr.reposition_node(a_key,hpos,vpos+vpos_mod);
	hpos+=h_incr;
	vpos_mod*=-1;
    }
    // for(let i = 0; i < len; hpos+=h_incr,++i,vpos_mod*=-1)
    // 	gr.reposition_node(i,hpos,vpos+vpos_mod);
}
function vline_nodes(gr,jit=jitter,os=offs,c=canv) {
    const len = Object.keys(gr.ns).length;
    const hpos = c.width / 2;
    let hpos_mod = jit;
    const v_incr = (c.height - (2 * os.y))/len;
    let vpos = os.y;
    for(let a_key in gr.ns) {
	gr.reposition_node(a_key,hpos+hpos_mod,vpos);
	vpos+=v_incr;
	hpos_mod*=-1;
    }
    // for(let i = 0; i < len; vpos+=v_incr,++i,hpos_mod*=-1)
    // 	gr.reposition_node(i,hpos+hpos_mod,vpos);
}
function lrdiagonal_nodes(gr,jit=jitter,os=offs,c=canv) {
    const len = Object.keys(gr.ns).length;
    const v_incr = (c.height - (2 * os.y))/len;
    const h_incr = (c.width - (2 * os.x))/len;
    let vpos = os.y;
    let hpos = os.x;
    let hpos_mod = jit;
    for(let a_key in gr.ns) {
	gr.reposition_node(a_key,hpos+hpos_mod,vpos);
	vpos+=v_incr;
	hpos+=h_incr;
	hpos_mod*=-1;
    }
    // for(let i = 0; i < len; vpos+=v_incr,hpos+=h_incr,++i,hpos_mod*=-1)
    // 	gr.reposition_node(i,hpos+hpos_mod,vpos);
}
function x_nodes(gr,os=offs,c=canv) {
    const len = Object.keys(gr.ns).length;
    const v_incr = (c.height - (2 * os.y))/len;
    const h_incr = (c.width - (2 * os.x))/len;
    let vpos = os.y;
    let hpos1 = os.x;
    let hpos2 = c.width-os.x;
    let i = 0;
    for(let a_key in gr.ns) {
	gr.reposition_node(a_key,(i % 2 == 0) ? hpos1 : hpos2,vpos);
	i++;
	vpos+=v_incr;
	hpos1+=h_incr;
	hpos2-=h_incr;
    }
    // for(let i = 0; i < len; vpos+=v_incr,hpos1+=h_incr,hpos2-=h_incr,++i)
    // 	gr.reposition_node(i,(i % 2 == 0) ? hpos1 : hpos2,vpos);
}
class Point {
    constructor(x,y) {
	this.x = x;
	this.y = y;
    }
}
function get_point_on_circ(origin,radian,radius) {
    return(new Point(Math.round(origin.x + Math.cos(radian) * radius),
		     Math.round(origin.y + Math.sin(radian) * radius)));
}
function circular_nodes(gr,os=offs,c=canv) {
    const len = Object.keys(gr.ns).length;
    const o = new Point(c.width/2,c.height/2);
    const radius = (o.x < o.y) ? o.x - os.x : o.y - os.y;
    const rad_incr = (2 * Math.PI) / len;
    let radian = 0;
    for(let a_key in gr.ns) {
	const p = get_point_on_circ(o,radian,radius)
	gr.reposition_node(a_key,p.x,p.y);
	radian+=rad_incr;
    }
    // for(let i = 0; i < len; ++i,radian+=rad_incr) {
    // 	const p = get_point_on_circ(o,radian,radius)
    // 	gr.reposition_node(i,p.x,p.y);
    // }
}
function grid_nodes(gr,os=offs,c=canv) {
    const len = Object.keys(gr.ns).length;
    const keys = Object.keys(gr.ns);
    let vpos;
    let hpos = os.x;
    let num_max = Math.ceil(Math.sqrt(len));
    const v_incr = (c.height - 2 * os.y)/(num_max-1);
    const h_incr = (c.width - 2 * os.x)/(num_max-1);
    let n;
    for(let i = 0,n=0; i < num_max; hpos+=h_incr,++i)
	for(let j = 0,vpos = os.y; j < num_max && n<len; vpos+=v_incr,++j,++n)
	    gr.reposition_node(keys[n],Math.floor(hpos),Math.floor(vpos));
}
function make_namelist(n,l) {
    for(let i = 0; i < n; ++i)
	l.push('n'+i);
}
function add_nodes(g, num, namelist=[], new_nodes=true, sel_id="sel_nodeplace") {
    if (namelist.length == 0)
	make_namelist(num,namelist);
    if(new_nodes)
	add_nodes_at_same_pos(g,namelist);
    const sels = document.getElementById(sel_id);
    const seli = sels.selectedIndex;
    const how = sels[seli].value;
    switch(how) {
    case "scatter":
	scatter_nodes(g);
	break;
    case "hline":
	hline_nodes(g);
	break;
    case "vline":
	vline_nodes(g);
	break;
    case "lrdiagonal":
	lrdiagonal_nodes(g);
	break;
    case "x":
	x_nodes(g);
	break;
    case "o":
	circular_nodes(g);
	break;
    case "grid":
	grid_nodes(g);
	break;
    default:
	console.log("unrecognised placement method: " + how);
    }
}
function reposition_nodes(gr) {
    add_nodes(gr,0,[],false);
}
function rem_spec_chars(str_pair){
    for(let i in str_pair) {
	if(str_pair[i] == null || str_pair[i] == '')
            continue;
	str_pair[i] = str_pair[i].replace(/[^a-zA-Z0-9 _]/g, '');
    }
}
function proc_unquoted_csv(str,delim,endl) {
    const edges = str.split(endl);
    const split_edges = [];
    for (let i in edges) {
	const a_pair = edges[i].split(delim);
	if (a_pair.length != 2)
	    continue;
	split_edges.push(a_pair);
    }
    return(split_edges);
}
function proc_quoted_csv(str,quot,delim,endl) {
    const in_str = new String(str);
    const edge_list = [];
    //const inStr = new String(str);
    let in_quot = false;
    let line_arr = [];
    let item_str = "";
    //console.log("received: |" + str + "|");
    for (let ch of in_str) {
	//console.log("char: " + ch);
	if (ch == quot) {
	    in_quot = in_quot ? false : true;
	    continue;
	}
	if (in_quot) {
	    item_str += ch;
	    continue;
	}
	if (ch == delim) {
	    line_arr.push(item_str);
	    item_str = "";
	    continue;
	}
	if (ch == endl) {
	    line_arr.push(item_str);
	    item_str = "";
	    edge_list.push(line_arr);
	    line_arr = [];
	    continue;
	}
    }
    if(item_str.length > 0)
	line_arr.push(item_str);
    if(line_arr.length > 0)
	edge_list.push(line_arr);
    //console.table(edge_list);
    return edge_list;
}
function get_edge_list(quote=elem.quote,delim=elem.delim,endl=elem.endl) {
    let edgelist_str = area_edgelist.value.trim();
    const r = new RegExp("[" + quote + "]",'gm');
    const q = edgelist_str.match(r);
    //console.log("quote count: " + (!q ? 0 : q.length));
    
    return(!q ? proc_unquoted_csv(edgelist_str,delim,endl) : proc_quoted_csv(edgelist_str,quote,delim,endl));
}
function get_node_list(edges) {
    let nodes = [];
    for(let i in edges) {
	const a_pair = edges[i];
	//rem_spec_chars(a_pair);
	for(let j in a_pair)
	    if (nodes.indexOf(a_pair[j]) == -1)
		nodes.push(a_pair[j]);
    }
    return nodes;
}
function make_r2r_graph(nuno,nued) {
    const gr = new Graph('r2r'); 
    add_nodes(gr,nuno);
    const theoretical_max = full_connect_nu(nuno);
    const max_num = (nued <= theoretical_max) ? nued : theoretical_max;
    while(gr.nu_edges/2 < max_num) {
	let n1 = Math.floor(rng()*nuno);
	let n2 = Math.floor(rng()*nuno);
	gr.add_edge(n1,n2);
    }
    return(gr);
}
function make_r2r_all_graph(nuno,nued_id="nu_edges") {
    const gr = new Graph('r2r_all');
    add_nodes(gr,nuno);
    let ne = 0;
    for(let i = 0;i<nuno || Graph.discover_node_groups(gr,false).length > 1;++i) {
	let n1 = Math.floor(rng()*nuno);
	let n2 = Math.floor(rng()*nuno);
	if (gr.add_edge(n1,n2))
	    ++ne;
    }
    document.getElementById(nued_id).value = ne;
    return(gr);
}
function make_s2r_graph(nuno,nued) {
    const gr = new Graph('s2r');
    if (nuno == 0)
	return gr;
    add_nodes(gr,nuno);
    if (nuno == 1)
	return gr;
    const theoretical_max = full_connect_nu(nuno);
    const max_num = (nued <= theoretical_max) ? nued : theoretical_max;
    for(let n = 0;gr.nu_edges/2 < max_num;++n) {
	if (n == nuno)
	    n = 0;
	const n1 = n;
	let n2 = n1
	while (n2 == n1)
	    n2 = Math.floor(rng()*nuno);
	gr.add_edge(n1,n2);
    }
    return(gr);
}
function make_s2r_all_graph(nuno,nued_id="nu_edges") {
    const gr = new Graph('s2r_all');
    add_nodes(gr,nuno);
    let i = 0;
    let ne = 0;
    while(Graph.discover_node_groups(gr,false).length > 1) {
	let n2 = Math.floor(rng()*nuno);
	if (gr.add_edge(i++,n2))
	    ++ne;
	if (i == nuno)
	    i = 0;
    }
    document.getElementById(nued_id).value = ne;
    return(gr);
}
function make_a2a_graph(nuno) {
    const gr = new Graph('a2a');
    add_nodes(gr,nuno);

    for(let i = 0;i < nuno;++i)
	for (let j = i; j < nuno; ++j)
	     gr.add_edge(i,j);
	     
    return(gr);
}
function make_circular_graph(nuno) {
    const gr = new Graph('circular');
    add_nodes(gr,nuno);
    let i;
    for(i = 1; i < nuno; ++i)
	gr.add_edge(i-1,i);
    gr.add_edge(i-1,0);
    return(gr);
}
function make_central_graph(nuno) {
    const gr = new Graph('central');
    add_nodes(gr,nuno);
    for(let i = 1; i < nuno; ++i)
	gr.add_edge(0,i);
    return(gr);
}
function make_triangulated_graph(nuno) {
    const gr = new Graph('triangulated');
    add_nodes(gr,nuno);
    if (nuno <= 1)
	return(gr);
    gr.add_edge(0,1);
    let i;
    for(i = 2; i < nuno; ++i) {
	gr.add_edge(0,i);
	gr.add_edge(i-1,i);
    }
    gr.add_edge(i-1,1);
    return(gr);
}
function make_matrix_graph(nuno,nuno2) {
    const gr = new Graph('ladder');
    add_nodes(gr,nuno*nuno2);
    let n = 0;
    for(let i = 0; i < nuno; ++i) {
	for(let j = 0; j < nuno2; ++j,++n) {
	    if(j>0)
		gr.add_edge(n-1,n);
	    if(i>0)
		gr.add_edge(n-nuno2,n);
	}
    }
    return(gr);
}
function make_tree_graph(nuno,nubr,c=canv) {
    const gr = new Graph(Number(nubr).toString() + 'tree');
    add_nodes(gr,nuno);
    const queue = [];
    queue.push(0);
    for(let i = 1; i < nuno; ++i) {
	while(queue.length) {
	    const ni = queue.shift();
	    for(let b = 0; b < nubr && i < nuno; ++b,++i) {
		queue.push(i);
		gr.add_edge(ni,i);
	    }
	}
    }
    return(gr);
}
function make_el_graph() {
    const gr = new Graph('el');
    const edges = get_edge_list();
    const nodes = get_node_list(edges);
    add_nodes(gr,nodes.length,nodes);
    for(let i in edges) {
	if (edges[i].length != 2)
	    continue;
	gr.add_edge(nodes.indexOf(edges[i][0]),nodes.indexOf(edges[i][1]));
    }
    return(gr);
}
function update_global_alpha(nalpha) {
    c2d.globalAlpha = nalpha;
}
function start(c2d,nnodes,nnodes2,nedges,nbranches,nalpha,nued_id="nu_edges") {
    c2d.globalAlpha = nalpha;
    const num_nodes = nnodes;
    const num_nodes2 = nnodes2;
    const num_edges = nedges;
    const num_branches = nbranches;
    clear_canvas();
    switch(graph_algorithm) {
    case "r2r":
	g = make_r2r_graph(num_nodes,num_edges);
	break;
    case "s2r":
	g = make_s2r_graph(num_nodes,num_edges);
	break;
    case "a2a":
	g = make_a2a_graph(num_nodes);
	break;
    case "tree":
	g = make_tree_graph(num_nodes,num_branches);
	break;
    case "el":
	g = make_el_graph();
	sync_nu_nodes();
	break;
    case "circ":
	g = make_circular_graph(num_nodes);
	break;
    case "centr":
	g = make_central_graph(num_nodes);
	break;
    case "matr":
	g = make_matrix_graph(num_nodes,num_nodes2);
	break;
    case "tri":
	g = make_triangulated_graph(num_nodes);
	break;
    case "r2ra":
	g = make_r2r_all_graph(num_nodes);
	break;
    case "s2ra":
	g = make_s2r_all_graph(num_nodes);
	break;
    case "same":
	reposition_nodes(g);
	break;
    default:
	console.log("Invalid graph algorithm code: " + graph_algorithm);
    }
    sync_nu_edges();
    animate = cb_paused_start.checked ? false : true;
    animPhase();
}
function clear_canvas(from_x=0,
		      from_y=0,
		      to_x=canv.width,
		      to_y=canv.height,
		      ctx=c2d) {
    ctx.clearRect(from_x, from_y, to_x, to_y);
    if(!off_pairs.back_colour) {
	const saved_fillStyle = ctx.fillStyle;
	//ctx.fillStyle= rnd_pairs.back_colour ? gen_colour() : colours.back_colour;
	ctx.fillStyle= colours.back_colour;
	ctx.fillRect(from_x, from_y, to_x, to_y);
	ctx.fillStyle = saved_fillStyle;
    }
}
function stop() {
    animate = false;
}
function pause() {
    animate=false;
}
function go_on() {
    animate = true;
    animPhase();
}
function col_sel_change(sel_id) {
    const cb = document.getElementById('rnd_' + sel_id);
    const sel = document.getElementById(sel_id);
    sel.disabled = cb.checked ? true : false;
    rnd_pairs[sel_id] = cb.checked ? true : false;
    //console.log(v + " should change to " + (cb.checked ? true : false));
}
function col_off_change(sel_id) {
    const off_cb = document.getElementById(sel_id + "_off");
    const rnd_cb = document.getElementById("rnd_" + sel_id);
    const sel = document.getElementById(sel_id);
    if (off_cb.checked) {
	sel.disabled = true;
	rnd_cb.disabled = true;
	off_pairs[sel_id] = true;
    } else {
	sel.disabled = false;
	rnd_cb.disabled = false;
	off_pairs[sel_id] = false;
    }
    //console.log(v + " should change to " + (cb.checked ? true : false));
}
function anim_step() {
    if(!first_step) {
	if(tracer.checked)
	    g.draw(off_pairs,true,false);
	g.calc_forces();
	g.step();
	if(!tracer.checked)
	    clear_canvas();
    }
    g.draw(off_pairs,false,labelling.checked);
}
function animPhase() {
    anim_step();
    if (animate) {
	first_step = false;
        setTimeout(animPhase, node_params.anim_timeout);
    }
}
