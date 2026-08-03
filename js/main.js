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
    // Guard: ensure rng is callable
    if (typeof rng !== 'function') {
        console.warn('seedrandom did not return a function; falling back to Math.random');
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

/**
 * Toggle mobile UI mode explicitly. Adds/removes 'mobile-ui' class on <body>
 * and persists the choice in localStorage so it survives reloads.
 * @param {boolean} enabled
 */
function set_mobile_ui(enabled) {
    if (typeof document === 'undefined') return;
    // add transition class to animate changes briefly
    document.body.classList.add('mobile-ui-transition');
    window.setTimeout(() => document.body.classList.remove('mobile-ui-transition'), 400);

    if (enabled)
        document.body.classList.add('mobile-ui');
    else
        document.body.classList.remove('mobile-ui');

    // sync all mobile ui checkboxes (prominent and panel)
    try {
        const cbs = document.querySelectorAll('#cb_mobile_ui, #cb_mobile_ui_top');
        cbs.forEach(cb => { try { cb.checked = !!enabled; } catch(e){} });
    } catch (e) {}

    try {
        localStorage.setItem('mobile_ui', enabled ? '1' : '0');
    } catch (e) {
        // ignore storage errors
    }
}


const safe_colours = ["000000","000033","000066","000099","0000CC","0000FF","003300","003333","003366","003399","0033CC","0033FF","006600","006633","006666","006699","0066CC","0066FF","009900","009933","009966","009999","0099CC","0099FF","00CC00","00CC33","00CC66","00CC99","00CCCC","00CCFF","00FF00","00FF33","00FF66","00FF99","00FFCC","00FFFF","330000","330033","330066","330099","3300CC","3300FF","333300","333333","333366","333399","3333CC","3333FF","336600","336633","336666","336699","3366CC","3366FF","339900","339933","339966","339999","3399CC","3399FF","33CC00","33CC33","33CC66","33CC99","33CCCC","33CCFF","33FF00","33FF33","33FF66","33FF99","33FFCC","33FFFF","660000","660033","660066","660099","6600CC","6600FF","663300","663333","663366","663399","6633CC","6633FF","666600","666633","666666","666699","6666CC","6666FF","669900","669933","669966","669999","6699CC","6699FF","66CC00","66CC33","66CC66","66CC99","66CCCC","66CCFF","66FF00","66FF33","66FF66","66FF99","66FFCC","66FFFF","990000","990033","990066","990099","9900CC","9900FF","993300","993333","993366","993399","9933CC","9933FF","996600","996633","996666","996699","9966CC","9966FF","999900","999933","999966","999999","9999CC","9999FF","99CC00","99CC33","99CC66","99CC99","99CCCC","99CCFF","99FF00","99FF33","99FF66","99FF99","99FFCC","99FFFF","CC0000","CC0033","CC0066","CC0099","CC00CC","CC00FF","CC3300","CC3333","CC3366","CC3399","CC33CC","CC33FF","CC6600","CC6633","CC6666","CC6699","CC66CC","CC66FF","CC9900","CC9933","CC9966","CC9999","CC99CC","CC99FF","CCCC00","CCCC33","CCCC66","CCCC99","CCCCCC","CCCCFF","CCFF00","CCFF33","CCFF66","CCFF99","CCFFCC","CCFFFF","FF0000","FF0033","FF0066","FF0099","FF00CC","FF00FF","FF3300","FF3333","FF3366","FF3399","FF33CC","FF33FF","FF6600","FF6633","FF6666","FF6699","FF66CC","FF66FF","FF9900","FF9933","FF9966","FF9999","FF99CC","FF99FF","FFCC00","FFCC33","FFCC66","FFCC99","FFCCCC","FFCCFF","FFFF00","FFFF33","FFFF66","FFFF99","FFFFCC","FFFFFF"].sort((a,b) => Math.floor(rng()*2) == 1 ? -1 : 0 );
let safe_colour_index = 0;

// Named CSS colours: common subset and full set
const named_colours_common = [
    {name:"black",hex:"000000"},{name:"white",hex:"FFFFFF"},
    {name:"red",hex:"FF0000"},{name:"green",hex:"008000"},{name:"blue",hex:"0000FF"},
    {name:"yellow",hex:"FFFF00"},{name:"cyan",hex:"00FFFF"},{name:"magenta",hex:"FF00FF"},
    {name:"orange",hex:"FFA500"},{name:"purple",hex:"800080"},{name:"pink",hex:"FFC0CB"},
    {name:"brown",hex:"A52A2A"},{name:"gray",hex:"808080"},{name:"grey",hex:"808080"},
    {name:"lime",hex:"00FF00"},{name:"navy",hex:"000080"},{name:"teal",hex:"008080"},
    {name:"olive",hex:"808000"},{name:"maroon",hex:"800000"},{name:"aqua",hex:"00FFFF"},
    {name:"silver",hex:"C0C0C0"},{name:"gold",hex:"FFD700"},{name:"coral",hex:"FF7F50"},
    {name:"salmon",hex:"FA8072"},{name:"khaki",hex:"F0E68C"},{name:"plum",hex:"DDA0DD"},
    {name:"violet",hex:"EE82EE"},{name:"indigo",hex:"4B0082"},{name:"crimson",hex:"DC143C"},
    {name:"tomato",hex:"FF6347"},{name:"tan",hex:"D2B48C"},{name:"sienna",hex:"A0522D"},
    {name:"orchid",hex:"DA70D6"},{name:"turquoise",hex:"40E0D0"},{name:"chartreuse",hex:"7FFF00"},
    {name:"chocolate",hex:"D2691E"},{name:"firebrick",hex:"B22222"},{name:"skyblue",hex:"87CEEB"},
    {name:"steelblue",hex:"4682B4"},{name:"slategray",hex:"708090"}
];
const named_colours_all = [
    {name:"aliceblue",hex:"F0F8FF"},{name:"antiquewhite",hex:"FAEBD7"},
    {name:"aqua",hex:"00FFFF"},{name:"aquamarine",hex:"7FFFD4"},
    {name:"azure",hex:"F0FFFF"},{name:"beige",hex:"F5F5DC"},
    {name:"bisque",hex:"FFE4C4"},{name:"black",hex:"000000"},
    {name:"blanchedalmond",hex:"FFEBCD"},{name:"blue",hex:"0000FF"},
    {name:"blueviolet",hex:"8A2BE2"},{name:"brown",hex:"A52A2A"},
    {name:"burlywood",hex:"DEB887"},{name:"cadetblue",hex:"5F9EA0"},
    {name:"chartreuse",hex:"7FFF00"},{name:"chocolate",hex:"D2691E"},
    {name:"coral",hex:"FF7F50"},{name:"cornflowerblue",hex:"6495ED"},
    {name:"cornsilk",hex:"FFF8DC"},{name:"crimson",hex:"DC143C"},
    {name:"cyan",hex:"00FFFF"},{name:"darkblue",hex:"00008B"},
    {name:"darkcyan",hex:"008B8B"},{name:"darkgoldenrod",hex:"B8860B"},
    {name:"darkgray",hex:"A9A9A9"},{name:"darkgreen",hex:"006400"},
    {name:"darkkhaki",hex:"BDB76B"},{name:"darkmagenta",hex:"8B008B"},
    {name:"darkolivegreen",hex:"556B2F"},{name:"darkorange",hex:"FF8C00"},
    {name:"darkorchid",hex:"9932CC"},{name:"darkred",hex:"8B0000"},
    {name:"darksalmon",hex:"E9967A"},{name:"darkseagreen",hex:"8FBC8F"},
    {name:"darkslateblue",hex:"483D8B"},{name:"darkslategray",hex:"2F4F4F"},
    {name:"darkturquoise",hex:"00CED1"},{name:"darkviolet",hex:"9400D3"},
    {name:"deeppink",hex:"FF1493"},{name:"deepskyblue",hex:"00BFFF"},
    {name:"dimgray",hex:"696969"},{name:"dodgerblue",hex:"1E90FF"},
    {name:"firebrick",hex:"B22222"},{name:"floralwhite",hex:"FFFAF0"},
    {name:"forestgreen",hex:"228B22"},{name:"fuchsia",hex:"FF00FF"},
    {name:"gainsboro",hex:"DCDCDC"},{name:"ghostwhite",hex:"F8F8FF"},
    {name:"gold",hex:"FFD700"},{name:"goldenrod",hex:"DAA520"},
    {name:"gray",hex:"808080"},{name:"green",hex:"008000"},
    {name:"greenyellow",hex:"ADFF2F"},{name:"honeydew",hex:"F0FFF0"},
    {name:"hotpink",hex:"FF69B4"},{name:"indianred",hex:"CD5C5C"},
    {name:"indigo",hex:"4B0082"},{name:"ivory",hex:"FFFFF0"},
    {name:"khaki",hex:"F0E68C"},{name:"lavender",hex:"E6E6FA"},
    {name:"lavenderblush",hex:"FFF0F5"},{name:"lawngreen",hex:"7CFC00"},
    {name:"lemonchiffon",hex:"FFFACD"},{name:"lightblue",hex:"ADD8E6"},
    {name:"lightcoral",hex:"F08080"},{name:"lightcyan",hex:"E0FFFF"},
    {name:"lightgoldenrodyellow",hex:"FAFAD2"},{name:"lightgray",hex:"D3D3D3"},
    {name:"lightgreen",hex:"90EE90"},{name:"lightpink",hex:"FFB6C1"},
    {name:"lightsalmon",hex:"FFA07A"},{name:"lightseagreen",hex:"20B2AA"},
    {name:"lightskyblue",hex:"87CEFA"},{name:"lightslategray",hex:"778899"},
    {name:"lightsteelblue",hex:"B0C4DE"},{name:"lightyellow",hex:"FFFFE0"},
    {name:"lime",hex:"00FF00"},{name:"limegreen",hex:"32CD32"},
    {name:"linen",hex:"FAF0E6"},{name:"magenta",hex:"FF00FF"},
    {name:"maroon",hex:"800000"},{name:"mediumaquamarine",hex:"66CDAA"},
    {name:"mediumblue",hex:"0000CD"},{name:"mediumorchid",hex:"BA55D3"},
    {name:"mediumpurple",hex:"9370DB"},{name:"mediumseagreen",hex:"3CB371"},
    {name:"mediumslateblue",hex:"7B68EE"},{name:"mediumspringgreen",hex:"00FA9A"},
    {name:"mediumturquoise",hex:"48D1CC"},{name:"mediumvioletred",hex:"C71585"},
    {name:"midnightblue",hex:"191970"},{name:"mintcream",hex:"F5FFFA"},
    {name:"mistyrose",hex:"FFE4E1"},{name:"moccasin",hex:"FFE4B5"},
    {name:"navajowhite",hex:"FFDEAD"},{name:"navy",hex:"000080"},
    {name:"oldlace",hex:"FDF5E6"},{name:"olive",hex:"808000"},
    {name:"olivedrab",hex:"6B8E23"},{name:"orange",hex:"FFA500"},
    {name:"orangered",hex:"FF4500"},{name:"orchid",hex:"DA70D6"},
    {name:"palegoldenrod",hex:"EEE8AA"},{name:"palegreen",hex:"98FB98"},
    {name:"paleturquoise",hex:"AFEEEE"},{name:"palevioletred",hex:"DB7093"},
    {name:"papayawhip",hex:"FFEFD5"},{name:"peachpuff",hex:"FFDAB9"},
    {name:"peru",hex:"CD853F"},{name:"pink",hex:"FFC0CB"},
    {name:"plum",hex:"DDA0DD"},{name:"powderblue",hex:"B0E0E6"},
    {name:"purple",hex:"800080"},{name:"rebeccapurple",hex:"663399"},
    {name:"red",hex:"FF0000"},{name:"rosybrown",hex:"BC8F8F"},
    {name:"royalblue",hex:"4169E1"},{name:"saddlebrown",hex:"8B4513"},
    {name:"salmon",hex:"FA8072"},{name:"sandybrown",hex:"F4A460"},
    {name:"seagreen",hex:"2E8B57"},{name:"seashell",hex:"FFF5EE"},
    {name:"sienna",hex:"A0522D"},{name:"silver",hex:"C0C0C0"},
    {name:"skyblue",hex:"87CEEB"},{name:"slateblue",hex:"6A5ACD"},
    {name:"slategray",hex:"708090"},{name:"snow",hex:"FFFAFA"},
    {name:"springgreen",hex:"00FF7F"},{name:"steelblue",hex:"4682B4"},
    {name:"tan",hex:"D2B48C"},{name:"teal",hex:"008080"},
    {name:"thistle",hex:"D8BFD8"},{name:"tomato",hex:"FF6347"},
    {name:"turquoise",hex:"40E0D0"},{name:"violet",hex:"EE82EE"},
    {name:"wheat",hex:"F5DEB3"},{name:"white",hex:"FFFFFF"},
    {name:"whitesmoke",hex:"F5F5F5"},{name:"yellow",hex:"FFFF00"},
    {name:"yellowgreen",hex:"9ACD32"}
];

// Build hex->name lookup map (uppercase hex keys)
function build_hex_to_name_map(list) {
    const map = {};
    for (const c of list) map[c.hex.toUpperCase()] = c.name;
    return map;
}
function build_name_to_hex_map(list) {
    const map = {};
    for (const c of list) map[c.name] = c.hex.toUpperCase();
    return map;
}

/**
 * Populate the named colour selector with the given colour list.
 */
function populate_named_colours(sel, list) {
    while (sel.options.length > 0) sel.remove(0);
    // Add blank option for "no match"
    sel.options.add(new Option("—", "", false));
    sel.options[0].style.backgroundColor = "#FFFFFF";
    for (let i = 0; i < list.length; i++) {
	const opt = new Option(list[i].name, list[i].hex, false);
	opt.style.backgroundColor = "#" + list[i].hex;
	// Set text colour for readability on dark backgrounds
	const r = parseInt(list[i].hex.substring(0,2),16);
	const g = parseInt(list[i].hex.substring(2,4),16);
	const b = parseInt(list[i].hex.substring(4,6),16);
	if ((r*0.299 + g*0.587 + b*0.114) < 128) opt.style.color = "#FFFFFF";
	sel.options.add(opt);
    }
}

let graph_algorithm = "r2r";
let animate;
let first_step;
let label_mode = 'manual'; // 'manual' or 'auto'
let label_frame_counter = 0;
const LABEL_UPDATE_INTERVAL = 30; // recalculate every N frames
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
	    g.draw(off_pairs,true,false,false);
	g.calc_forces();
	g.step();
	if(!tracer.checked)
	    clear_canvas();
    }
    const auto = (label_mode === 'auto');
    g.draw(off_pairs,false,labelling.checked,auto);
}
function animPhase() {
    anim_step();
    if (animate) {
	first_step = false;
	// Periodically recompute label positions in auto mode
	if (label_mode === 'auto') {
	    label_frame_counter++;
	    if (label_frame_counter >= LABEL_UPDATE_INTERVAL) {
		label_frame_counter = 0;
		g.updateLabelPositions();
		update_node_stats_if_live();
	    }
	} else {
	    label_frame_counter++;
	    if (label_frame_counter >= LABEL_UPDATE_INTERVAL) {
		label_frame_counter = 0;
		update_node_stats_if_live();
	    }
	}
        setTimeout(animPhase, node_params.anim_timeout);
    }
}

/**
 * Show Minimum Spanning Tree overlay using Kruskal's algorithm.
 * Edges are weighted by current Euclidean distance between nodes.
 */
function show_mst() {
    const mst_edges = kruskal_mst(g);
    g.edges_overlay = mst_edges;
    g.edges_overlay_col = "#00cc00";
    g.highlight_nodes = [];
}

/**
 * Show bridges (cut edges) and articulation points (cut vertices).
 * Bridges are highlighted as edge overlay; articulations as node rings.
 */
function show_bridges() {
    const result = find_bridges_and_articulations(g);
    g.edges_overlay = result.bridges;
    g.edges_overlay_col = "#ff6600";
    g.highlight_nodes = result.articulations;
    g.highlight_nodes_col = "#ff0000";
    document.getElementById("sp_bridges_info").innerHTML =
	"B:" + result.bridges.length + " A:" + result.articulations.length;
}

/**
 * Show Dijkstra's shortest path between two selected nodes.
 * Uses current physical (Euclidean) distance as edge weights.
 */
function hilight_dijkstra_path(sel1="sel_node_list1",sel2="sel_node_list2") {
    const src_ind = adj_index_from_selbox_id(sel1);
    const trg_ind = adj_index_from_selbox_id(sel2);
    const result = dijkstra(g, src_ind);
    const path = dijkstra_path(result.prev, trg_ind);
    const span = document.getElementById("sp_dijkstra_dist");
    if (path) {
	g.path = path;
	g.path_col = "#0066ff";
	const totalDist = result.dist[trg_ind];
	span.innerHTML = "dist: " + totalDist.toFixed(1);
    } else {
	span.innerHTML = "no path";
    }
}

/**
 * Augment bridges: add edges to eliminate all bridges, making the graph
 * 2-edge-connected. For each bridge (u,v), finds leaf nodes in the
 * subtrees on each side and connects them with a new edge.
 * Repeats until no bridges remain (handles cascading bridges).
 */
function augment_bridges() {
    let iterations = 0;
    const maxIter = 100; // safety cap
    while (iterations < maxIter) {
	const result = find_bridges_and_articulations(g);
	if (result.bridges.length === 0) break;

	for (const [u, v] of result.bridges) {
	    // Find the two components created by conceptually removing (u,v)
	    // BFS from u without crossing (u,v)
	    const sideU = new Set();
	    const queueU = [u];
	    sideU.add(u);
	    while (queueU.length > 0) {
		const curr = queueU.shift();
		for (const nb of g.adj[curr]) {
		    if (sideU.has(nb)) continue;
		    // Don't cross the bridge
		    if ((curr === u && nb === v) || (curr === v && nb === u)) continue;
		    sideU.add(nb);
		    queueU.push(nb);
		}
	    }
	    // sideV = everything not in sideU (that is reachable)
	    const sideV = new Set();
	    for (const k of Object.keys(g.ns).map(Number)) {
		if (!sideU.has(k)) sideV.add(k);
	    }
	    if (sideV.size === 0) continue;

	    // Pick a node from each side (prefer one that isn't the bridge endpoint)
	    let pickU = null, pickV = null;
	    for (const n of sideU) { if (n !== u) { pickU = n; break; } }
	    if (pickU === null) pickU = u;
	    for (const n of sideV) { if (n !== v) { pickV = n; break; } }
	    if (pickV === null) pickV = v;

	    // Add the augmenting edge
	    g.add_edge(pickU, pickV);
	}
	iterations++;
    }
    // Update UI edge count and show result
    sync_nu_edges();
    // Highlight remaining state (should be no bridges)
    show_bridges();
}

/**
 * Bypass articulations: add edges to eliminate all articulation points,
 * making the graph 2-vertex-connected (biconnected). For each articulation
 * point, connects pairs of its neighboring subtrees directly so the
 * vertex is no longer a cut point. Repeats until none remain.
 */
function bypass_articulations() {
    let iterations = 0;
    const maxIter = 100; // safety cap
    while (iterations < maxIter) {
	const result = find_bridges_and_articulations(g);
	if (result.articulations.length === 0) break;

	for (const ap of result.articulations) {
	    // Find the distinct subtrees reachable from ap's neighbors
	    // without going through ap itself
	    const neighbors = g.adj[ap];
	    if (!neighbors || neighbors.length < 2) continue;

	    const subtreeOf = {}; // neighbor -> subtree id
	    let subtreeId = 0;
	    const subtreeReps = []; // one representative node per subtree

	    for (const nb of neighbors) {
		if (subtreeOf[nb] !== undefined) continue;
		// BFS from nb without crossing ap
		const queue = [nb];
		const visited = new Set([nb, ap]);
		subtreeOf[nb] = subtreeId;
		let rep = nb;
		while (queue.length > 0) {
		    const curr = queue.shift();
		    for (const next of g.adj[curr]) {
			if (visited.has(next)) continue;
			visited.add(next);
			// Mark neighbors of ap that end up in this subtree
			if (neighbors.includes(next)) {
			    subtreeOf[next] = subtreeId;
			}
			queue.push(next);
			rep = next; // pick any node as representative
		    }
		}
		subtreeReps.push(rep);
		subtreeId++;
	    }

	    // Connect consecutive subtrees (chain them)
	    for (let i = 1; i < subtreeReps.length; i++) {
		g.add_edge(subtreeReps[i - 1], subtreeReps[i]);
	    }
	}
	iterations++;
    }
    // Update UI edge count and show result
    sync_nu_edges();
    show_bridges();
}

/**
 * Show node degree statistics in a table: how many nodes have how many
 * edges (degree), sorted from highest to lowest degree.
 * Preserves previously expanded node label lists across refreshes.
 */
// Track which degrees have their node list expanded
const _stats_expanded = new Set();
let _stats_last_interaction = 0; // timestamp of last button click in stats table
const _STATS_DEBOUNCE_MS = 600; // skip auto-refresh for this long after interaction
let _stats_prev_signature = ""; // fingerprint to detect structural change

function show_node_stats() {
    const div = document.getElementById("div_node_stats");
    // Count degree for each node and collect node indices per degree
    const degreeNodes = {}; // degree -> [node indices]
    for (const i in g.adj) {
	const deg = g.adj[i].length;
	if (!degreeNodes[deg]) degreeNodes[deg] = [];
	degreeNodes[deg].push(Number(i));
    }
    _degree_nodes_cache = degreeNodes;
    // Sort degrees descending
    const degrees = Object.keys(degreeNodes).map(Number).sort((a, b) => b - a);
    // Signature: ordered list of "degree:count" to detect if rows need rebuilding
    const signature = degrees.map(d => d + ':' + degreeNodes[d].length).join(',');

    if (signature !== _stats_prev_signature) {
	// Structure changed — full rebuild
	_stats_prev_signature = signature;
	let html = '<table style="border-collapse:collapse;margin-top:4px;">';
	html += '<tr><th style="border:1px solid #888;padding:2px 6px;">Degree</th>';
	html += '<th style="border:1px solid #888;padding:2px 6px;">Nodes</th>';
	html += '<th style="border:1px solid #888;padding:2px 6px;">List Nodes</th>';
	html += '<th style="border:1px solid #888;padding:2px 6px;">Node labels</th>';
	html += '<th style="border:1px solid #888;padding:2px 6px;">Highlight</th></tr>';
	for (const deg of degrees) {
	    const nodeList = degreeNodes[deg];
	    const rowId = 'stats_row_' + deg;
	    const labels = _stats_expanded.has(deg)
		? nodeList.map(i => g.ns[i] ? g.ns[i].name : i).join(', ')
		: '';
	    html += '<tr>';
	    html += '<td style="border:1px solid #888;padding:2px 6px;text-align:right;">' + deg + '</td>';
	    html += '<td style="border:1px solid #888;padding:2px 6px;text-align:right;" id="stats_count_' + deg + '">' + nodeList.length + '</td>';
	    html += '<td style="border:1px solid #888;padding:2px 6px;text-align:center;"><input type="button" value="L" onclick="list_nodes_for_degree(' + deg + ',\'' + rowId + '\');" style="padding:0 4px;"/></td>';
	    html += '<td style="border:1px solid #888;padding:2px 6px;" id="' + rowId + '">' + labels + '</td>';
	    html += '<td style="border:1px solid #888;padding:2px 6px;text-align:center;"><input type="button" value="H" onclick="highlight_nodes_for_degree(' + deg + ');" style="padding:0 4px;"/></td>';
	    html += '</tr>';
	}
	html += '</table>';
	div.innerHTML = html;
    } else {
	// Structure unchanged — only update counts and expanded labels (no DOM rebuild)
	for (const deg of degrees) {
	    const countEl = document.getElementById('stats_count_' + deg);
	    if (countEl) countEl.textContent = degreeNodes[deg].length;
	    if (_stats_expanded.has(deg)) {
		const rowEl = document.getElementById('stats_row_' + deg);
		if (rowEl) {
		    const names = degreeNodes[deg].map(i => g.ns[i] ? g.ns[i].name : i).join(', ');
		    rowEl.textContent = names;
		}
	    }
	}
    }
}

/** Cached degree->nodes map for highlighting */
let _degree_nodes_cache = {};

/**
 * List node names for a given degree in the table cell.
 */
function list_nodes_for_degree(deg, cellId) {
    _stats_last_interaction = Date.now();
    _stats_expanded.add(deg);
    // Rebuild from current graph state
    const nodes = [];
    for (const i in g.adj) {
	if (g.adj[i].length === deg) nodes.push(Number(i));
    }
    _degree_nodes_cache[deg] = nodes;
    const names = nodes.map(i => g.ns[i] ? g.ns[i].name : i);
    document.getElementById(cellId).innerHTML = names.join(', ');
}

/**
 * Highlight nodes with a given degree using the overlay ring system.
 */
function highlight_nodes_for_degree(deg) {
    _stats_last_interaction = Date.now();
    // Use cached list if available, otherwise compute
    if (!_degree_nodes_cache[deg]) {
	const nodes = [];
	for (const i in g.adj) {
	    if (g.adj[i].length === deg) nodes.push(Number(i));
	}
	_degree_nodes_cache[deg] = nodes;
    }
    if (_degree_nodes_cache[deg].length === 0) return;
    g.highlight_nodes = _degree_nodes_cache[deg];
    g.highlight_nodes_col = "#ffcc00";
    g.edges_overlay = [];
}

/**
 * Update node stats if the "keep updated" checkbox is ticked.
 * Skips refresh briefly after user clicks a button in the table
 * to prevent DOM replacement from swallowing click events.
 * Called from the animation loop.
 */
function update_node_stats_if_live() {
    const cb = document.getElementById("cb_node_stats_live");
    if (cb && cb.checked) {
	if (Date.now() - _stats_last_interaction < _STATS_DEBOUNCE_MS) return;
	show_node_stats();
    }
}

/**
 * Reduce overconnectedness: remove one edge from each node that has the
 * maximum degree. If "preserve connectivity" is checked, only remove
 * edges that won't disconnect the graph (i.e. skip bridges).
 */
function reduce_overconnectedness() {
    const preserve = document.getElementById("cb_preserve_conn").checked;
    // Find maximum degree
    let maxDeg = 0;
    for (const i in g.adj) {
	if (g.adj[i].length > maxDeg) maxDeg = g.adj[i].length;
    }
    if (maxDeg <= 0) return;

    // Find bridges if preserving connectivity
    let bridgeSet = null;
    if (preserve) {
	const result = find_bridges_and_articulations(g);
	bridgeSet = new Set();
	for (const [u, v] of result.bridges) {
	    bridgeSet.add(u + "," + v);
	    bridgeSet.add(v + "," + u);
	}
    }

    // For each node with max degree, remove one edge
    const processed = new Set(); // avoid removing same edge twice
    for (const i in g.adj) {
	if (g.adj[i].length !== maxDeg) continue;
	const ni = Number(i);
	let removed = false;
	for (const j of [...g.adj[i]]) { // copy since we may mutate
	    const key = ni + "," + j;
	    if (processed.has(key)) continue;
	    if (preserve && bridgeSet && bridgeSet.has(key)) continue;
	    g.rem_edge(ni, j);
	    processed.add(key);
	    processed.add(j + "," + ni);
	    removed = true;
	    break;
	}
    }
    sync_nu_edges();
}

/**
 * Increase connectedness: add one edge to each node that has the minimum
 * degree. Connects each min-degree node to a random node it's not already
 * connected to. If the target also had minimum degree, that counts for
 * both — no additional edge needed for the target.
 */
function increase_connectedness() {
    // Find minimum degree
    let minDeg = Infinity;
    for (const i in g.adj) {
	if (g.adj[i].length < minDeg) minDeg = g.adj[i].length;
    }
    if (minDeg === Infinity) return;

    // Collect all nodes with min degree
    const minNodes = [];
    for (const i in g.adj) {
	if (g.adj[i].length === minDeg) minNodes.push(Number(i));
    }

    const allKeys = Object.keys(g.ns).map(Number);
    const handled = new Set();

    for (const ni of minNodes) {
	if (handled.has(ni)) continue;
	// Find a node not already connected to ni
	let target = null;
	// Shuffle candidates to avoid always picking the same one
	const candidates = allKeys.filter(k => k !== ni && !g.adjSet[ni].has(k));
	if (candidates.length === 0) continue;
	// Prefer another min-degree node if available
	const minCandidates = candidates.filter(k => minNodes.includes(k) && !handled.has(k));
	if (minCandidates.length > 0) {
	    target = minCandidates[Math.floor(rng() * minCandidates.length)];
	} else {
	    target = candidates[Math.floor(rng() * candidates.length)];
	}
	g.add_edge(ni, target);
	handled.add(ni);
	handled.add(target); // counts for target too if it was min-degree
    }
    sync_nu_edges();
}

/**
 * Shorten chains (paths of degree-2 nodes) that exceed a maximum length.
 * A "chain" is a maximal path where every interior node has exactly degree 2.
 * For each chain exceeding maxLen, a shortcut edge is added from the midpoint
 * to a non-chain node, splitting the chain roughly in half.
 * Repeats until no chain exceeds maxLen.
 *
 * @param {number} maxLen - Maximum allowed chain length (in edges).
 */
function shorten_chains(maxLen) {
    if (maxLen < 2) maxLen = 2; // minimum meaningful chain
    let changed = true;
    let iterations = 0;
    const MAX_ITER = 100;

    while (changed && iterations < MAX_ITER) {
	changed = false;
	iterations++;
	const chains = find_all_chains();

	for (const chain of chains) {
	    // chain edges = nodes - 1
	    const edgeCount = chain.length - 1;
	    if (edgeCount <= maxLen) continue;

	    // Find midpoint node and add shortcut from it to a non-chain neighbor
	    const midIdx = Math.floor(chain.length / 2);
	    const midNode = chain[midIdx];

	    // Connect midNode to a node not in this chain
	    const chainSet = new Set(chain);
	    const allKeys = Object.keys(g.ns).map(Number);
	    const candidates = allKeys.filter(k => !chainSet.has(k) && !g.adjSet[midNode].has(k));

	    if (candidates.length > 0) {
		const target = candidates[Math.floor(rng() * candidates.length)];
		g.add_edge(midNode, target);
		changed = true;
	    } else {
		// Fallback: shortcut within chain (quarter points)
		const q1 = Math.floor(midIdx / 2);
		const q3 = Math.floor((midIdx + chain.length) / 2);
		if (q1 !== q3 && !g.adjSet[chain[q1]].has(chain[q3])) {
		    g.add_edge(chain[q1], chain[q3]);
		    changed = true;
		}
	    }
	}
    }
    sync_nu_edges();
}

/**
 * Find all maximal chains in the graph.
 * A chain is a maximal sequence of nodes where every interior node has degree 2.
 * Returns array of chains, each an array of node indices (endpoints included).
 */
function find_all_chains() {
    const chains = [];
    const visited = new Set();

    for (const startStr in g.adj) {
	const start = Number(startStr);
	if (visited.has(start)) continue;
	if (g.adj[start].length !== 2) continue;

	// Walk backward from start to find one endpoint
	let left = start;
	let prev = -1;
	while (g.adj[left].length === 2) {
	    const neighbors = g.adj[left];
	    const next = neighbors[0] === prev ? neighbors[1] : neighbors[0];
	    if (next === start) break; // cycle of all degree-2
	    prev = left;
	    left = next;
	}
	// left is now the first endpoint (degree != 2), or start if pure cycle

	// Walk forward from left, collecting the chain
	const chain = [left];
	prev = -1;
	let curr = left;
	while (true) {
	    let next = -1;
	    for (const nb of g.adj[curr]) {
		if (nb === prev) continue;
		if (g.adj[nb].length === 2 && !visited.has(nb)) {
		    next = nb;
		    break;
		}
	    }
	    if (next === -1) break;
	    chain.push(next);
	    visited.add(next);
	    prev = curr;
	    curr = next;
	}
	// Add the far endpoint (degree != 2)
	if (chain.length > 1) {
	    const last = chain[chain.length - 1];
	    for (const nb of g.adj[last]) {
		if (nb !== chain[chain.length - 2] && g.adj[nb].length !== 2) {
		    chain.push(nb);
		    break;
		}
	    }
	}
	if (chain.length >= 3) chains.push(chain);
    }
    return chains;
}

/**
 * UI wrapper for shorten_chains — reads max length from input field.
 */
function shorten_chains_ui() {
    const inp = document.getElementById("inp_max_chain");
    const val = parseInt(inp.value, 10);
    if (isNaN(val) || val < 2) {
	inp.value = 4;
	shorten_chains(4);
    } else {
	shorten_chains(val);
    }
}

/**
 * Force-balance presets for different graph topologies.
 * Each preset defines physics parameters tuned for specific graph structures.
 * Only overrides force-related params; leaves label/nudge/timeout untouched.
 */
const force_presets = {
    "default": {
	label: "Default",
	link_max_length: 30, link_min_length: 20, dist_modifier: 10,
	large_dist_div: 40, small_dist_div: 30, dist_threshold: 100,
	fx_multip: 1, fy_multip: 1
    },
    "tight": {
	label: "Tight Clusters",
	link_max_length: 20, link_min_length: 10, dist_modifier: 5,
	large_dist_div: 20, small_dist_div: 40, dist_threshold: 60,
	fx_multip: 1, fy_multip: 1
    },
    "spread": {
	label: "Spread Out",
	link_max_length: 80, link_min_length: 50, dist_modifier: 30,
	large_dist_div: 60, small_dist_div: 20, dist_threshold: 200,
	fx_multip: 1, fy_multip: 1
    },
    "tree": {
	label: "Tree / Hierarchical",
	link_max_length: 60, link_min_length: 40, dist_modifier: 20,
	large_dist_div: 30, small_dist_div: 20, dist_threshold: 150,
	fx_multip: 1, fy_multip: 2
    },
    "ring": {
	label: "Ring / Circular",
	link_max_length: 40, link_min_length: 30, dist_modifier: 15,
	large_dist_div: 50, small_dist_div: 50, dist_threshold: 120,
	fx_multip: 1, fy_multip: 1
    },
    "dense": {
	label: "Dense / Complete",
	link_max_length: 15, link_min_length: 10, dist_modifier: 5,
	large_dist_div: 10, small_dist_div: 50, dist_threshold: 50,
	fx_multip: 1, fy_multip: 1
    },
    "slow": {
	label: "Slow & Stable",
	link_max_length: 30, link_min_length: 20, dist_modifier: 10,
	large_dist_div: 80, small_dist_div: 60, dist_threshold: 100,
	fx_multip: 1, fy_multip: 1
    }
};

/**
 * Apply a force-balance preset by name.
 * Updates node_params and syncs all sliders.
 * @param {string} presetName - Key from force_presets
 */
function apply_force_preset(presetName) {
    const preset = force_presets[presetName];
    if (!preset) return;
    for (const key in preset) {
	if (key === 'label') continue;
	if (node_params[key] !== undefined) {
	    node_params[key] = preset[key];
	}
    }
    update_node_params();
}
