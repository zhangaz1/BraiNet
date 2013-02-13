var node_link_map,link_map,paper_map,node_map,node_in_neighbor_map,node_out_neighbor_map,link_rating_map,record_rating_map,dataset_list,uid,user_datasets={},is_preloaded_data=!0,selected_source,selected_target,active_data_nodes,active_data_links,active_data_nodes_force,active_data_links_force,active_node_map,active_node_link_map,active_node_in_neighbor_map,active_node_out_neighbor_map,active_link_map,svg_circular,svg_force,arcs,curves,links,force,vis_width=800,vis_height=800,inner_radius=0.32*Math.min(vis_width,
vis_height),outer_radius=1.2*inner_radius,directionType={"in":1,out:2,bi:3},mode={exploration:1,search:2,fixation:3},colorPalette=[d3.rgb(141,211,199).toString(),d3.rgb(255,255,179).toString(),d3.rgb(190,186,218).toString(),d3.rgb(251,128,114).toString(),d3.rgb(128,177,211).toString(),d3.rgb(253,180,98).toString(),d3.rgb(179,222,105).toString(),d3.rgb(252,205,229).toString(),d3.rgb(217,217,217).toString(),d3.rgb(188,128,189).toString(),d3.rgb(204,235,197).toString(),d3.rgb(255,237,111).toString()],
mutex=3,enable_piwik=!1,enable_owa=!1,enable_tracking=!0,current_mode=mode.exploration,max_hop=1,actionData=[],generalData=[],startTime=null,endTime=null,sessionStartTime,sessionEndTime,currentActionData={timeElapsed:-1,mouseTrace:"",actionBasic:"",actionDetail:"",time:-1};d3.json("media/data/test_node.json",function(a){node_map={};node_in_neighbor_map={};node_out_neighbor_map={};for(var c=a.length,b=0;b<c;++b){var d=a[b];d.circ={};node_map[d.key]=d;node_in_neighbor_map[d.key]=[];node_out_neighbor_map[d.key]=[]}for(var e in node_map){d=node_map[e];for(b=0;b<d.children.length;++b)a=node_map[d.children[b]],void 0!==a&&(a.parent=e)}mutex-=1});
d3.json("media/data/test_paper.json",function(a){paper_map={};for(var c=a.length,b=0;b<c;++b){var d=a[b];paper_map[d.key]=d}mutex-=1});
d3.json("media/data/test_link.json",function(a){link_map={};node_link_map={};for(var c=a.length,b=0;b<c;++b){var d=a[b],e={key:d.key,source:node_map[d.sourceKey],target:node_map[d.targetKey],paper:d.paper,children:d.children};link_map[e.key]=e;node_link_map[e.source.key+"-"+e.target.key]=e;node_in_neighbor_map[d.targetKey].push(d.sourceKey);node_out_neighbor_map[d.sourceKey].push(d.targetKey)}mutex-=1});populateUserId();waitForDataLoading();d3.select("#bt-search").on("click",searchButtonClick);
d3.select("#bt-clear").on("click",clearButtonClick);d3.select("#bt-createDatasets").on("click",createDatasetButtonClick);d3.select("#bt-manageDatasets").on("click",manageDatasetButtonClick);d3.select("#bt-applyDataset").on("click",applyDatasetButtonClick);d3.select("#maxHop").on("change",setMaxHop);$("#sourceSelect").change(sourceSearchInput);$("#targetSelect").change(targetSearchInput);window.onbeforeunload=saveSessionData;window.onload=startSession;
function renderCanvas(){console.log("2");console.log(node_map);assignColors(node_map);initActiveNodes(node_map);computeCircularNodesParameters(active_data_nodes);initActiveLinks(link_map);arcs=d3.svg.arc().innerRadius(inner_radius).outerRadius(outer_radius).startAngle(function(a){return a.circ.start_angle}).endAngle(function(a){return a.circ.end_angle});curves=d3.svg.line().x(function(a){return a.x}).y(function(a){return a.y}).interpolate("basis");svg_circular=d3.select("#canvas-circular").append("svg").attr("width",
vis_width).attr("height",vis_height).append("g").attr("transform","translate("+vis_width/2+","+vis_height/2+")").append("g");svg_force=d3.select("#canvas-force").append("svg").attr("width",vis_width).attr("height",vis_height).append("g");enterCircularNodes();enterCircularLinks();updateCircularTexts()}function setupUIElements(){appendNodesAsOptions(node_map)}
function waitForDataLoading(){0<mutex?setTimeout(function(){waitForDataLoading()},1E3):(active_node_map=node_map,active_node_link_map=node_link_map,active_node_in_neighbor_map=node_in_neighbor_map,active_node_out_neighbor_map=node_out_neighbor_map,active_link_map=link_map,renderCanvas(),setupUIElements())};function appendNodesAsOptions(a){for(var c in a){var b=a[c];$("#sourceSelect").append(new Option(b.name,c,!1,!1));$("#targetSelect").append(new Option(b.name,c,!1,!1))}$(".chzn-select").chosen({allow_single_deselect:!0});$("#sourceSelect").trigger("liszt:updated");$("#targetSelect").trigger("liszt:updated")}
function updateOptions(){$("#sourceSelect").find("option").remove();$("#targetSelect").find("option").remove();$("#sourceSelect").trigger("liszt:updated");$("#targetSelect").trigger("liszt:updated");appendNodesAsOptions(active_node_map)}function populateDatasetUI(){console.log("testing user id");console.log(uid);var a=dataset_list.length;console.log(dataset_list);for(var c=0;c<a;++c){var b=dataset_list[c];$("#dataSelect").append(new Option(b[1],b[0]))}}
function createDatasetButtonClick(){createDataset($('[name="datasetName"]').val(),uid)}function manageDatasetButtonClick(){var a=$("#dataSelect :selected").text(),c=$("#dataSelect").val();window.open("media/php/manageDataset.php?datasetName="+a+"&datasetID="+c,"Manage Datasets","width=800, height=800")}function applyDatasetButtonClick(){var a=parseInt($("#dataSelect").val());""!==a&&void 0===user_datasets[a]&&getBrainData(a)}
function searchButtonClick(){enable_piwik&&piwikTracker.trackPageView("Search:"+selected_source.name+"-"+selected_target.name);enable_owa&&OWATracker.trackAction("UI","Search",selected_source.name+"-"+selected_target.name);enable_tracking&&trackAction("Search",selected_source.name+"-"+selected_target.name);var a=calculatePaths(max_hop);populateForceElements(a);updateForceLayout()}function clearButtonClick(){enable_piwik&&piwikTracker.trackPageView("Click clear button")}
function sourceSearchInput(){enable_piwik&&piwikTracker.trackPageView("Set search source");void 0!=selected_source&&(selected_source.fixed=!1,highlightNode(selected_source,"focus",!1,!0,svg_circular),clearSearchResult());var a=active_node_map[this.value];selected_source=a;if(!a.isActive){var c=findActiveParent(a);if(void 0===c)c=findActiveDescends(a),combineRegions(a,c);else{var b=findDescAtDepth(c,a.depth);expandRegion(c,b,svg_circular)}}highlightNode(a,"focus",!0,!0,svg_circular);enable_owa&&OWATracker.trackAction("UI",
"Set source",selected_source.name);enable_tracking&&trackAction("Set source",selected_source.name)}
function targetSearchInput(){enable_piwik&&piwikTracker.trackPageView("Set search target");void 0!=selected_target&&(selected_target.fixed=!1,highlightNode(selected_target,"focus",!1,!0,svg_circular),clearSearchResult());var a=active_node_map[this.value];selected_target=a;if(!a.isActive){var c=findActiveParent(a);if(void 0===c)c=findActiveDescends(a),combineRegions(a,c);else{var b=findDescAtDepth(c,a.depth);expandRegion(c,b,svg_circular)}}highlightNode(a,"focus",!0,!0,svg_circular);enable_owa&&OWATracker.trackAction("UI",
"Set target",selected_target.name);enable_tracking&&trackAction("Set target",selected_target.name)}function clearSearchResult(){}function setMaxHop(){enable_piwik&&piwikTracker.trackPageView("Set max hop");enable_owa&&OWATracker.trackAction("UI","Set max hop",this.value);enable_tracking&&trackAction("Set max hop",this.value);max_hop=this.value;document.getElementById("maxHopValue").innerHTML=max_hop}
function displayConnectionInfo(a){d3.selectAll("#conn-info .exp").remove();d3.select("#conn-info #src-name").html("Source: "+a.source.name);d3.select("#conn-info #tgt-name").html("Target: "+a.target.name);var c=active_node_link_map[a.target.key+"-"+a.source.key];if(!is_preloaded_data){var b=d3.select("#notes");b.selectAll("div").remove();b.selectAll("p").remove();for(var b=b.append("div"),d="<p>Current link: "+a.source.name+"-"+a.target.name+"</p>",d=a.isDerived?d+"<p>This is a meta link. See the derived connections for user entered notes.</p>":
d+("<p>"+a.notes+"</p>"),d=d+'<p>Children links:</p><table class="table table-bordered table-striped table-condensed"><tr class="tableTitle"><td>Source</td><td>Target</td><td>Notes</td></tr>',e=a.base_children.length,g=0;g<e;++g)var h=active_link_map[a.base_children[g]],d=d+("<tr><td>"+h.source.name+"</td><td>"+h.target.name+"</td><td>"+h.notes+"</td></tr>");d+="</table>";if(void 0!==c){d+="<p>Current link: "+a.target.name+"-"+a.source.name+"</p>";d=c.isDerived?d+"<p>This is a meta link. See the derived connections for user entered notes.</p>":
d+("<p>"+c.notes+"</p>");d+="<p>Children links:</p>";d+='<table class="table table-bordered table-striped table-condensed"><tr class="tableTitle"><td>Source</td><td>Target</td><td>Notes</td></tr>';e=c.base_children.length;for(g=0;g<e;++g)h=active_link_map[c.base_children[g]],d+="<tr><td>"+h.source.name+"</td><td>"+h.target.name+"</td><td>"+h.notes+"</td></tr>";d+="</table>"}b.html(d)}is_preloaded_data&&(c=a.paper,b=d3.select("#paper-list"),b.selectAll("p").remove(),b=b.append("p"),1>c.length?b.html("This is a meta link. See the derived connections for more information"):
(b.selectAll("p").data(c).enter().append("p").html(function(a){a=paper_map[a];return'<a href="'+a.url+'" target="_blank" class="paperLink">'+a.title+"</a>"}),d3.selectAll(".paperLink").on("click",paperClick)),b=d3.select("#bams-list"),b.selectAll("p").remove(),b=b.append("p"),b.html("Links to BAMS records will be added in future updates"));a=a.children;b=d3.select("#sub-con-list");b.selectAll("p").remove();b=b.append("p");1>a.length?b.html("There are no sub-connections for this link."):b.selectAll("p").data(a).enter().append("p").html(function(a){a=
active_link_map[a];return"Source: "+a.source.name+"; Target: "+a.target.name})};function expandRegion(a,c){var b=c.length;if(!(1>b)){for(var d=a.circ.start_angle,e=(a.circ.end_angle-d)/b,g=[],h=[],f=active_data_links.length;f--;){var k=active_data_links[f];k.source===a?(h.push(k.target),active_data_links.splice(f,1)):k.target===a&&(g.push(k.source),active_data_links.splice(f,1))}f=$.inArray(a,active_data_nodes);active_data_nodes[f].isActive=!1;for(var k=g.length,m=h.length,n=active_data_nodes.length+b-1,q=2*Math.PI/n,l=n-1;l>f;--l)active_data_nodes[l]=active_data_nodes[l-b+1];
console.log(active_node_link_map);for(l=f;l<f+b;++l){var p=c[l-f];calculateArcPositions(p,d,e,l-f);p.color=a.color;p.isActive=!0;active_data_nodes[l]=p;for(var j=0;j<k;++j){var i=g[j],i=i.key+"-"+p.key;console.log(i);i=active_node_link_map[i];void 0!==i&&active_data_links.push(i)}for(j=0;j<m;++j)i=h[j],i=p.key+"-"+i.key,console.log(i),i=active_node_link_map[i],void 0!==i&&active_data_links.push(i)}for(l=0;l<b;++l)for(j=l+1;j<b;++j)i=c[l].key+"-"+c[j].key,console.log(i),i=active_node_link_map[i],void 0!==
i&&active_data_links.push(i),i=c[j].key+"-"+c[l].key,i=active_node_link_map[i],void 0!==i&&active_data_links.push(i);updateCircularLayout(n,q)}}function updateCircularLayout(a,c){exitCircularNodes();exitCircularLinks();enterCircularNodes();enterCircularLinks();for(var b=0;b<a;++b)calculateArcPositions(active_data_nodes[b],0,c,b);updateCircularNodes();updateCircularLinks();updateCircularTexts()}
function nodeClick(a){if(d3.event.shiftKey){if(enable_piwik&&piwikTracker.trackPageView("Combine node in circular view"),enable_owa&&OWATracker.trackAction("Viz","Combine circular node",a.name),enable_tracking&&trackAction("Combine circular node",a.name),!(void 0===a.parent||null===a.parent)){var a=active_node_map[a.parent],c=findActiveDescends(a);combineRegions(a,c)}}else{enable_piwik&&piwikTracker.trackPageView("Expand node in circular view");enable_owa&&OWATracker.trackAction("Viz","Expand circular node",
a.name);enable_tracking&&trackAction("Expand circular node",a.name);for(var c=[],b=a.children,d=b.length,e=0;e<d;++e)c.push(active_node_map[b[e]]);expandRegion(a,c,svg_circular)}}
function nodeMouseOver(a,c){current_mode!==mode.search&&(c.selectAll(".circular.node").classed("nofocus",function(b){var b=b.key,c=a.key,e=active_node_in_neighbor_map[c],g=active_node_out_neighbor_map[c];return b!==c&&0>$.inArray(b,e)&&0>$.inArray(b,g)}),c.selectAll(".circular.link").classed("nofocus",function(b){return b.source.key!==a.key&&b.target.key!==a.key}),c.selectAll(".circular.text").classed("visible",function(b){var b=b.key,c=a.key,e=active_node_in_neighbor_map[c],g=active_node_out_neighbor_map[c];
return b===c||0<=$.inArray(b,e)||0<=$.inArray(b,g)}))}function nodeMouseOut(a,c){current_mode!==mode.search&&(c.selectAll(".circular.node").classed("nofocus",!1),c.selectAll(".circular.link").classed("nofocus",!1),updateCircularTexts())}
function linkClick(a){enable_piwik&&piwikTracker.trackPageView("Click link in circular view");enable_owa&&OWATracker.trackAction("Viz","Click circular link",a.source.name+"-"+a.target.name);enable_tracking&&trackAction("Click circular link",a.source.name+"-"+a.target.name);displayConnectionInfo(a)}
function linkMouseOver(a,c){c.selectAll(".circular.node").classed("nofocus",function(b){return b.key!==a.source.key&&b.key!==a.target.key});c.selectAll(".circular.link").classed("nofocus",function(b){return b.key!==a.key});c.selectAll(".circular.text").classed("visible",function(b){return b.key===a.source.key||b.key===a.target.key})}
function linkMouseOut(a,c){current_mode!==mode.search&&(c.selectAll(".circular.node").classed("nofocus",!1),c.selectAll(".circular.link").classed("nofocus",!1),updateCircularTexts())}function forceNodeClick(a){enable_piwik&&piwikTracker.trackPageView("Click link in nodelink view");enable_owa&&OWATracker.trackAction("Viz","Click force node",a.name);enable_tracking&&trackAction("Click force node",a.name)}
function forceNodeMouseOver(a){current_mode!==mode.search&&(svg_force.selectAll(".nodelink.node").classed("nofocus",function(c){var c=c.key,b=a.key,d=active_node_in_neighbor_map[b],e=active_node_out_neighbor_map[b];return c!==b&&0>$.inArray(c,d)&&0>$.inArray(c,e)}),svg_force.selectAll(".nodelink.link").classed("nofocus",function(c){return c.source.key!==a.key&&c.target.key!==a.key}),svg_force.selectAll(".nodelink.text").classed("visible",function(c){var c=c.key,b=a.key,d=active_node_in_neighbor_map[b],
e=active_node_out_neighbor_map[b];return c===b||0<=$.inArray(c,d)||0<=$.inArray(c,e)}))}function forceNodeMouseOut(){current_mode!==mode.search&&(svg_force.selectAll(".circular.node").classed("nofocus",!1),svg_force.selectAll(".circular.link").classed("nofocus",!1),svg_force.selectAll(".nodelink.text").classed("visible",!0))}
function forceLinkClick(a){enable_piwik&&piwikTracker.trackPageView("Click link in nodelink view");enable_owa&&OWATracker.trackAction("Viz","Click force link",a.source.name+"-"+a.target.name);enable_tracking&&trackAction("Click force link",a.source.name+"-"+a.target.name);displayConnectionInfo(a)}
function forceLinkMouseOver(a){svg_force.selectAll(".nodelink.node").classed("nofocus",function(c){return c.key!==a.source.key&&c.key!==a.target.key});svg_force.selectAll(".nodelink.link").classed("nofocus",function(c){return c.key!==a.key});svg_force.selectAll(".nodelink.text").classed("visible",function(c){return c.key===a.source.key||c.key===a.target.key})}
function forceLinkMouseOut(){current_mode!==mode.search&&(svg_force.selectAll(".nodelink.node").classed("nofocus",!1),svg_force.selectAll(".nodelink.link").classed("nofocus",!1),svg_force.selectAll(".nodelink.text").classed("visible",!0))}
function enterCircularNodes(){svg_circular.selectAll(".circular.node").data(active_data_nodes,function(a){return a.key}).enter().append("svg:path").style("fill",function(a){return a.color}).style("stroke","gray").attr("d",arcs).attr("class","circular node").attr("id",function(a){return"circ-node-"+a.key}).on("click",nodeClick).on("mouseover",function(a){nodeMouseOver(a,svg_circular)}).on("mouseout",function(a){nodeMouseOut(a,svg_circular)});svg_circular.selectAll(".circular.text").data(active_data_nodes,
function(a){return a.key}).enter().append("svg:text").attr("x",function(a){return a.circ.x}).attr("y",function(a){return a.circ.y}).attr("class","circular text").attr("id",function(a){return"text-"+a.key}).text(function(a){return a.name})}
function enterCircularLinks(){svg_circular.selectAll(".circular.link").data(active_data_links,function(a){return a.key}).enter().append("svg:path").attr("d",function(a){return curves([{x:a.source.circ.x,y:a.source.circ.y},{x:0,y:0},{x:a.target.circ.x,y:a.target.circ.y}])}).attr("class","circular link").attr("id",function(a){return"circ-link-"+a.key}).on("mouseover",function(a){linkMouseOver(a,svg_circular)}).on("mouseout",function(a){linkMouseOut(a,svg_circular)}).on("click",linkClick)}
function exitCircularNodes(){svg_circular.selectAll(".circular.node").data(active_data_nodes,function(a){return a.key}).exit().remove();svg_circular.selectAll(".circular.text").data(active_data_nodes,function(a){return a.key}).exit().remove()}function exitCircularLinks(){svg_circular.selectAll(".circular.link").data(active_data_links,function(a){return a.key}).exit().remove()}
function updateCircularNodes(){svg_circular.selectAll(".circular.node").data(active_data_nodes,function(a){return a.key}).transition().duration(1E3).attr("d",arcs);svg_circular.selectAll(".circular.text").data(active_data_nodes,function(a){return a.key}).transition().duration(1E3).attr("x",function(a){return a.circ.x}).attr("y",function(a){return a.circ.y})}
function updateCircularLinks(){svg_circular.selectAll(".circular.link").data(active_data_links,function(a){return a.key}).transition().duration(1E3).attr("d",function(a){return curves([{x:a.source.circ.x,y:a.source.circ.y},{x:0,y:0},{x:a.target.circ.x,y:a.target.circ.y}])})}function updateCircularTexts(){svg_circular.selectAll(".circular.text").classed("visible",function(a){a=a.circ;return a.end_angle-a.start_angle>Math.PI/12})}
function updateForceLayout(){var a=0,c={};active_data_nodes_force.forEach(function(b){c[b.group]?c[b.group][1]+=1:(++a,c[b.group]=[a,1])});selected_source.fixed=!0;selected_target.fixed=!0;selected_source.x=200;selected_source.y=400;selected_target.x=600;selected_target.y=400;force=d3.layout.force().nodes(active_data_nodes_force).links(active_data_links_force).size([vis_width,vis_height]).linkDistance(function(a){var b=c[a.source.group],d=c[a.target.group];return 30*Math.max(a.source.group!=a.target.group?
b[1]:2/b[1],a.source.group!=a.target.group?d[1]:2/d[1])+20}).linkStrength(1).charge(-6E3).friction(0.5).start();svg_force.selectAll(".link").remove();svg_force.selectAll(".node").remove();svg_force.selectAll(".text").remove();var b=svg_force.selectAll(".nodelink.link").data(active_data_links_force,function(a){return a.key}).enter().append("svg:line").attr("class","nodelink link").style("stroke-width",3).on("click",forceLinkClick).on("mouseover",forceLinkMouseOver).on("mouseout",forceLinkMouseOut),
d=svg_force.selectAll(".nodelink.node").data(active_data_nodes_force,function(a){return a.key}).enter().append("svg:circle").attr("class","nodelink node").attr("cx",function(a){return a.x}).attr("cy",function(a){return a.y}).attr("r",function(a){return a===selected_source||a===selected_target?20:10}).style("fill",function(a){return a.color}).on("click",forceNodeClick).on("mouseover",forceNodeMouseOver).on("mouseout",forceNodeMouseOut).call(force.drag),e=svg_force.append("svg:g").selectAll("g").data(force.nodes()).enter().append("g").append("svg:text").attr("x",
8).attr("y",".31em").attr("class","nodelink text visible").text(function(a){return a.name});force.on("tick",function(){b.attr("x1",function(a){return a.source.x}).attr("y1",function(a){return a.source.y}).attr("x2",function(a){return a.target.x}).attr("y2",function(a){return a.target.y});d.attr("cx",function(a){return a.x}).attr("cy",function(a){return a.y});e.attr("transform",function(a){return"translate("+a.x+","+a.y+")"})})}
function highlightNode(a,c,b,d,e){void 0!==a&&(e.selectAll(".circular.node").classed(c,function(b){return b.key===a.key}),d&&e.select("#text-"+a.key).classed("visible",b))}function expandNode(){}function expandLink(){}
function arcTween(a){var c=d3.interpolate({start_angle:a.circ.old_start_angle,end_angle:a.circ.old_end_angle},a);return function(b){b=c(b);console.log(b);a.circ.old_start_angle=b.start_angle;a.circ.old_end_angle=b.end_angle;b.circ.start_angle=b.start_angle;b.circ.end_angle=b.end_angle;return arcs(b)}};function visualizeUserData(a){a=user_datasets[a];initActiveNodes(a.node_map);computeCircularNodesParameters(active_data_nodes);initActiveLinks(a.link_map);clearCanvases();enterCircularNodes();enterCircularLinks();updateCircularTexts()}function clearCanvases(){svg_circular.selectAll(".circular").remove();svg_force.selectAll(".force").remove()}
function combineRegions(a,c){for(var b=c.length,d=active_data_links.length;d--;)for(var e=active_data_links[d],g=0;g<b;++g){var h=c[g];(e.source===h||e.target===h)&&active_data_links.splice(d,1)}g=$.inArray(c[0],active_data_nodes);d=active_data_nodes[g];d.isActive=!1;a.circ=d.circ;a.isActive=!0;active_data_nodes[g]=a;for(g=1;g<b;++g)d=c[g],d.isActive=!1,d=$.inArray(d,active_data_nodes),active_data_nodes.splice(d,1);b=active_data_nodes.length;d=2*Math.PI/b;e=a.key;for(g=0;g<b;++g){var h=active_data_nodes[g].key,
f=e+"-"+h,f=active_node_link_map[f];void 0!==f&&active_data_links.push(f);f=h+"-"+e;f=active_node_link_map[f];void 0!==f&&active_data_links.push(f)}updateCircularLayout(b,d)}
function assignColors(a){var c=0,b=[],d;for(d in a){var e=a[d];1===e.depth&&(c+=1,e.group=e.key,b.push(e))}e=[];for(d=0;d<c;++d)e.push(colorPalette[d]);d3.scale.ordinal().domain(d3.range(c)).range(e);for(d=0;d<c;++d)b[d].color=e[d];for(;0<b.length;){var c=b[0],e=c.children,g=e.length;for(d=0;d<g;++d){var h=a[e[d]];h.color=c.color;h.group=c.group;b.push(h)}b.splice(0,1)}}function computeCircularNodesParameters(a){for(var c=a.length,b=2*Math.PI/c,d=0;d<c;++d)calculateArcPositions(a[d],0,b,d)}
function calculateArcPositions(a,c,b,d){a.circ.start_angle=c+b*d;a.circ.end_angle=c+b*(d+1);c=b*(d+0.5)+c;b=inner_radius+(outer_radius-inner_radius)/2;a.circ.x=b*Math.cos(Math.PI/2-c);a.circ.y=-b*Math.sin(Math.PI/2-c)}function stash(a){a.circ.old_start_angle=a.circ.start_angle;a.circ.old_end_angle=a.circ.end_angle}
function constructUserDataMaps(a,c,b){user_datasets[a]={};constructUserNodesMaps(a,c);constructUserLinksMaps(a,b);constructLinkHierarchy(a,b);assignColors(user_datasets[a].node_map);console.log("Color assigned");console.log(user_datasets[a])}
function constructUserNodesMaps(a,c){for(var b={},d={},e={},g=c.length,h=0;h<g;++h){var f=c[h];f.key=parseInt(f.key);f.depth=parseInt(f.depth);f.parent=null===f.parentKey?null:parseInt(f.parentKey);f.circ={};f.children=[];b[f.key]=f;d[f.key]=[];e[f.key]=[]}for(var k in b)f=b[k],null!==f.parent&&b[f.parent].children.push(f.key);user_datasets[a].node_map=b;user_datasets[a].node_in_neighbor_map=d;user_datasets[a].node_out_neighbor_map=e}
function constructUserLinksMaps(a,c){for(var b={},d={},e=user_datasets[a],g=c.length,h=0;h<g;++h){var f=c[h],k=parseInt(f.sourceKey),m=parseInt(f.targetKey),f={key:parseInt(f.key),source:e.node_map[k],target:e.node_map[m],notes:f.notes,children:[],isDerived:!1,base_children:[]};b[f.key]=f;d[f.source.key+"-"+f.target.key]=f;e.node_in_neighbor_map[m].push(k);e.node_out_neighbor_map[k].push(m)}e.link_map=b;e.node_link_map=d}
function constructLinkHierarchy(a,c){for(var b=c.length,d=0,e=0;e<b;++e){var g=parseInt(c[e].key);g>d&&(d=g)}for(var h=user_datasets[a],e=0;e<b;++e){for(var g=parseInt(c[e].key),f=h.link_map[g],k=f.source,m=f.target,n=h.node_map[k.parent],q=h.node_map[m.parent],l=[],p=f.base_children.length,j=0;j<p;++j)l.push(f.base_children[j]);f.isDerived||(l.push(f.key),p+=1);if(null!==k.parent&&k.parent!==m.key&&0>$.inArray(m.key,n.children)){var j=k.parent+"-"+m.key,i=h.node_link_map[j];if(void 0===i)d+=1,i=
{key:d,source:h.node_map[parseInt(k.parent)],target:m,notes:"Meta link",children:[g],isDerived:!0,base_children:l},h.link_map[d]=i,h.node_link_map[j]=i,c.push(i),b+=1;else{0>$.inArray(g,i.children)&&i.children.push(g);for(j=0;j<p;++j)f=l[j],0>$.inArray(f,i.base_children)&&i.base_children.push(f)}}if(null!==m.parent&&m.parent!==k.key&&0>$.inArray(k.key,q.children))if(j=k.key+"-"+m.parent,i=h.node_link_map[j],void 0===i)d+=1,i={key:d,source:k,target:h.node_map[parseInt(m.parent)],notes:"Meta link",
children:[g],isDerived:!0,base_children:l},h.link_map[d]=i,h.node_link_map[j]=i,c.push(i),b+=1;else{0>$.inArray(g,i.children)&&i.children.push(g);for(j=0;j<p;++j)f=l[j],0>$.inArray(f,i.base_children)&&i.base_children.push(f)}if(null!==k.parent&&null!==m.parent&&k.parent!==m.parent&&0>$.inArray(m.key,n.children)&&0>$.inArray(k.key,q.children))if(j=k.parent+"-"+m.parent,n=h.node_link_map[j],void 0===n)d+=1,n={key:d,source:h.node_map[parseInt(k.parent)],target:h.node_map[parseInt(m.parent)],notes:"Meta link",
children:[g],isDerived:!0,base_children:l},h.link_map[d]=n,h.node_link_map[j]=n,c.push(n),b+=1;else{0>$.inArray(g,n.children)&&n.children.push(g);for(j=0;j<p;++j)f=l[j],0>$.inArray(f,n.base_children)&&n.base_children.push(f)}}}function findActiveParent(a){for(;void 0!==a&&null!==a&&!a.isActive;)a=active_node_map[a.parent];return a}
function findActiveDescends(a){for(var c=active_data_nodes.length,b=[],d=0;d<c;++d){var e=active_data_nodes[d];if(!(void 0===e.parent||null===e.parent))for(var g=active_node_map[e.parent];void 0!==g&&null!==g;){if(g===a){b.push(e);break}g=active_node_map[g.parent]}}return b}function findDescAtDepth(a,c){for(var b=[a];0<b.length&&b[0].depth<c;){for(var d=b[0].children,e=d.length,g=0;g<e;++g)b.push(active_node_map[d[g]]);b.splice(0,1)}return b}
function initActiveNodes(a){active_data_nodes=[];for(var c in a){var b=a[c];1===b.depth&&(b.isActive=!0,active_data_nodes.push(b))}}function initActiveLinks(a){active_data_links=[];for(var c in a){var b=a[c];1===b.source.depth&&1===b.target.depth&&active_data_links.push(b)}}
function calculatePaths(a){var c=0,b=[],d=[];b[0]=[selected_source];for(var e=selected_source.depth,g=selected_target.depth,h=Math.min(e,g),e=Math.max(e,g);0<b.length&&b[0].length<=a+2;){g=b[0];b.splice(0,1);var f=g[g.length-1];if(f.key===selected_target.key)d.push(g);else if(!(g.length>=a+2)){for(var f=active_node_out_neighbor_map[f.key],k=f.length,m=0;m<k;++m){var n=active_node_map[f[m]];n.depth>=h&&n.depth<=e&&b.push(g.concat(n))}c++;if(5E3<c){enable_owa&&(console.log(selected_source),console.log(selected_target),
OWATracker.trackAction("Warning","Path size limit reached",selected_source.name+"-"+selected_target+"-"+max_hop));console.log("Reached path limit.");break}}}return d}
function populateForceElements(a){var c=a.length;active_data_nodes_force=[];active_data_links_force=[];for(var b=0;b<c;++b)for(var d=a[b],e=d.length-1,g=0;g<e;++g){var h=d[g],f=d[g+1],k=active_node_link_map[h.key+"-"+f.key];0>$.inArray(k,active_data_links_force)&&active_data_links_force.push(k);0>$.inArray(h,active_data_nodes_force)&&active_data_nodes_force.push(h);0>$.inArray(f,active_data_nodes_force)&&active_data_nodes_force.push(f)}}
function startSession(){sessionStartTime=new Date;startTime=new Date;document.onmousemove=recordMouseMovement}function recordActionData(){actionData.push({timeElapsed:currentActionData.timeElapsed,mouseTrace:currentActionData.mouseTrace,actionBasic:currentActionData.actionBasic,actionDetail:currentActionData.actionDetail,time:currentActionData.time});startTime=new Date;currentActionData={timeElapsed:-1,mouseTrace:"",actionBasic:"",actionDetail:"",time:-1}}
function recordMouseMovement(a){2950<currentActionData.mouseTrace.length||(currentActionData.mouseTrace+="x:"+a.pageX+",y:"+a.pageY+",time:"+(new Date-startTime)+";")}function trackAction(a,c){currentActionData.actionBasic=a;currentActionData.actionDetail=c;endTime=new Date;currentActionData.timeElapsed=(endTime-startTime)/1E3;currentActionData.time=endTime.toString();recordActionData()}
function paperClick(){var a=$(this).text();enable_owa&&OWATracker.trackAction("UI","Click paper",a);enable_tracking&&(console.log("tracking paper click"),trackAction("Click paper",a))}
function saveSessionData(){sessionEndTime=new Date;var a=sessionEndTime-sessionStartTime;$.ajax({type:"POST",url:"media/php/writeActionData.php",data:{actionDataArray:actionData,sessionLength:a/1E3,userID:uid},error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Successfully passed data to php.");console.log(a)},async:!1})}
function populateUserId(){$.ajax({type:"POST",url:"media/php/getUserID.php",error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Success");uid=a;populateDatasets(uid)},async:!1})}
function populateDatasets(a){$.ajax({type:"POST",url:"media/php/getDatasetByUserId.php",data:{userID:a},error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Populate dataset success");console.log(a);dataset_list=$.parseJSON(a);populateDatasetUI()},async:!1})}
function createDataset(a,c){$.ajax({type:"POST",url:"media/php/addDataset.php",data:{datasetName:a,userID:c},error:function(a){console.log("Failed");console.log(a)},success:function(b){console.log("Success");$("#dataSelect").append(new Option(a,b));$("#dataSelect").trigger("liszt:updated");$("#createDatasetSuccessAlert").show()},async:!0})}
function getBrainData(a){$.ajax({type:"POST",url:"media/php/getBrainData.php",data:{datasetKey:a},error:function(a){console.log("Failed");console.log(a)},success:function(c){console.log("Successfully passed data to php.");c=$.parseJSON(c);constructUserDataMaps(a,c.nodes,c.links);c=user_datasets[a];active_node_map=c.node_map;active_node_link_map=c.node_link_map;active_node_in_neighbor_map=c.node_in_neighbor_map;active_node_out_neighbor_map=c.node_out_neighbor_map;active_link_map=c.link_map;updateOptions();
visualizeUserData(a);is_preloaded_data=!1},async:!1})}function contains(a,c){for(var b=a.length,d=0;d<b;++d)if(c.key===a[d].key)return d;return-1};
