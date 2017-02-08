/**
 * 
 */
var data =[];
var label =[];

function d3Arr(exe,order) {
  data.push(exe);
  label.push(order);
  myFunction();
}
function myFunction() {
  var g = new dagreD3.graphlib.Graph()
    .setGraph({rankdir: 'LR'})
    .setDefaultEdgeLabel(function() { return {}; });  
  var x;  
  for(x in data) {
    g.setNode(data[x], {label:label[x],  class:data[x]});    
  }
  g.nodes().forEach(function(v) {
    var node = g.node(v);
    node.rx = node.ry = 5;
  });
  var labelLength = label.length
  if(labelLength > 1) {
    for(y in label) {
      var nextIndex = parseInt(y)+parseInt(1);
      var prevNode = data[y];
      var nextNode = data[nextindex];     
      if(nextIndex == labelLength) {       
        break;
      } else {      
        g.setEdge(prevNode,nextNode);
      }     
    }
  }
  var render = new dagreD3.render();
  var svg = d3.select("svg"),
      svgGroup = svg.append("g");
  render(d3.select("svg g"), g);
  var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
  svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
  svg.attr("height", g.graph().height);
  svg.selectAll("g.node").on("click", function(id) { 
    var _node = g.node(id); 
    var clickednode = id,_node; 
    var nodeindex = data.indexOf(clickednode);
    data.splice(nodeindex,1);
    myFunction();
  });
}
