const fs = require('fs');
const vm = require('vm');
const { expect } = require('chai');

function loadContext() {
  const context = {
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
  };
  vm.createContext(context);
  // Load node.js and graph.js into the context
  const nodeCode = fs.readFileSync('./js/node.js', 'utf8');
  const graphCode = fs.readFileSync('./js/graph.js', 'utf8');
  vm.runInContext(nodeCode, context, { filename: 'node.js' });
  vm.runInContext(graphCode, context, { filename: 'graph.js' });
  return context;
}

describe('Graph core functionality', () => {
  let ctx;
  let Graph;
  let Node;

  before(() => {
    ctx = loadContext();
    Graph = ctx.Graph;
    Node = ctx.Node;
  });

  it('adds and removes vertices', () => {
    const g = new Graph('test');
    const cols = { fill_colour: '#fff', font_colour: '#000', outline_col: '#000', line_colour: '#000', trc_fil_col: '#000', trc_oli_col: '#000', trc_lin_col: '#000' };
    const rnd = { fill_colour: false, font_colour: false, outline_col: false, line_colour: false, trc_fil_col: false, trc_oli_col: false, trc_lin_col: false };
    const n1 = new Node('n1','c',5,5,cols,rnd,0,0,null);
    const n2 = new Node('n2','c',5,5,cols,rnd,0,0,null);

    g.add_vertex(n1);
    g.add_vertex(n2);
    expect(g.nu_vertices).to.equal(2);

    // remove by name
    expect(g.rem_vertex_by_name('n1')).to.be.true;
    expect(g.nu_vertices).to.equal(1);
    expect(g.sn['n1']).to.be.undefined;
  });

  it('adds and removes edges and detects connectivity', () => {
    const g = new Graph('test2');
    const cols = { fill_colour: '#fff', font_colour: '#000', outline_col: '#000', line_colour: '#000', trc_fil_col: '#000', trc_oli_col: '#000', trc_lin_col: '#000' };
    const rnd = { fill_colour: false, font_colour: false, outline_col: false, line_colour: false, trc_fil_col: false, trc_oli_col: false, trc_lin_col: false };
    const n1 = new Node('a','c',5,5,cols,rnd,0,0,null);
    const n2 = new Node('b','c',5,5,cols,rnd,0,0,null);

    g.add_vertex(n1);
    g.add_vertex(n2);
    // indices are numeric starting at 0
    const idx0 = 0;
    const idx1 = 1;

    expect(g.add_edge(idx0, idx1)).to.be.true;
    expect(g.is_connected(idx0, idx1)).to.be.true;

    // removing edge
    expect(g.rem_edge(idx0, idx1)).to.be.true;
    expect(g.is_connected(idx0, idx1)).to.be.false;
  });
});

describe('Node utilities', () => {
  let ctx;
  let Node;

  before(() => {
    ctx = loadContext();
    Node = ctx.Node;
  });

  it('calculates Euclidean distance', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };
    const d = Node.calc_dist(a, b);
    expect(d).to.equal(5);
  });
});
