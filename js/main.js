let g;
let canv;
let c2d;
let count;
let num_steps;
let tracing;
let saved_count;

function start(canv_name="c",
	       nnodes=100,
	       nedges=100,
	       nsteps=2000) {
    canv = document.getElementById(canv_name);
    c2d = canv.getContext("2d");
    num_steps = nsteps;
    let num_nodes = nnodes;
    let num_edges = nedges;
    btn_stop.disabled = false;
    btn_pause.disabled = false;

    clear_canvas();
    g = new Graph('trygraph');

    for(let i = 0;i<num_nodes;i++) {
        g.addNode(new Node('n'+i, 'c', 'rgb(145, 151, 189)', 'rgb(31, 30, 124)',  Math.random()*800+100, Math.random()*800+100, c2d));
    }

    for(let i = 0;i<num_edges;i++) {
        g.addLink(Math.floor(Math.random()*num_nodes), Math.floor(Math.random()*num_nodes));
    }

    count = 0;
    animPhase();
}

function clear_canvas(from_x=0,
		      from_y=0,
		      to_x=canv.width,
		      to_y=canv.height,
		      c=canv) {
    const ctx = c.getContext('2d');
    ctx.clearRect(from_x, from_y, to_x, to_y);
}

function stop() {
    count = num_steps;
    saved_count = num_steps;
}

function pause() {
    saved_count = count;
    console.log("saved: " + saved_count);
    count = num_steps;
    btn_cont.disabled = false;
    btn_pause.disabled = true;
}

function go_on() {
    count = saved_count;
    console.log("count: " + count);
    saved_count = 0;
    animPhase();
    btn_cont.disabled = true;
    btn_pause.disabled = false;
    btn_stop.disabled = false;
}

function check_tracer(t=tracer) {
    if(t.checked) {
	console.log("trace: on");
	tracing = true;
	return true;
    } else {
	console.log("trace: off");
	tracing = false;
	return false;
    }
}

function animPhase() {
    count++;
    c2d.fillStyle='black';
    c2d.strokeStyle='gray';
    g.draw(false);
    g.calcForces();
    g.step();
    if(!tracing)
	clear_canvas();
    g.draw();
    if(count<num_steps) {
        setTimeout(animPhase, 10);
    } else {
	btn_stop.disabled = true;
	btn_pause.disabled = true;
    }
}
