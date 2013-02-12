var node_link_map,link_map,paper_map,node_map,node_in_neighbor_map,node_out_neighbor_map,link_rating_map,record_rating_map,dataset_list,uid,user_datasets={},selected_source,selected_target,active_data_nodes,active_data_links,active_data_nodes_force,active_data_links_force,active_node_map,svg_circular,svg_force,arcs,curves,links,force,vis_width=800,vis_height=800,inner_radius=0.32*Math.min(vis_width,vis_height),outer_radius=1.2*inner_radius,directionType={"in":1,out:2,bi:3},mode={exploration:1,search:2,
fixation:3},colorPalette=[d3.rgb(141,211,199).toString(),d3.rgb(255,255,179).toString(),d3.rgb(190,186,218).toString(),d3.rgb(251,128,114).toString(),d3.rgb(128,177,211).toString(),d3.rgb(253,180,98).toString(),d3.rgb(179,222,105).toString(),d3.rgb(252,205,229).toString(),d3.rgb(217,217,217).toString(),d3.rgb(188,128,189).toString(),d3.rgb(204,235,197).toString(),d3.rgb(255,237,111).toString()],mutex=3,enable_piwik=!1,enable_owa=!1,enable_tracking=!0,current_mode=mode.exploration,max_hop=1,actionData=
[],generalData=[],startTime=null,endTime=null,sessionStartTime,sessionEndTime,currentActionData={timeElapsed:-1,mouseTrace:"",actionBasic:"",actionDetail:"",time:-1};d3.json("media/data/test_node.json",function(a){node_map={};node_in_neighbor_map={};node_out_neighbor_map={};for(var b=a.length,c=0;c<b;++c){var d=a[c];d.circ={};node_map[d.key]=d;node_in_neighbor_map[d.key]=[];node_out_neighbor_map[d.key]=[]}for(var e in node_map){d=node_map[e];for(c=0;c<d.children.length;++c)a=node_map[d.children[c]],void 0!==a&&(a.parent=e)}mutex-=1});
d3.json("media/data/test_paper.json",function(a){paper_map={};for(var b=a.length,c=0;c<b;++c){var d=a[c];paper_map[d.key]=d}mutex-=1});
d3.json("media/data/test_link.json",function(a){link_map={};node_link_map={};for(var b=a.length,c=0;c<b;++c){var d=a[c],e={key:d.key,source:node_map[d.sourceKey],target:node_map[d.targetKey],paper:d.paper,children:d.children};link_map[e.key]=e;node_link_map[e.source.key+"-"+e.target.key]=e;node_in_neighbor_map[d.targetKey].push(d.sourceKey);node_out_neighbor_map[d.sourceKey].push(d.targetKey)}mutex-=1});populateUserId();waitForDataLoading();d3.select("#bt-search").on("click",searchButtonClick);
d3.select("#bt-clear").on("click",clearButtonClick);d3.select("#bt-createDatasets").on("click",createDatasetButtonClick);d3.select("#bt-manageDatasets").on("click",manageDatasetButtonClick);d3.select("#bt-applyDataset").on("click",applyDatasetButtonClick);d3.select("#maxHop").on("change",setMaxHop);$("#sourceSelect").change(sourceSearchInput);$("#targetSelect").change(targetSearchInput);window.onbeforeunload=saveSessionData;window.onload=startSession;
function renderCanvas(){console.log("2");console.log(node_map);assignColors(node_map);initActiveNodes(node_map);computeCircularNodesParameters(active_data_nodes);initActiveLinks(link_map);arcs=d3.svg.arc().innerRadius(inner_radius).outerRadius(outer_radius).startAngle(function(a){return a.circ.start_angle}).endAngle(function(a){return a.circ.end_angle});curves=d3.svg.line().x(function(a){return a.x}).y(function(a){return a.y}).interpolate("basis");svg_circular=d3.select("#canvas-circular").append("svg").attr("width",
vis_width).attr("height",vis_height).append("g").attr("transform","translate("+vis_width/2+","+vis_height/2+")").append("g");svg_force=d3.select("#canvas-force").append("svg").attr("width",vis_width).attr("height",vis_height).append("g");enterCircularNodes();enterCircularLinks();updateCircularTexts()}function setupUIElements(){appendNodesAsOptions(node_map)}
function waitForDataLoading(){0<mutex?setTimeout(function(){waitForDataLoading()},1E3):(active_node_map=node_map,active_node_link_map=node_link_map,active_node_in_neighbor_map=node_in_neighbor_map,active_node_out_neighbor_map=node_out_neighbor_map,renderCanvas(),setupUIElements())};function appendNodesAsOptions(a){for(var b in a){var c=a[b];$("#sourceSelect").append(new Option(c.name,b,!1,!1));$("#targetSelect").append(new Option(c.name,b,!1,!1))}$(".chzn-select").chosen({allow_single_deselect:!0});$("#sourceSelect").trigger("liszt:updated");$("#targetSelect").trigger("liszt:updated")}
function updateOptions(){console.log("called");$("#sourceSelect").find("option").remove();$("#targetSelect").find("option").remove();$("#sourceSelect").trigger("liszt:updated");$("#targetSelect").trigger("liszt:updated");appendNodesAsOptions(active_node_map)}function populateDatasetUI(){console.log("testing user id");console.log(uid);var a=dataset_list.length;console.log(dataset_list);for(var b=0;b<a;++b){var c=dataset_list[b];$("#dataSelect").append(new Option(c[1],c[0]))}}
function createDatasetButtonClick(){createDataset($('[name="datasetName"]').val(),uid)}function manageDatasetButtonClick(){var a=$("#dataSelect :selected").text(),b=$("#dataSelect").val();window.open("media/php/manageDataset.php?datasetName="+a+"&datasetID="+b,"Manage Datasets","width=800, height=800")}function applyDatasetButtonClick(){var a=parseInt($("#dataSelect").val());""!==a&&void 0===user_datasets[a]&&getBrainData(a)}
function searchButtonClick(){enable_piwik&&piwikTracker.trackPageView("Search:"+selected_source.name+"-"+selected_target.name);enable_owa&&OWATracker.trackAction("UI","Search",selected_source.name+"-"+selected_target.name);enable_tracking&&trackAction("Search",selected_source.name+"-"+selected_target.name);var a=calculatePaths(max_hop);populateForceElements(a);updateForceLayout()}function clearButtonClick(){enable_piwik&&piwikTracker.trackPageView("Click clear button")}
function sourceSearchInput(){enable_piwik&&piwikTracker.trackPageView("Set search source");void 0!=selected_source&&(selected_source.fixed=!1,highlightNode(selected_source,"focus",!1,!0,svg_circular),clearSearchResult());var a=active_node_map[this.value];selected_source=a;if(!a.isActive){var b=findActiveParent(a);if(void 0===b)b=findActiveDescends(a),combineRegions(a,b);else{var c=findDescAtDepth(b,a.depth);expandRegion(b,c,svg_circular)}}highlightNode(a,"focus",!0,!0,svg_circular);enable_owa&&OWATracker.trackAction("UI",
"Set source",selected_source.name);enable_tracking&&trackAction("Set source",selected_source.name)}
function targetSearchInput(){enable_piwik&&piwikTracker.trackPageView("Set search target");void 0!=selected_target&&(selected_target.fixed=!1,highlightNode(selected_target,"focus",!1,!0,svg_circular),clearSearchResult());var a=active_node_map[this.value];selected_target=a;if(!a.isActive){var b=findActiveParent(a);if(void 0===b)b=findActiveDescends(a),combineRegions(a,b);else{var c=findDescAtDepth(b,a.depth);expandRegion(b,c,svg_circular)}}highlightNode(a,"focus",!0,!0,svg_circular);enable_owa&&OWATracker.trackAction("UI",
"Set target",selected_target.name);enable_tracking&&trackAction("Set target",selected_target.name)}function clearSearchResult(){}function setMaxHop(){enable_piwik&&piwikTracker.trackPageView("Set max hop");enable_owa&&OWATracker.trackAction("UI","Set max hop",this.value);enable_tracking&&trackAction("Set max hop",this.value);max_hop=this.value;document.getElementById("maxHopValue").innerHTML=max_hop}
function displayConnectionInfo(a){d3.selectAll("#conn-info .exp").remove();d3.select("#conn-info #src-name").html("Source: "+a.source.name);d3.select("#conn-info #tgt-name").html("Target: "+a.target.name);var b=a.paper,c=d3.select("#paper-list");c.selectAll("p").remove();c=c.append("p");1>b.length?c.html("This is a meta link. See the derived connections for more information"):(c.selectAll("p").data(b).enter().append("p").html(function(a){a=paper_map[a];return'<a href="'+a.url+'" target="_blank" class="paperLink">'+
a.title+"</a>"}),d3.selectAll(".paperLink").on("click",paperClick));b=d3.select("#bams-list");b.selectAll("p").remove();c=b.append("p");c.html("Links to BAMS records will be added in future updates");a=a.children;b=d3.select("#sub-con-list");b.selectAll("p").remove();c=b.append("p");1>a.length?c.html("There are no sub-connections for this link."):c.selectAll("p").data(a).enter().append("p").html(function(a){a=active_link_map[a];return"Source: "+a.source.name+"; Target: "+a.target.name})};function expandRegion(a,b){var c=b.length;if(!(1>c)){for(var d=a.circ.start_angle,e=(a.circ.end_angle-d)/c,g=[],h=[],f=active_data_links.length;f--;){var j=active_data_links[f];j.source===a?(h.push(j.target),active_data_links.splice(f,1)):j.target===a&&(g.push(j.source),active_data_links.splice(f,1))}f=$.inArray(a,active_data_nodes);active_data_nodes[f].isActive=!1;for(var j=g.length,l=h.length,i=active_data_nodes.length+c-1,q=2*Math.PI/i,m=i-1;m>f;--m)active_data_nodes[m]=active_data_nodes[m-c+1];
console.log(active_node_link_map);for(m=f;m<f+c;++m){var p=b[m-f];calculateArcPositions(p,d,e,m-f);p.color=a.color;p.isActive=!0;active_data_nodes[m]=p;for(var n=0;n<j;++n){var k=g[n],k=k.key+"-"+p.key;console.log(k);k=active_node_link_map[k];void 0!==k&&active_data_links.push(k)}for(n=0;n<l;++n)k=h[n],k=p.key+"-"+k.key,console.log(k),k=active_node_link_map[k],void 0!==k&&active_data_links.push(k)}for(m=0;m<c;++m)for(n=m+1;n<c;++n)k=b[m].key+"-"+b[n].key,console.log(k),k=active_node_link_map[k],void 0!==
k&&active_data_links.push(k),k=b[n].key+"-"+b[m].key,k=active_node_link_map[k],void 0!==k&&active_data_links.push(k);updateCircularLayout(i,q)}}function updateCircularLayout(a,b){exitCircularNodes();exitCircularLinks();enterCircularNodes();enterCircularLinks();for(var c=0;c<a;++c)calculateArcPositions(active_data_nodes[c],0,b,c);updateCircularNodes();updateCircularLinks();updateCircularTexts()}
function nodeClick(a){if(d3.event.shiftKey){if(enable_piwik&&piwikTracker.trackPageView("Combine node in circular view"),enable_owa&&OWATracker.trackAction("Viz","Combine circular node",a.name),enable_tracking&&trackAction("Combine circular node",a.name),!(void 0===a.parent||null===a.parent)){var a=active_node_map[a.parent],b=findActiveDescends(a);combineRegions(a,b)}}else{enable_piwik&&piwikTracker.trackPageView("Expand node in circular view");enable_owa&&OWATracker.trackAction("Viz","Expand circular node",
a.name);enable_tracking&&trackAction("Expand circular node",a.name);for(var b=[],c=a.children,d=c.length,e=0;e<d;++e)b.push(active_node_map[c[e]]);expandRegion(a,b,svg_circular)}}
function nodeMouseOver(a,b){current_mode!==mode.search&&(b.selectAll(".circular.node").classed("nofocus",function(b){var b=b.key,d=a.key,e=active_node_in_neighbor_map[d],g=active_node_out_neighbor_map[d];return b!==d&&0>$.inArray(b,e)&&0>$.inArray(b,g)}),b.selectAll(".circular.link").classed("nofocus",function(b){return b.source.key!==a.key&&b.target.key!==a.key}),b.selectAll(".circular.text").classed("visible",function(b){var b=b.key,d=a.key,e=active_node_in_neighbor_map[d],g=active_node_out_neighbor_map[d];
return b===d||0<=$.inArray(b,e)||0<=$.inArray(b,g)}))}function nodeMouseOut(a,b){current_mode!==mode.search&&(b.selectAll(".circular.node").classed("nofocus",!1),b.selectAll(".circular.link").classed("nofocus",!1),updateCircularTexts())}
function linkClick(a){enable_piwik&&piwikTracker.trackPageView("Click link in circular view");enable_owa&&OWATracker.trackAction("Viz","Click circular link",a.source.name+"-"+a.target.name);enable_tracking&&trackAction("Click circular link",a.source.name+"-"+a.target.name);displayConnectionInfo(a)}
function linkMouseOver(a,b){b.selectAll(".circular.node").classed("nofocus",function(b){return b.key!==a.source.key&&b.key!==a.target.key});b.selectAll(".circular.link").classed("nofocus",function(b){return b.key!==a.key});b.selectAll(".circular.text").classed("visible",function(b){return b.key===a.source.key||b.key===a.target.key})}
function linkMouseOut(a,b){current_mode!==mode.search&&(b.selectAll(".circular.node").classed("nofocus",!1),b.selectAll(".circular.link").classed("nofocus",!1),updateCircularTexts())}function forceNodeClick(a){enable_piwik&&piwikTracker.trackPageView("Click link in nodelink view");enable_owa&&OWATracker.trackAction("Viz","Click force node",a.name);enable_tracking&&trackAction("Click force node",a.name)}
function forceNodeMouseOver(a){current_mode!==mode.search&&(svg_force.selectAll(".nodelink.node").classed("nofocus",function(b){var b=b.key,c=a.key,d=active_node_in_neighbor_map[c],e=active_node_out_neighbor_map[c];return b!==c&&0>$.inArray(b,d)&&0>$.inArray(b,e)}),svg_force.selectAll(".nodelink.link").classed("nofocus",function(b){return b.source.key!==a.key&&b.target.key!==a.key}),svg_force.selectAll(".nodelink.text").classed("visible",function(b){var b=b.key,c=a.key,d=active_node_in_neighbor_map[c],
e=active_node_out_neighbor_map[c];return b===c||0<=$.inArray(b,d)||0<=$.inArray(b,e)}))}function forceNodeMouseOut(){current_mode!==mode.search&&(svg_force.selectAll(".circular.node").classed("nofocus",!1),svg_force.selectAll(".circular.link").classed("nofocus",!1),svg_force.selectAll(".nodelink.text").classed("visible",!0))}
function forceLinkClick(a){enable_piwik&&piwikTracker.trackPageView("Click link in nodelink view");enable_owa&&OWATracker.trackAction("Viz","Click force link",a.source.name+"-"+a.target.name);enable_tracking&&trackAction("Click force link",a.source.name+"-"+a.target.name);displayConnectionInfo(a)}
function forceLinkMouseOver(a){svg_force.selectAll(".nodelink.node").classed("nofocus",function(b){return b.key!==a.source.key&&b.key!==a.target.key});svg_force.selectAll(".nodelink.link").classed("nofocus",function(b){return b.key!==a.key});svg_force.selectAll(".nodelink.text").classed("visible",function(b){return b.key===a.source.key||b.key===a.target.key})}
function forceLinkMouseOut(){current_mode!==mode.search&&(svg_force.selectAll(".nodelink.node").classed("nofocus",!1),svg_force.selectAll(".nodelink.link").classed("nofocus",!1),svg_force.selectAll(".nodelink.text").classed("visible",!0))}
function enterCircularNodes(){svg_circular.selectAll(".circular.node").data(active_data_nodes,function(a){return a.key}).enter().append("svg:path").style("fill",function(a){return a.color}).style("stroke","gray").attr("d",arcs).attr("class","circular node").attr("id",function(a){return"circ-node-"+a.key}).on("click",nodeClick).on("mouseover",function(a){nodeMouseOver(a,svg_circular)}).on("mouseout",function(a){nodeMouseOut(a,svg_circular)});svg_circular.selectAll(".circular.text").data(active_data_nodes,
function(a){return a.key}).enter().append("svg:text").attr("x",function(a){return a.circ.x}).attr("y",function(a){return a.circ.y}).attr("class","circular text").attr("id",function(a){return"text-"+a.key}).text(function(a){return a.name})}
function enterCircularLinks(){svg_circular.selectAll(".circular.link").data(active_data_links,function(a){return a.key}).enter().append("svg:path").attr("d",function(a){return curves([{x:a.source.circ.x,y:a.source.circ.y},{x:0,y:0},{x:a.target.circ.x,y:a.target.circ.y}])}).attr("class","circular link").attr("id",function(a){return"circ-link-"+a.key}).on("mouseover",function(a){linkMouseOver(a,svg_circular)}).on("mouseout",function(a){linkMouseOut(a,svg_circular)}).on("click",linkClick)}
function exitCircularNodes(){svg_circular.selectAll(".circular.node").data(active_data_nodes,function(a){return a.key}).exit().remove();svg_circular.selectAll(".circular.text").data(active_data_nodes,function(a){return a.key}).exit().remove()}function exitCircularLinks(){svg_circular.selectAll(".circular.link").data(active_data_links,function(a){return a.key}).exit().remove()}
function updateCircularNodes(){svg_circular.selectAll(".circular.node").data(active_data_nodes,function(a){return a.key}).transition().duration(1E3).attr("d",arcs);svg_circular.selectAll(".circular.text").data(active_data_nodes,function(a){return a.key}).transition().duration(1E3).attr("x",function(a){return a.circ.x}).attr("y",function(a){return a.circ.y})}
function updateCircularLinks(){svg_circular.selectAll(".circular.link").data(active_data_links,function(a){return a.key}).transition().duration(1E3).attr("d",function(a){return curves([{x:a.source.circ.x,y:a.source.circ.y},{x:0,y:0},{x:a.target.circ.x,y:a.target.circ.y}])})}function updateCircularTexts(){svg_circular.selectAll(".circular.text").classed("visible",function(a){a=a.circ;return a.end_angle-a.start_angle>Math.PI/12})}
function updateForceLayout(){var a=0,b={};active_data_nodes_force.forEach(function(c){b[c.group]?b[c.group][1]+=1:(++a,b[c.group]=[a,1])});selected_source.fixed=!0;selected_target.fixed=!0;selected_source.x=200;selected_source.y=400;selected_target.x=600;selected_target.y=400;force=d3.layout.force().nodes(active_data_nodes_force).links(active_data_links_force).size([vis_width,vis_height]).linkDistance(function(a){var c=b[a.source.group],d=b[a.target.group];return 30*Math.max(a.source.group!=a.target.group?
c[1]:2/c[1],a.source.group!=a.target.group?d[1]:2/d[1])+20}).linkStrength(1).charge(-6E3).friction(0.5).start();svg_force.selectAll(".link").remove();svg_force.selectAll(".node").remove();svg_force.selectAll(".text").remove();var c=svg_force.selectAll(".nodelink.link").data(active_data_links_force,function(a){return a.key}).enter().append("svg:line").attr("class","nodelink link").style("stroke-width",3).on("click",forceLinkClick).on("mouseover",forceLinkMouseOver).on("mouseout",forceLinkMouseOut),
d=svg_force.selectAll(".nodelink.node").data(active_data_nodes_force,function(a){return a.key}).enter().append("svg:circle").attr("class","nodelink node").attr("cx",function(a){return a.x}).attr("cy",function(a){return a.y}).attr("r",function(a){return a===selected_source||a===selected_target?20:10}).style("fill",function(a){return a.color}).on("click",forceNodeClick).on("mouseover",forceNodeMouseOver).on("mouseout",forceNodeMouseOut).call(force.drag),e=svg_force.append("svg:g").selectAll("g").data(force.nodes()).enter().append("g").append("svg:text").attr("x",
8).attr("y",".31em").attr("class","nodelink text visible").text(function(a){return a.name});force.on("tick",function(){c.attr("x1",function(a){return a.source.x}).attr("y1",function(a){return a.source.y}).attr("x2",function(a){return a.target.x}).attr("y2",function(a){return a.target.y});d.attr("cx",function(a){return a.x}).attr("cy",function(a){return a.y});e.attr("transform",function(a){return"translate("+a.x+","+a.y+")"})})}
function highlightNode(a,b,c,d,e){void 0!==a&&(e.selectAll(".circular.node").classed(b,function(b){return b.key===a.key}),d&&e.select("#text-"+a.key).classed("visible",c))}function expandNode(){}function expandLink(){}
function arcTween(a){var b=d3.interpolate({start_angle:a.circ.old_start_angle,end_angle:a.circ.old_end_angle},a);return function(c){c=b(c);console.log(c);a.circ.old_start_angle=c.start_angle;a.circ.old_end_angle=c.end_angle;c.circ.start_angle=c.start_angle;c.circ.end_angle=c.end_angle;return arcs(c)}};function visualizeUserData(a){console.log(a);a=user_datasets[a];initActiveNodes(a.node_map);computeCircularNodesParameters(active_data_nodes);initActiveLinks(a.link_map);clearCanvases();enterCircularNodes();enterCircularLinks();updateCircularTexts()}function clearCanvases(){svg_circular.selectAll(".circular").remove();svg_force.selectAll(".force").remove()}
function combineRegions(a,b){for(var c=b.length,d=active_data_links.length;d--;)for(var e=active_data_links[d],g=0;g<c;++g){var h=b[g];(e.source===h||e.target===h)&&active_data_links.splice(d,1)}g=$.inArray(b[0],active_data_nodes);d=active_data_nodes[g];d.isActive=!1;a.circ=d.circ;a.isActive=!0;active_data_nodes[g]=a;for(g=1;g<c;++g)d=b[g],d.isActive=!1,d=$.inArray(d,active_data_nodes),active_data_nodes.splice(d,1);c=active_data_nodes.length;d=2*Math.PI/c;e=a.key;for(g=0;g<c;++g){var h=active_data_nodes[g].key,
f=e+"-"+h,f=active_node_link_map[f];void 0!==f&&active_data_links.push(f);f=h+"-"+e;f=active_node_link_map[f];void 0!==f&&active_data_links.push(f)}updateCircularLayout(c,d)}
function assignColors(a){var b=0,c=[],d;for(d in a){var e=a[d];1===e.depth&&(b+=1,e.group=e.key,c.push(e))}e=[];for(d=0;d<b;++d)e.push(colorPalette[d]);d3.scale.ordinal().domain(d3.range(b)).range(e);for(d=0;d<b;++d)c[d].color=e[d];for(;0<c.length;){var b=c[0],e=b.children,g=e.length;for(d=0;d<g;++d){var h=a[e[d]];h.color=b.color;h.group=b.group;c.push(h)}c.splice(0,1)}}function computeCircularNodesParameters(a){for(var b=a.length,c=2*Math.PI/b,d=0;d<b;++d)calculateArcPositions(a[d],0,c,d)}
function calculateArcPositions(a,b,c,d){a.circ.start_angle=b+c*d;a.circ.end_angle=b+c*(d+1);b=c*(d+0.5)+b;c=inner_radius+(outer_radius-inner_radius)/2;a.circ.x=c*Math.cos(Math.PI/2-b);a.circ.y=-c*Math.sin(Math.PI/2-b)}function stash(a){a.circ.old_start_angle=a.circ.start_angle;a.circ.old_end_angle=a.circ.end_angle}
function constructUserDataMaps(a,b,c){user_datasets[a]={};constructUserNodesMaps(a,b);constructUserLinksMaps(a,c);constructLinkHierarchy(a,c);assignColors(user_datasets[a].node_map);console.log("Color assigned");console.log(user_datasets[a])}
function constructUserNodesMaps(a,b){for(var c={},d={},e={},g=b.length,h=0;h<g;++h){var f=b[h];f.key=parseInt(f.key);f.depth=parseInt(f.depth);f.parent=null===f.parentKey?null:parseInt(f.parentKey);f.circ={};f.children=[];c[f.key]=f;d[f.key]=[];e[f.key]=[]}for(var j in c)f=c[j],null!==f.parent&&c[f.parent].children.push(f.key);user_datasets[a].node_map=c;user_datasets[a].node_in_neighbor_map=d;user_datasets[a].node_out_neighbor_map=e}
function constructUserLinksMaps(a,b){for(var c={},d={},e=user_datasets[a],g=b.length,h=0;h<g;++h){var f=b[h],j=parseInt(f.sourceKey),l=parseInt(f.targetKey),f={key:parseInt(f.key),source:e.node_map[j],target:e.node_map[l],notes:null,children:[]};c[f.key]=f;d[f.source.key+"-"+f.target.key]=f;e.node_in_neighbor_map[l].push(j);e.node_out_neighbor_map[j].push(l)}e.link_map=c;e.node_link_map=d;console.log(e)}
function constructLinkHierarchy(a,b){for(var c=b.length,d=0,e=0;e<c;++e){var g=parseInt(b[e].key);g>d&&(d=g)}for(var h=user_datasets[a],e=0;e<c;++e){var g=parseInt(b[e].key),f=h.link_map[g],j=f.source,f=f.target;if(null!==j.parent){var l=j.parent+"-"+f.key,i=h.node_link_map[l];void 0===i?(d+=1,i={key:d,source:h.node_map[parseInt(j.parent)],target:f,notes:null,children:[g]},h.link_map[d]=i,h.node_link_map[l]=i,b.push(i),c+=1):0>$.inArray(g,i.children)&&i.children.push(g)}null!==f.parent&&(l=j.key+
"-"+f.parent,i=h.node_link_map[l],void 0===i?(d+=1,i={key:d,source:j,target:h.node_map[parseInt(f.parent)],notes:null,children:[g]},h.link_map[d]=i,h.node_link_map[l]=i,b.push(i),c+=1):0>$.inArray(g,i.children)&&i.children.push(g));null!==j.parent&&null!==f.parent&&(l=j.parent+"-"+f.parent,i=h.node_link_map[l],void 0===i?(d+=1,i={key:d,source:h.node_map[parseInt(j.parent)],target:h.node_map[parseInt(f.parent)],notes:null,children:[g]},h.link_map[d]=i,h.node_link_map[l]=i,b.push(i),c+=1):0>$.inArray(g,
i.children)&&i.children.push(g))}console.log(h.link_map);console.log(h.node_link_map)}function findActiveParent(a){for(;void 0!==a&&null!==a&&!a.isActive;)a=active_node_map[a.parent];return a}function findActiveDescends(a){for(var b=active_data_nodes.length,c=[],d=0;d<b;++d){var e=active_data_nodes[d];if(!(void 0===e.parent||null===e.parent))for(var g=active_node_map[e.parent];void 0!==g&&null!==g;){if(g===a){c.push(e);break}g=active_node_map[g.parent]}}return c}
function findDescAtDepth(a,b){for(var c=[a];0<c.length&&c[0].depth<b;){for(var d=c[0].children,e=d.length,g=0;g<e;++g)c.push(active_node_map[d[g]]);c.splice(0,1)}return c}function initActiveNodes(a){active_data_nodes=[];for(var b in a){var c=a[b];1===c.depth&&(c.isActive=!0,active_data_nodes.push(c))}}function initActiveLinks(a){active_data_links=[];for(var b in a){var c=a[b];1===c.source.depth&&1===c.target.depth&&active_data_links.push(c)}}
function calculatePaths(a){var b=0,c=[],d=[];c[0]=[selected_source];for(var e=selected_source.depth,g=selected_target.depth,h=Math.min(e,g),e=Math.max(e,g);0<c.length&&c[0].length<=a+2;){g=c[0];c.splice(0,1);var f=g[g.length-1];if(f.key===selected_target.key)d.push(g);else if(!(g.length>=a+2)){for(var f=active_node_out_neighbor_map[f.key],j=f.length,l=0;l<j;++l){var i=active_node_map[f[l]];i.depth>=h&&i.depth<=e&&c.push(g.concat(i))}b++;if(5E3<b){enable_owa&&(console.log(selected_source),console.log(selected_target),
OWATracker.trackAction("Warning","Path size limit reached",selected_source.name+"-"+selected_target+"-"+max_hop));console.log("Reached path limit.");break}}}return d}
function populateForceElements(a){var b=a.length;active_data_nodes_force=[];active_data_links_force=[];for(var c=0;c<b;++c)for(var d=a[c],e=d.length-1,g=0;g<e;++g){var h=d[g],f=d[g+1],j=active_node_link_map[h.key+"-"+f.key];0>$.inArray(j,active_data_links_force)&&active_data_links_force.push(j);0>$.inArray(h,active_data_nodes_force)&&active_data_nodes_force.push(h);0>$.inArray(f,active_data_nodes_force)&&active_data_nodes_force.push(f)}}
function startSession(){sessionStartTime=new Date;startTime=new Date;document.onmousemove=recordMouseMovement}function recordActionData(){actionData.push({timeElapsed:currentActionData.timeElapsed,mouseTrace:currentActionData.mouseTrace,actionBasic:currentActionData.actionBasic,actionDetail:currentActionData.actionDetail,time:currentActionData.time});startTime=new Date;currentActionData={timeElapsed:-1,mouseTrace:"",actionBasic:"",actionDetail:"",time:-1}}
function recordMouseMovement(a){2950<currentActionData.mouseTrace.length||(currentActionData.mouseTrace+="x:"+a.pageX+",y:"+a.pageY+",time:"+(new Date-startTime)+";")}function trackAction(a,b){currentActionData.actionBasic=a;currentActionData.actionDetail=b;endTime=new Date;currentActionData.timeElapsed=(endTime-startTime)/1E3;currentActionData.time=endTime.toString();recordActionData()}
function paperClick(){var a=$(this).text();enable_owa&&OWATracker.trackAction("UI","Click paper",a);enable_tracking&&(console.log("tracking paper click"),trackAction("Click paper",a))}
function saveSessionData(){sessionEndTime=new Date;var a=sessionEndTime-sessionStartTime;$.ajax({type:"POST",url:"media/php/writeActionData.php",data:{actionDataArray:actionData,sessionLength:a/1E3,userID:uid},error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Successfully passed data to php.");console.log(a)},async:!1})}
function populateUserId(){$.ajax({type:"POST",url:"media/php/getUserID.php",error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Success");uid=a;populateDatasets(uid)},async:!1})}
function populateDatasets(a){$.ajax({type:"POST",url:"media/php/getDatasetByUserId.php",data:{userID:a},error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Populate dataset success");console.log(a);dataset_list=$.parseJSON(a);populateDatasetUI()},async:!1})}
function createDataset(a,b){$.ajax({type:"POST",url:"media/php/addDataset.php",data:{datasetName:a,userID:b},error:function(a){console.log("Failed");console.log(a)},success:function(b){console.log("Success");$("#dataSelect").append(new Option(a,b));$("#dataSelect").trigger("liszt:updated");$("#createDatasetSuccessAlert").show()},async:!0})}
function getBrainData(a){$.ajax({type:"POST",url:"media/php/getBrainData.php",data:{datasetKey:a},error:function(a){console.log("Failed");console.log(a)},success:function(b){console.log("Successfully passed data to php.");b=$.parseJSON(b);constructUserDataMaps(a,b.nodes,b.links);b=user_datasets[a];active_node_map=b.node_map;active_node_link_map=b.node_link_map;active_node_in_neighbor_map=b.node_in_neighbor_map;active_node_out_neighbor_map=b.node_out_neighbor_map;updateOptions();visualizeUserData(a)},
async:!1})}function contains(a,b){for(var c=a.length,d=0;d<c;++d)if(b.key===a[d].key)return d;return-1};
