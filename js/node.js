/**
 * Physics simulation parameters for node forces and animation.
 * All values can be modified at runtime via modify_params() to tune simulation behavior.
 * @type {object}
 */
const node_params = {
    link_max_length: 30,   // Target maximum edge length; nodes beyond this attract
    link_min_length: 20,   // Target minimum edge length; nodes closer repel
    dist_modifier:   10,   // Affects attraction force magnitude for connected nodes
    large_dist_div:  40,   // Divisor for attraction force at large distances
    small_dist_div:  30,   // Divisor for repulsion force at small distances
    dist_threshold: 100,   // Distance threshold; repulsion only applies within this range
    label_offset_x:   0,   // Horizontal offset for node labels
    label_offset_y:   0,   // Vertical offset for node labels
    nudge_size:       5,   // Pixel distance for manual nudge controls
    fx_multip:        1,   // Multiplier for x-axis forces
    fy_multip:        1,   // Multiplier for y-axis forces
    anim_timeout:    10,   // Animation frame delay in milliseconds
};

/**
 * Update a node physics parameter at runtime.
 * @param {string} param - Parameter name (must exist in node_params)
 * @param {number} value - New value for the parameter
 */
function modify_params(param,value) {
    if (Object.keys(node_params).indexOf(param) != -1) {
	node_params[param] = value;
    } else
	console.log("Invalid node_param has been received: " + param);
}

/**
 * Convert radians to degrees.
 * @param {number} rad - Angle in radians
 * @returns {number} Angle in degrees
 */
function rad_to_deg(rad) {
    return(rad * (180 / Math.PI));
}

/**
 * Visual representation of a graph vertex with physics simulation.
 * Maintains position, velocity (forces), color, and shape information.
 * @class Node
 */
class Node {
    /**
    * Create a new node for visualization.
    * @param {string} name - Unique identifier for this node
    * @param {string} shape - Shape code: 'c'=circle, 's'=square, 'r'=rectangle, 'e'=ellipse, 't'=triangle
    * @param {number} size0 - Primary dimension (width/diameter)
    * @param {number} size1 - Secondary dimension (height; ignored for circle/square)
    * @param {object} cols - Color palette with CSS color values
    * @param {object} rnd - Flags indicating which colors should be randomized
    * @param {number} x - Initial x coordinate
    * @param {number} y - Initial y coordinate
    * @param {CanvasRenderingContext2D} c2d - Canvas 2D context for rendering
    */
    constructor( name, shape, size0, size1, cols, rnd, x, y, c2d) {
        this.name = name;
        this.shape = shape;
	this.size0 = Number(size0);
	this.size1 = (shape == 'c' || shape == 's') ? Number(size0) : Number(size1);
	this.refresh_colours(cols,rnd);
        this.x = x;
        this.y = y;
        this.c2d = c2d;
        this.fx = 0;      // Accumulated x-axis force
        this.fy = 0;      // Accumulated y-axis force
	this.visited = false;
	this.group = null;  // Group name (for group-based styling)
    }

    /**
    * Mark this node as visited (for graph traversal algorithms).
    */
    visit() { this.visited = true; }

    /**
    * Mark this node as unvisited.
    */
    unvisit() { this.visited = false; }

    /**
    * Update node colors based on palette and randomization flags.
    * @param {object} cols - Color palette
    * @param {object} rnd - Randomization flags for each color type
    */
    refresh_colours(cols,rnd) {
        this.fillcolour = rnd.fill_colour ? gen_colour() : cols.fill_colour;
	this.fontcolour = rnd.font_colour ? gen_colour() : cols.font_colour;
	this.outlcolour = rnd.outline_col ? gen_colour() : cols.outline_col;
        this.linecolour = rnd.line_colour ? gen_colour() : cols.line_colour;
	this.tracefillcolour = rnd.trc_fil_col ? gen_colour() : cols.trc_fil_col;
	this.traceoutlcolour = rnd.trc_oli_col ? gen_colour() : cols.trc_oli_col;
	this.tracelinecolour = rnd.trc_lin_col ? gen_colour() : cols.trc_lin_col;
    }

    /**
    * Assign this node to a group.
    * @param {string} groupName - The group to assign this node to
    */
    set_group(groupName) {
	this.group = groupName;
    }

    /**
    * Get effective color, considering group overrides.
    * @param {object} groupColors - Map of group names to color objects
    * @param {string} colorType - Color property name (e.g., 'fillcolour', 'outlcolour')
    * @returns {string} CSS color value
    */
    get_effective_color(groupColors, colorType) {
	if (this.group && groupColors[this.group] && groupColors[this.group][colorType]) {
	    return groupColors[this.group][colorType];
	}
	return this[colorType];
    }

    /**
    * Get effective size, considering group overrides.
    * @param {object} groupSizes - Map of group names to size objects {size0, size1}
    * @param {string} sizeType - Size property name ('size0' or 'size1')
    * @returns {number} Effective size value
    */
    get_effective_size(groupSizes, sizeType) {
	if (this.group && groupSizes[this.group] && groupSizes[this.group][sizeType] !== undefined) {
	    return groupSizes[this.group][sizeType];
	}
	return this[sizeType];
    }

    /**
    * Reset accumulated forces to zero (called each animation frame).
    * @private
    */
    reset_force() {
        this.fx = 0;
        this.fy = 0;
    }

    /**
    * Add attraction/repulsion force from a connected node.
    * Connected nodes attract if distance > link_max_length, repel if < link_min_length.
    * @param {Node} otherNode - The other node connected by an edge
    */
    add_force_connected(otherNode) {
        let dist = this.constructor.calc_dist(this,otherNode);
	if (dist>node_params.link_max_length) {
            this.fx += (otherNode.x-this.x)/dist*(dist-node_params.dist_modifier)/node_params.large_dist_div;
            this.fy += (otherNode.y-this.y)/dist*(dist-node_params.dist_modifier)/node_params.large_dist_div;
        } else if (dist<node_params.link_min_length) {
            this.fx += (this.x-otherNode.x)/dist*(node_params.link_min_length-dist)/node_params.small_dist_div;
            this.fy += (this.y-otherNode.y)/dist*(node_params.link_min_length-dist)/node_params.small_dist_div;
        }
    }

    /**
    * Add repulsion force from an unconnected (non-adjacent) node.
    * Repulsion only applies if distance < dist_threshold.
    * @param {Node} otherNode - A non-adjacent node
    */
    add_force_unconnected(otherNode) {
	let dist = this.constructor.calc_dist(this,otherNode);
        if (dist<node_params.dist_threshold) {
            this.fx += (this.x-otherNode.x)/dist;
            this.fy += (this.y-otherNode.y)/dist;
        }
    }

    /**
    * Update node position based on accumulated forces. Called once per animation frame.
    */
    step() {
        this.x += this.fx*node_params.fx_multip;
        this.y += this.fy*node_params.fy_multip;
        this.reset_force();
    }

    /**
    * Move node up (for manual nudge control).
    */
    move_up() {
	this.y -= node_params.nudge_size;
    }
    /**
    * Move node down (for manual nudge control).
    */
    move_down() {
	this.y += node_params.nudge_size;
    }

    /**
    * Move node left (for manual nudge control).
    */
    move_left() {
	this.x -= node_params.nudge_size;
    }

    /**
    * Move node right (for manual nudge control).
    */
    move_right() {
	this.x += node_params.nudge_size;
    }

    /**
    * Calculate Euclidean distance between two nodes.
    * Time complexity: O(1)
    * @param {Node} n0 - First node
    * @param {Node} n1 - Second node
    * @returns {number} Distance between nodes
    * @static
    */
    static calc_dist(n0,n1) {
        return Math.sqrt(Math.pow((n0.x-n1.x),2) + Math.pow((n0.y-n1.y),2));
    }

    /**
    * Draw a node to canvas with optional trace and labels.
    * Shape is determined by node.shape property.
    * @param {Node} n - The node to draw
    * @param {object} p - Drawing parameters
    * @param {boolean} draw_trace - Whether to use trace colors
    * @param {boolean} draw_labels - Whether to draw node label/name
    * @static
    */
    static draw(n,p,draw_trace,draw_labels) {
	if (!p.fill_colour)
	    n.c2d.fillStyle = draw_trace ? n.tracefillcolour : n.fillcolour;
    	if (!p.outline_col)
            n.c2d.strokeStyle = draw_trace ? n.traceoutlcolour : n.outlcolour;
	
	n.c2d.beginPath();
	switch(n.shape) {
	case 'c':
	case 'e':
            n.c2d.ellipse(n.x, n.y, n.size0, n.size1, 0, 0, 2*Math.PI);
	    break;
	case 's':
	case 'r':
	    n.c2d.rect(n.x, n.y, n.size0, n.size1);
	    break;
	}
	if (!p.fill_colour)
            n.c2d.fill();
	if (!p.outline_col)
	    n.c2d.stroke();
	if (draw_labels) {
	    n.c2d.fillStyle=n.fontcolour;
	    n.c2d.fillText(n.name, n.x + node_params.label_offset_x, n.y + node_params.label_offset_y);
	}
    }

    /**
    * Get the connection point on this node for drawing edges (shape-aware).
    * Returns a point on the node's perimeter closest to otherNode.
    * @param {Node} n - The node to get point from
    * @param {Node} otherNode - The target node (used to determine direction)
    * @returns {number[]} [x, y] coordinates of connection point
    * @static
    */
    static get_point(n,otherNode) {
	switch(n.shape) {
	case 'c':
		return this.getPointOnCircle(n,this.angleBetween(n,otherNode));
	    break;
	case 'e':
		return this.getPointOnEllipse(n,this.angleBetween(n,otherNode));
	    break;
	case 'r':
	case 's':
		return this.getConnectionPoint(n,otherNode);
	    break;
	default:
	    return [otherNode.x,otherNode.y];
	}
    }

    /**
    * Calculate angle from this node to another (for edge rendering).
    * @param {Node} n - Origin node
    * @param {Node} other - Target node
    * @returns {number} Angle in radians
    * @static
    * @private
    */
    static angleBetween(n,other) {
	let rotation = -Math.atan2(other.x - n.x, other.y - n.y);
	rotation = rotation + Math.PI;
	return rotation;
    }

    /**
    * Get point on circle perimeter at given angle.
    * @param {Node} n - Circle node
    * @param {number} radians - Angle in radians
    * @returns {number[]} [x, y] coordinates on circle
    * @static
    * @private
    */
    static getPointOnCircle(n,radians) {
	radians = radians - Math.PI/2;
	return [Math.round(n.x + Math.cos(radians) * n.size0),
		Math.round(n.y + Math.sin(radians) * n.size0)];
    }

    /**
    * Get point on ellipse perimeter at given angle.
    * @param {Node} n - Ellipse node
    * @param {number} radians - Angle in radians
    * @returns {number[]} [x, y] coordinates on ellipse
    * @static
    * @private
    */
    static getPointOnEllipse(n,radians) {
	radians = radians - Math.PI/2;
	return [Math.round(n.x + Math.cos(radians) * n.size0),
		Math.round(n.y + Math.sin(radians) * n.size1)];
    }

    /**
    * Get edge connection point on rectangle/square node (shape-aware edge anchoring).
    * Determines which edge of the rectangle is closest to the other node.
    * @param {Node} n - Rectangle/square node
    * @param {Node} otherNode - The target node (determines which edge)
    * @returns {number[]} [x, y] coordinates on rectangle perimeter
    * @static
    * @private
    */
    static getConnectionPoint(n,otherNode) {
	if (otherNode.y + otherNode.size1 < n.y)
	    return [n.x + n.size0 / 2, n.y];
	if (otherNode.y > n.y + n.size1)
	    return [n.x + n.size0 / 2, n.y + n.size1];
	if (otherNode.x + otherNode.size0 < n.x)
	    return [Number(n.x), n.y + n.size1 / 2];
	if (otherNode.x > n.x + n.size0)
	    return [n.x + n.size0, n.y + n.size1 / 2];

	const x = (otherNode.x < n.x) ? n.x : n.x + n.size0;
	const y = (otherNode.y < n.y) ? n.y : n.y + n.size1;
	return [x,y];
    }
    // connect(otherNode) {
    // 	if(!this.constructor.is_connected(this,otherNode)) {
    // 	    this.add_uni_link(otherNode);
    // 	    otherNode.add_back_link(this);
    // 	}
    // }
    // disconnect(otherNode) {
    // 	if(this.constructor.is_connected(this,otherNode)) {
    // 	    this.rem_link(otherNode);
    // 	    otherNode.rem_back_link(this);
    // 	    return true;
    // 	}
    // 	return false;
    // }
    // rem_from_arr(arr,node) {
    // 	const ind = arr.indexOf(node);
    // 	if (ind > -1)
    // 	    arr.splice(ind,1);
    // }
    // rem_link(otherNode) {
    // 	this.rem_from_arr(this.links,otherNode);
    // }
    // rem_back_link(otherNode) {
    // 	this.rem_from_arr(this.backLinks,otherNode);
    // }
    // add_uni_link(otherNode) {
    //     this.links.push(otherNode);
    // }
    // add_back_link(otherNode) {
    //     this.backLinks.push(otherNode);
    // }
    // static is_connected(n,other_node) {
    // 	for(let i in n.links)
    // 	    if (n.links[i] == other_node)
    // 		return true;
    // 	for(let i in n.backLinks)
    // 	    if (n.backLinks[i] == other_node)
    // 		return true;
    // 	return false;
    // }
    static status(g) {
        return g.name+": coord.: (" + g.x + ","+g.y+") forces: ("+ g.fx + ","+g.fy+")";
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.Node = Node;
}
