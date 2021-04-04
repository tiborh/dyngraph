class Graph {
    constructor(name) {
        this.name = name;
        this.ns = [];
    }

    addNode(node) {
        this.ns.push(node);
        return this.ns.length-1;
    }

    addLink(index1, index2) {
        if (index1<0 || index1>=this.ns.length || index2<0 || index2>=this.ns.length)
            return;

        this.ns[index1].addLink(this.ns[index2]);
    }

    draw(params,draw_trace) {
	//console.log("graph.draw() has been called");
        this.ns.forEach( node => {
            node.draw(params,draw_trace);
        });
    }

    calcForces() {
        this.ns.forEach( node => {
            node.resetForce();
        });
        this.ns.forEach( node => {
            this.ns.forEach( otherNode => {
                if (node!=otherNode) {
                    node.addForce(otherNode);
                }
            })
        });
    }

    refresh_colours(cols,rnd) {
        this.ns.forEach( node => {
            node.refresh_colours(cols,rnd);
        });
    }

    nudge(dir) {
	this.ns.forEach( node => {
	    switch(dir) {
	    case 'up':
		node.move_up();
		break;
	    case 'down':
		node.move_down();
		break;
	    case 'left':
		node.move_left();
		break;
	    case 'right':
		node.move_right();
		break;
	    default:
		console.log("Undefined direction: " + dir);
	    }
        });
    }
    
    step() {
        this.calcForces();
        this.ns.forEach( node => {
            node.step();
        });
    }

    resize_nodes(new_size0,new_size1) {
	this.ns.forEach( node => {
            node.size0=new_size0;
	    node.size1=new_size1;
        });
    }

    get_edge_list() {
	let output_string = "";
	for(let i in this.ns) {
	    if (this.ns[i].links.length == 0) {
		output_string = output_string + this.ns[i].name + "\n";
		//console.log(output_string);
	    } else {
		for(let j in this.ns[i].links) {
		    output_string = output_string + this.ns[i].name + " " + this.ns[i].links[j].name + "\n";
		    //console.log(output_string);
		}
	    }
	}
	return output_string;
    }
}
