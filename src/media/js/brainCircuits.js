var node_link_map,link_map,record_map,node_map,node_neighbor_map,link_rating_map,record_rating_map,active_data_nodes,active_data_links,svg,arcs,linkGenerator,links,vis_width=800,vis_height=800,inner_radius=0.3*Math.min(vis_width,vis_height),outer_radius=1.5*inner_radius,directionType={"in":1,out:2,bi:3};
node_map={1:{key:1,name:"apple",depth:0,children:[2,3]},2:{key:2,name:"banana",depth:1,children:[4,5]},3:{key:3,name:"plum",depth:1,children:[6,7]},4:{key:4,name:"grape",depth:2,children:[]},5:{key:5,name:"watermelon",depth:2,children:[]},6:{key:6,name:"orange",depth:2,children:[]},7:{key:7,name:"pineapple",depth:2,children:[]}};link_map={};link_map[1]={key:1,source:node_map[2],target:node_map[3]};link_map[2]={key:2,source:node_map[4],target:node_map[6]};link_map[3]={key:3,source:node_map[5],target:node_map[7]};
link_map[4]={key:4,source:node_map[4],target:node_map[3]};link_map[5]={key:5,source:node_map[5],target:node_map[3]};link_map[6]={key:6,source:node_map[2],target:node_map[6]};link_map[7]={key:7,source:node_map[2],target:node_map[7]};node_link_map={};node_link_map["2-3"]=link_map[1];node_link_map["4-6"]=link_map[2];node_link_map["5-7"]=link_map[3];node_link_map["3-4"]=link_map[4];node_link_map["3-5"]=link_map[5];node_link_map["2-6"]=link_map[6];node_link_map["2-7"]=link_map[7];node_neighbor_map={};
node_neighbor_map[2]=[{node:node_map[3]},{node:node_map[6]},{node:node_map[7]}];node_neighbor_map[3]=[{node:node_map[2]},{node:node_map[4]},{node:node_map[5]}];node_neighbor_map[4]=[{node:node_map[6]},{node:node_map[3]}];node_neighbor_map[5]=[{node:node_map[7]},{node:node_map[3]}];node_neighbor_map[6]=[{node:node_map[4]},{node:node_map[2]}];node_neighbor_map[7]=[{node:node_map[5]},{node:node_map[2]}];active_data_nodes=[];for(var key in node_map){var curr_node=node_map[key];1===curr_node.depth&&active_data_nodes.push(curr_node)}computeArcParameters(active_data_nodes);
active_data_links=[];for(key in link_map){var curr_link=link_map[key];1===curr_link.source.depth&&1===curr_link.target.depth&&active_data_links.push(curr_link)}arcs=d3.svg.arc().innerRadius(inner_radius).outerRadius(outer_radius);linkGenerator=d3.svg.line().x(function(a,b){console.log(b);return a+100}).y(function(a,b){console.log(b);return a-100});
svg=d3.select("#canvas").append("svg").attr("width","100%").attr("height","100%").append("g").attr("transform","translate("+2*vis_width/3+","+vis_height/2+")").append("g");enterNodes();enterLinks();function fade(a){return function(b,c){svg.selectAll("g.chord path").filter(function(a){return a.source.index!=c&&a.target.index!=c}).transition().style("opacity",a)}}
function expandRegion(a){var b=a.children,c=b.length;if(!(1>c)){for(var d=a.startAngle,m=(a.endAngle-d)/c,g=[],i=active_data_links.length,e=0;e<i;++e){var f=active_data_links[e];f.source===a&&g.push(f.target);f.target===a&&g.push(f.source)}i=g.length;for(e=0;e<c;++e){f=node_map[b[e]];calculateArcPositions(f,d,m,e);active_data_nodes.push(f);for(var l=0;l<i;++l){var j=g[l],k=generateKeyForNodeLinkMap(f,j),h=node_link_map[k];console.log(j.name);console.log(k);console.log(h);void 0!==h&&(active_data_links.push(h),
console.log(active_data_links))}}console.log(active_data_nodes);console.log(active_data_links);enterNodes();enterLinks();b=$.inArray(a,active_data_nodes);active_data_nodes.splice(b,1);for(e=0;e<i;++e)j=g[e],k=generateKeyForNodeLinkMap(a,j),h=node_link_map[k],b=$.inArray(h,active_data_links),active_data_links.splice(b,1);svg.selectAll("path").data(active_data_nodes,function(a){return a.key}).exit().remove();svg.selectAll("text").data(active_data_nodes,function(a){return a.key}).exit().remove();svg.selectAll("line").data(active_data_links,
function(a){return a.key}).exit().remove()}}
function enterNodes(){svg.selectAll("arcs").data(active_data_nodes,function(a){return a.key}).enter().append("path").style("fill","white").style("stroke","gray").attr("d",arcs).on("mouseover",fade(0.1)).on("mouseout",fade(1)).on("click",expandRegion);svg.selectAll("text").data(active_data_nodes,function(a){return a.key}).enter().append("text").attr("x",function(a){return a.x}).attr("y",function(a){return a.y}).attr("class","text visible").text(function(a){return a.name})}
function enterLinks(){svg.selectAll("links").data(active_data_links,function(a){return a.key}).enter().append("svg:line").attr("stroke","black").attr("fill","none").attr("x1",function(a){return a.source.x}).attr("x2",function(a){return a.target.x}).attr("y1",function(a){return a.source.y}).attr("y2",function(a){return a.target.y})}function computeArcParameters(a){for(var b=a.length,c=2*Math.PI/b,d=0;d<b;++d)calculateArcPositions(a[d],0,c,d)}
function calculateArcPositions(a,b,c,d){a.startAngle=b+c*d;a.endAngle=b+c*(d+1);b=c*(d+0.5)+b;c=inner_radius+(outer_radius-inner_radius)/2;a.x=c*Math.cos(Math.PI/2-b);a.y=c*Math.sin(Math.PI/2-b)};function contains(a,b){for(var c=a.length,d=0;d<c;++d)if(b.key===a[d].key)return d;return-1}function generateKeyForNodeLinkMap(a,b){var c=Math.min(a.key,b.key),d=Math.max(a.key,b.key);return c+"-"+d};
