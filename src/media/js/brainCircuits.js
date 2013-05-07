var node_link_map,link_map,paper_map,node_map,node_in_neighbor_map,node_out_neighbor_map,link_rating_map,record_rating_map,brodmann_map,dataset_list,uid,user_datasets={},is_preloaded_data=!0,selected_source,selected_target,active_data_nodes,active_data_links,active_data_nodes_force,active_data_links_force,active_node_map,active_node_link_map,active_node_in_neighbor_map,active_node_out_neighbor_map,active_link_map,ignored_nodes=[],svg_circular,svg_force,arcs,curves,links,force,vis_width=800,vis_height=
600,inner_radius=0.32*Math.min(vis_width,vis_height),outer_radius=1.2*inner_radius,directionType={"in":1,out:2,bi:3},mode={exploration:1,search:2,fixation:3},colorPalette=[d3.rgb(141,211,199).toString(),d3.rgb(255,255,179).toString(),d3.rgb(190,186,218).toString(),d3.rgb(251,128,114).toString(),d3.rgb(128,177,211).toString(),d3.rgb(253,180,98).toString(),d3.rgb(179,222,105).toString(),d3.rgb(252,205,229).toString(),d3.rgb(217,217,217).toString(),d3.rgb(188,128,189).toString(),d3.rgb(204,235,197).toString(),
d3.rgb(255,237,111).toString()],mutex=3,enable_piwik=!1,enable_owa=!1,enable_tracking=!0,current_mode=mode.exploration,max_hop=1,actionData=[],generalData=[],startTime=null,endTime=null,sessionStartTime,sessionEndTime,currentActionData={timeElapsed:-1,mouseTrace:"",actionBasic:"",actionDetail:"",time:-1};var pre_nodes,pre_links;d3.json("media/data/test_node.json",function(a){pre_nodes=a;mutex-=1});d3.json("media/data/test_paper.json",function(a){paper_map={};for(var b=a.length,c=0;c<b;++c){var d=a[c];paper_map[d.key]=d}mutex-=1});d3.json("media/data/test_link.json",function(a){pre_links=a;mutex-=1});populateUserId();getBrodmannAreas();waitForDataLoading();d3.select("#bt-search").on("click",searchButtonClick);d3.select("#bt-clear").on("click",clearButtonClick);
d3.select("#bt-createDatasets").on("click",createDatasetButtonClick);d3.select("#bt-manageDatasets").on("click",manageDatasetButtonClick);d3.select("#bt-applyDataset").on("click",applyDatasetButtonClick);d3.select("#maxHop").on("change",setMaxHop);$("#sourceSelect").change(sourceSearchInput);$("#targetSelect").change(targetSearchInput);$(".map").maphilight();window.onbeforeunload=saveSessionData;window.onload=startSession;
function renderCanvas(){assignColors(active_node_map);initActiveNodes(active_node_map);computeCircularNodesParameters(active_data_nodes);initActiveLinks(active_link_map);arcs=d3.svg.arc().innerRadius(inner_radius).outerRadius(outer_radius).startAngle(function(a){return a.circ.start_angle}).endAngle(function(a){return a.circ.end_angle});curves=d3.svg.line().x(function(a){return a.x}).y(function(a){return a.y}).interpolate("basis");svg_circular=d3.select("#canvas-circular").append("svg").attr("width",
vis_width).attr("height",vis_height).append("g").attr("transform","translate("+vis_width/2+","+vis_height/2+")").append("g");svg_force=d3.select("#canvas-force").append("svg").attr("width",vis_width).attr("height",vis_height).append("g");enterCircularLinks();enterCircularNodes();updateCircularTexts()}function setupUIElements(){appendNodesAsOptions(active_node_map);d3.selectAll("area").attr("data-map-highlight",'{"stroke":false,"fillColor":"ff0000","fillOpacity":0.6}')}
function waitForDataLoading(){0<mutex?setTimeout(function(){waitForDataLoading()},1E3):(user_datasets.pre_1={},constructUserNodesMaps("pre_1",pre_nodes),constructUserLinksMaps("pre_1",pre_links),constructLinkHierarchy("pre_1",pre_links),active_node_map=user_datasets.pre_1.node_map,active_node_link_map=user_datasets.pre_1.node_link_map,active_node_in_neighbor_map=user_datasets.pre_1.node_in_neighbor_map,active_node_out_neighbor_map=user_datasets.pre_1.node_out_neighbor_map,active_link_map=user_datasets.pre_1.link_map,
console.log(active_link_map),renderCanvas(),setupUIElements())};function expandRegion(a,b){var c=b.length;if(!(1>c)){for(var d=a.circ.start_angle,g=(a.circ.end_angle-d)/c,f=[],h=[],e=active_data_links.length;e--;){var j=active_data_links[e];j.source===a?(h.push(j.target),active_data_links.splice(e,1)):j.target===a&&(f.push(j.source),active_data_links.splice(e,1))}e=$.inArray(a,active_data_nodes);active_data_nodes[e].isActive=!1;for(var j=f.length,l=h.length,n=active_data_nodes.length+c-1,q=2*Math.PI/n,m=n-1;m>e;--m)active_data_nodes[m]=active_data_nodes[m-c+1];
console.log(active_node_link_map);for(m=e;m<e+c;++m){var p=b[m-e];calculateArcPositions(p,d,g,m-e);p.color=a.color;p.isActive=!0;active_data_nodes[m]=p;for(var k=0;k<j;++k){var i=f[k],i=i.key+"-"+p.key;console.log(i);i=active_node_link_map[i];void 0!==i&&active_data_links.push(i)}for(k=0;k<l;++k)i=h[k],i=p.key+"-"+i.key,console.log(i),i=active_node_link_map[i],void 0!==i&&active_data_links.push(i)}for(m=0;m<c;++m)for(k=m+1;k<c;++k)i=b[m].key+"-"+b[k].key,console.log(i),i=active_node_link_map[i],void 0!==
i&&active_data_links.push(i),i=b[k].key+"-"+b[m].key,i=active_node_link_map[i],void 0!==i&&active_data_links.push(i);updateCircularLayout(n,q)}}function updateCircularLayout(a,b){exitCircularNodes();exitCircularLinks();enterCircularLinks();enterCircularNodes();for(var c=0;c<a;++c)calculateArcPositions(active_data_nodes[c],0,b,c);updateCircularLinks();updateCircularNodes();updateCircularTexts()}
function dimNonSearchResults(){svg_circular.selectAll(".circular.node").classed("nofocus",function(a){return 0>$.inArray(a,active_data_nodes_force)});svg_circular.selectAll(".circular.link").classed("hidden",function(a){return 0>$.inArray(a,active_data_links_force)});svg_circular.selectAll(".circular.text").classed("visible",function(a){return 0<=$.inArray(a,active_data_nodes_force)})}
function nodeClick(a){console.log(d3.event);if(d3.event.shiftKey){if(enable_piwik&&piwikTracker.trackPageView("Combine node in circular view"),enable_owa&&OWATracker.trackAction("Viz","Combine circular node",a.name),enable_tracking&&trackAction("Combine circular node",a.name),!(void 0===a.parent||null===a.parent)){var a=active_node_map[a.parent],b=findActiveDescends(a);combineRegions(a,b)}}else if(d3.event.altKey)current_mode===mode.exploration?current_mode=mode.fixation:current_mode===mode.fixation&&
(current_mode=mode.exploration);else if(d3.event.metaKey){active_data_nodes.splice($.inArray(a,active_data_nodes),1);for(b=active_data_links.length;b--;){var c=active_data_links[b];(c.source===a||c.target===a)&&active_data_links.splice(b,1)}b=active_data_nodes.length;updateCircularLayout(b,2*Math.PI/b);ignored_nodes.push(a);a.isIgnored=!0}else{enable_piwik&&piwikTracker.trackPageView("Expand node in circular view");enable_owa&&OWATracker.trackAction("Viz","Expand circular node",a.name);enable_tracking&&
trackAction("Expand circular node",a.name);for(var b=[],c=a.children,d=c.length,g=0;g<d;++g)b.push(active_node_map[c[g]]);expandRegion(a,b,svg_circular)}}
function nodeMouseOver(a,b){console.log(a);if(!(current_mode===mode.search||current_mode===mode.fixation)){var c=brodmann_map[a.brodmannKey];console.log('[title="'+c+'"]');$('[title="'+c+'"]').mouseover();current_mode!==mode.search&&(b.selectAll(".circular.link").classed("hidden",function(b){return b.source.key!==a.key&&b.target.key!==a.key}),b.selectAll(".circular.link").classed("outLink",function(b){var c=active_node_link_map[b.target.key+"-"+b.source.key];return b.source.key===a.key&&void 0===
c}),b.selectAll(".circular.link").classed("inLink",function(b){var c=active_node_link_map[b.target.key+"-"+b.source.key];return b.target.key===a.key&&void 0===c}),b.selectAll(".circular.link").classed("biLink",function(a){return void 0!==active_node_link_map[a.target.key+"-"+a.source.key]}),b.selectAll(".circular.node").classed("nofocus",function(b){var b=b.key,c=a.key,f=active_node_in_neighbor_map[c],h=active_node_out_neighbor_map[c];return b!==c&&0>$.inArray(b,f)&&0>$.inArray(b,h)}),b.selectAll(".circular.text").classed("visible",
function(b){var b=b.key,c=a.key,f=active_node_in_neighbor_map[c],h=active_node_out_neighbor_map[c];return b===c||0<=$.inArray(b,f)||0<=$.inArray(b,h)}))}}
function nodeMouseOut(a,b){current_mode===mode.search||current_mode===mode.fixation||($('[title="Areas 3, 1 & 2 - Primary Somatosensory Cortex"]').mouseout(),current_mode!==mode.search&&(b.selectAll(".circular.node").classed("nofocus",!1),b.selectAll(".circular.link").classed("hidden",!1),b.selectAll(".circular.link").classed("inLink",!1),b.selectAll(".circular.link").classed("outLink",!1),b.selectAll(".circular.link").classed("biLink",!1),updateCircularTexts()))}
function linkClick(a){enable_piwik&&piwikTracker.trackPageView("Click link in circular view");enable_owa&&OWATracker.trackAction("Viz","Click circular link",a.source.name+"-"+a.target.name);enable_tracking&&trackAction("Click circular link",a.source.name+"-"+a.target.name);displayConnectionInfo(a)}
function linkMouseOver(a,b){current_mode===mode.search||current_mode===mode.fixation||(b.selectAll(".circular.node").classed("nofocus",function(b){return b.key!==a.source.key&&b.key!==a.target.key}),b.selectAll(".circular.link").classed("hidden",function(b){return b.key!==a.key}),b.selectAll(".circular.text").classed("visible",function(b){return b.key===a.source.key||b.key===a.target.key}))}
function linkMouseOut(a,b){current_mode===mode.search||current_mode===mode.fixation||(b.selectAll(".circular.node").classed("nofocus",!1),b.selectAll(".circular.link").classed("hidden",!1),updateCircularTexts())}function forceNodeClick(a){enable_piwik&&piwikTracker.trackPageView("Click link in nodelink view");enable_owa&&OWATracker.trackAction("Viz","Click force node",a.name);enable_tracking&&trackAction("Click force node",a.name)}
function forceNodeMouseOver(a){current_mode!==mode.search&&(svg_force.selectAll(".nodelink.node").classed("nofocus",function(b){var b=b.key,c=a.key,d=active_node_in_neighbor_map[c],g=active_node_out_neighbor_map[c];return b!==c&&0>$.inArray(b,d)&&0>$.inArray(b,g)}),svg_force.selectAll(".nodelink.link").classed("nofocus",function(b){return b.source.key!==a.key&&b.target.key!==a.key}),svg_force.selectAll(".nodelink.text").classed("visible",function(b){var b=b.key,c=a.key,d=active_node_in_neighbor_map[c],
g=active_node_out_neighbor_map[c];return b===c||0<=$.inArray(b,d)||0<=$.inArray(b,g)}))}function forceNodeMouseOut(){current_mode!==mode.search&&(svg_force.selectAll(".circular.node").classed("nofocus",!1),svg_force.selectAll(".circular.link").classed("nofocus",!1),svg_force.selectAll(".nodelink.text").classed("visible",!0))}
function forceLinkClick(a){enable_piwik&&piwikTracker.trackPageView("Click link in nodelink view");enable_owa&&OWATracker.trackAction("Viz","Click force link",a.source.name+"-"+a.target.name);enable_tracking&&trackAction("Click force link",a.source.name+"-"+a.target.name);displayConnectionInfo(a)}
function forceLinkMouseOver(a){svg_force.selectAll(".nodelink.node").classed("nofocus",function(b){return b.key!==a.source.key&&b.key!==a.target.key});svg_force.selectAll(".nodelink.link").classed("nofocus",function(b){return b.key!==a.key});svg_force.selectAll(".nodelink.text").classed("visible",function(b){return b.key===a.source.key||b.key===a.target.key})}
function forceLinkMouseOut(){svg_force.selectAll(".nodelink.node").classed("nofocus",!1);svg_force.selectAll(".nodelink.link").classed("nofocus",!1);svg_force.selectAll(".nodelink.text").classed("visible",!0)}
function enterCircularNodes(){svg_circular.selectAll(".circular.node").data(active_data_nodes,function(a){return a.key}).enter().append("svg:path").style("fill",function(a){return a.color}).style("stroke","gray").attr("d",arcs).attr("class","circular node").attr("id",function(a){return"circ-node-"+a.key}).on("click",nodeClick).on("mouseover",function(a){nodeMouseOver(a,svg_circular)}).on("mouseout",function(a){nodeMouseOut(a,svg_circular)});svg_circular.selectAll(".circular.text").data(active_data_nodes,
function(a){return a.key}).enter().append("svg:text").attr("x",function(a){return a.circ.x}).attr("y",function(a){return a.circ.y}).attr("class","circular text").attr("id",function(a){return"text-"+a.key}).text(function(a){return a.name})}
function enterCircularLinks(){svg_circular.selectAll(".circular.link").data(active_data_links,function(a){return a.key}).enter().append("svg:path").attr("d",function(a){return curves([{x:a.source.circ.x,y:a.source.circ.y},{x:0,y:0},{x:a.target.circ.x,y:a.target.circ.y}])}).attr("class","circular link").attr("stroke-width",function(a){return Math.min(10,Math.max(1,Math.ceil(a.base_children.length/100)))+"px"}).attr("id",function(a){return"circ-link-"+a.key}).on("mouseover",function(a){linkMouseOver(a,
svg_circular)}).on("mouseout",function(a){linkMouseOut(a,svg_circular)}).on("click",linkClick)}function exitCircularNodes(){svg_circular.selectAll(".circular.node").data(active_data_nodes,function(a){return a.key}).exit().remove();svg_circular.selectAll(".circular.text").data(active_data_nodes,function(a){return a.key}).exit().remove()}function exitCircularLinks(){svg_circular.selectAll(".circular.link").data(active_data_links,function(a){return a.key}).exit().remove()}
function updateCircularNodes(){svg_circular.selectAll(".circular.node").data(active_data_nodes,function(a){return a.key}).transition().duration(1E3).attr("d",arcs);svg_circular.selectAll(".circular.text").data(active_data_nodes,function(a){return a.key}).transition().duration(1E3).attr("x",function(a){return a.circ.x}).attr("y",function(a){return a.circ.y})}
function updateCircularLinks(){svg_circular.selectAll(".circular.link").data(active_data_links,function(a){return a.key}).transition().duration(1E3).attr("d",function(a){return curves([{x:a.source.circ.x,y:a.source.circ.y},{x:0,y:0},{x:a.target.circ.x,y:a.target.circ.y}])})}function updateCircularTexts(){svg_circular.selectAll(".circular.text").classed("visible",function(a){a=a.circ;return a.end_angle-a.start_angle>Math.PI/12})}
function updateForceLayout(){var a=0,b={};active_data_nodes_force.forEach(function(c){b[c.group]?b[c.group][1]+=1:(++a,b[c.group]=[a,1])});selected_source.fixed=!0;selected_target.fixed=!0;selected_source.x=200;selected_source.y=400;selected_target.x=600;selected_target.y=400;force=d3.layout.force().nodes(active_data_nodes_force).links(active_data_links_force).size([vis_width,vis_height]).linkDistance(function(a){var c=b[a.source.group],d=b[a.target.group];return 10*Math.max(a.source.group!=a.target.group?
c[1]:2/c[1],a.source.group!=a.target.group?d[1]:2/d[1])+20}).linkStrength(1).charge(-6E3).friction(0.5).start();svg_force.selectAll(".link").remove();svg_force.selectAll(".node").remove();svg_force.selectAll(".text").remove();var c=svg_force.selectAll(".nodelink.link").data(active_data_links_force,function(a){return a.key}).enter().append("svg:line").attr("class","nodelink link").style("stroke-width",3).on("click",forceLinkClick).on("mouseover",forceLinkMouseOver).on("mouseout",forceLinkMouseOut),
d=svg_force.selectAll(".nodelink.node").data(active_data_nodes_force,function(a){return a.key}).enter().append("svg:circle").attr("class","nodelink node").attr("cx",function(a){return a.x}).attr("cy",function(a){return a.y}).attr("r",function(a){return a===selected_source||a===selected_target?20:10}).style("fill",function(a){return a.color}).on("click",forceNodeClick).on("mouseover",forceNodeMouseOver).on("mouseout",forceNodeMouseOut).call(force.drag),g=svg_force.append("svg:g").selectAll("g").data(force.nodes()).enter().append("g").append("svg:text").attr("x",
8).attr("y",".31em").attr("class","nodelink text visible").text(function(a){return a.name});force.on("tick",function(){c.attr("x1",function(a){return a.source.x}).attr("y1",function(a){return a.source.y}).attr("x2",function(a){return a.target.x}).attr("y2",function(a){return a.target.y});d.attr("cx",function(a){return a.x}).attr("cy",function(a){return a.y});g.attr("transform",function(a){return"translate("+a.x+","+a.y+")"})})}
function highlightNode(a,b,c,d,g){void 0!==a&&(g.selectAll(".circular.node").classed(b,function(b){return b.key===a.key}),d&&g.select("#text-"+a.key).classed("visible",c))}function expandNode(){}function expandLink(){}
function arcTween(a){var b=d3.interpolate({start_angle:a.circ.old_start_angle,end_angle:a.circ.old_end_angle},a);return function(c){c=b(c);console.log(c);a.circ.old_start_angle=c.start_angle;a.circ.old_end_angle=c.end_angle;c.circ.start_angle=c.start_angle;c.circ.end_angle=c.end_angle;return arcs(c)}};function appendNodesAsOptions(a){for(var b in a){var c=a[b];$("#sourceSelect").append(new Option(c.name,b,!1,!1));$("#targetSelect").append(new Option(c.name,b,!1,!1))}$(".chzn-select").chosen({allow_single_deselect:!0});$("#sourceSelect").trigger("liszt:updated");$("#targetSelect").trigger("liszt:updated")}
function updateOptions(){$("#sourceSelect").find("option").remove();$("#targetSelect").find("option").remove();$("#sourceSelect").trigger("liszt:updated");$("#targetSelect").trigger("liszt:updated");appendNodesAsOptions(active_node_map)}function populateDatasetUI(){$("#dataSelect").append(new Option("BAMS(public)",2130));for(var a=dataset_list.length,b=0;b<a;++b){var c=dataset_list[b];$("#dataSelect").append(new Option(c[1],c[0]))}}
function createDatasetButtonClick(){createDataset($('[name="datasetName"]').val(),uid)}function manageDatasetButtonClick(){var a=$("#dataSelect :selected").text(),b=$("#dataSelect").val();window.open("media/php/manageDataset.php?datasetName="+a+"&datasetID="+b,"Manage Datasets","width=800, height=800")}function applyDatasetButtonClick(){var a=parseInt($("#dataSelect").val());""!==a&&void 0===user_datasets[a]&&getBrainData(a)}
function searchButtonClick(){enable_piwik&&piwikTracker.trackPageView("Search:"+selected_source.name+"-"+selected_target.name);enable_owa&&OWATracker.trackAction("UI","Search",selected_source.name+"-"+selected_target.name);enable_tracking&&trackAction("Search",selected_source.name+"-"+selected_target.name);current_mode=mode.search;var a=calculatePaths(max_hop);populateForceElements(a);updateForceLayout();dimNonSearchResults()}
function clearButtonClick(){enable_piwik&&piwikTracker.trackPageView("Click clear button");current_mode=mode.exploration;svg_circular.selectAll(".circular.node").classed("nofocus",!1);svg_circular.selectAll(".circular.link").classed("hidden",!1);updateCircularTexts()}
function sourceSearchInput(){enable_piwik&&piwikTracker.trackPageView("Set search source");void 0!=selected_source&&(selected_source.fixed=!1,highlightNode(selected_source,"focus",!1,!0,svg_circular),clearSearchResult());var a=active_node_map[this.value];selected_source=a;if(!a.isActive){var b=findActiveParent(a);void 0===b?(b=findActiveDescends(a),combineRegions(a,b)):(a=findDescAtDepth(b,a.depth),expandRegion(b,a,svg_circular))}svg_circular.selectAll(".circular.node").classed("nofocus",function(a){return a!==
selected_source&&a!==selected_target});svg_circular.selectAll(".circular.text").classed("visible",function(a){return a===selected_source||a===selected_target});enable_owa&&OWATracker.trackAction("UI","Set source",selected_source.name);enable_tracking&&trackAction("Set source",selected_source.name)}
function targetSearchInput(){enable_piwik&&piwikTracker.trackPageView("Set search target");void 0!=selected_target&&(selected_target.fixed=!1,highlightNode(selected_target,"focus",!1,!0,svg_circular),clearSearchResult());var a=active_node_map[this.value];selected_target=a;if(!a.isActive){var b=findActiveParent(a);void 0===b?(b=findActiveDescends(a),combineRegions(a,b)):(a=findDescAtDepth(b,a.depth),expandRegion(b,a,svg_circular))}svg_circular.selectAll(".circular.link").classed("hidden",function(a){return a.source.key!==
selected_source.key&&a.target.key!==selected_target.key});svg_circular.selectAll(".circular.node").classed("nofocus",function(a){return a!==selected_source&&a!==selected_target});svg_circular.selectAll(".circular.text").classed("visible",function(a){return a===selected_source||a===selected_target});enable_owa&&OWATracker.trackAction("UI","Set target",selected_target.name);enable_tracking&&trackAction("Set target",selected_target.name)}function clearSearchResult(){}
function setMaxHop(){enable_piwik&&piwikTracker.trackPageView("Set max hop");enable_owa&&OWATracker.trackAction("UI","Set max hop",this.value);enable_tracking&&trackAction("Set max hop",this.value);max_hop=this.value;document.getElementById("maxHopValue").innerHTML=max_hop}
function displayConnectionInfo(a){d3.selectAll("#conn-info .exp").remove();d3.select("#conn-info #src-name").html("Source: "+a.source.name);d3.select("#conn-info #tgt-name").html("Target: "+a.target.name);var b=active_node_link_map[a.target.key+"-"+a.source.key];if(!is_preloaded_data){var c=d3.select("#notes");c.selectAll("div").remove();c.selectAll("p").remove();for(var c=c.append("div"),d="<p>Current link: "+a.source.name+"-"+a.target.name+"</p>",d=a.isDerived?d+"<p>This is a meta link. See the derived connections for user entered notes.</p>":
d+("<p>"+a.notes+"</p>"),d=d+'<p>Children links:</p><table class="table table-bordered table-striped table-condensed"><tr class="tableTitle"><td>Source</td><td>Target</td><td>Notes</td></tr>',g=a.base_children.length,f=0;f<g;++f)var h=active_link_map[a.base_children[f]],d=d+("<tr><td>"+h.source.name+"</td><td>"+h.target.name+"</td><td>"+h.notes+"</td></tr>");d+="</table>";if(void 0!==b){d+="<p>Current link: "+a.target.name+"-"+a.source.name+"</p>";d=b.isDerived?d+"<p>This is a meta link. See the derived connections for user entered notes.</p>":
d+("<p>"+b.notes+"</p>");d+="<p>Children links:</p>";d+='<table class="table table-bordered table-striped table-condensed"><tr class="tableTitle"><td>Source</td><td>Target</td><td>Notes</td></tr>';g=b.base_children.length;for(f=0;f<g;++f)h=active_link_map[b.base_children[f]],d+="<tr><td>"+h.source.name+"</td><td>"+h.target.name+"</td><td>"+h.notes+"</td></tr>";d+="</table>"}c.html(d)}if(is_preloaded_data){g=a.paper;c=d3.select("#paper-list");c.selectAll("div").remove();c.selectAll("p").remove();c=
c.append("div");d="<p>Current link: "+a.source.name+"-"+a.target.name+"</p>";if(a.isDerived)d+="<p>This is a meta link. See the derived connections for more information.</p>";else{d+='<table class="table table-bordered table-striped table-condensed"><tr class="tableTitle"><td>Publication</td></tr>';b=g.length;for(f=0;f<b;++f)var e=paper_map[g[f]],d=d+('<tr><td><a href="'+e.url+'" target="_blank" class="paperLink">'+e.title+"</a></td></tr>")}d+="</table>";d+="<p>Children links:</p>";d+='<table class="table table-bordered table-striped table-condensed"><tr class="tableTitle"><td>Source</td><td>Target</td><td>Publication</td></tr>';
g=a.base_children.length;for(f=0;f<g;++f)for(var h=active_link_map[a.base_children[f]],j=h.paper,b=j.length,l=0;l<b;++l)e=paper_map[j[l]],d+="<tr><td>"+h.source.name+"</td><td>"+h.target.name+'</td><td><a href="'+e.url+'" target="_blank" class="paperLink">'+e.title+"</a></td></tr>";d+="</table>";c.html(d);d3.selectAll(".paperLink").on("click",paperClick);c=d3.select("#bams-list");c.selectAll("p").remove();c=c.append("p");c.html("Links to BAMS records will be added in future updates")}a=a.children;
c=d3.select("#sub-con-list");c.selectAll("p").remove();c=c.append("p");1>a.length?c.html("There are no sub-connections for this link."):c.selectAll("p").data(a).enter().append("p").html(function(a){a=active_link_map[a];return"Source: "+a.source.name+"; Target: "+a.target.name})};function visualizeUserData(a){a=user_datasets[a];initActiveNodes(a.node_map);computeCircularNodesParameters(active_data_nodes);initActiveLinks(a.link_map);clearCanvases();enterCircularNodes();enterCircularLinks();updateCircularTexts()}function clearCanvases(){svg_circular.selectAll(".circular").remove();svg_force.selectAll(".force").remove()}
function combineRegions(a,b){for(var c=b.length,d=active_data_links.length;d--;)for(var g=active_data_links[d],f=0;f<c;++f){var h=b[f];(g.source===h||g.target===h)&&active_data_links.splice(d,1)}f=$.inArray(b[0],active_data_nodes);d=active_data_nodes[f];d.isActive=!1;a.circ=d.circ;a.isActive=!0;active_data_nodes[f]=a;for(f=1;f<c;++f)d=b[f],d.isActive=!1,d=$.inArray(d,active_data_nodes),active_data_nodes.splice(d,1);c=active_data_nodes.length;d=2*Math.PI/c;g=a.key;for(f=0;f<c;++f){var h=active_data_nodes[f].key,
e=g+"-"+h,e=active_node_link_map[e];void 0!==e&&active_data_links.push(e);e=h+"-"+g;e=active_node_link_map[e];void 0!==e&&active_data_links.push(e)}updateCircularLayout(c,d)}
function assignColors(a){var b=0,c=[],d;for(d in a){var g=a[d];1===g.depth&&(b+=1,g.group=g.key,c.push(g))}g=[];for(d=0;d<b;++d)g.push(colorPalette[d]);d3.scale.ordinal().domain(d3.range(b)).range(g);for(d=0;d<b;++d)c[d].color=g[d];for(;0<c.length;){var b=c[0],g=b.children,f=g.length;for(d=0;d<f;++d){var h=a[g[d]];h.color=b.color;h.group=b.group;c.push(h)}c.splice(0,1)}}function computeCircularNodesParameters(a){for(var b=a.length,c=2*Math.PI/b,d=0;d<b;++d)calculateArcPositions(a[d],0,c,d)}
function calculateArcPositions(a,b,c,d){a.circ.start_angle=b+c*d;a.circ.end_angle=b+c*(d+1);b=c*(d+0.5)+b;c=inner_radius+(outer_radius-inner_radius)/2;a.circ.x=c*Math.cos(Math.PI/2-b);a.circ.y=-c*Math.sin(Math.PI/2-b)}function stash(a){a.circ.old_start_angle=a.circ.start_angle;a.circ.old_end_angle=a.circ.end_angle}
function constructUserDataMaps(a,b,c){user_datasets[a]={};constructUserNodesMaps(a,b);constructUserLinksMaps(a,c);constructLinkHierarchy(a,c);assignColors(user_datasets[a].node_map);console.log("Color assigned");console.log(user_datasets[a])}
function constructUserNodesMaps(a,b){for(var c={},d={},g={},f=b.length,h=0;h<f;++h){var e=b[h];console.log(e);e.key=parseInt(e.key);e.brodmannKey=void 0===e.brodmannKey||null===e.brodmannKey?-1:e.brodmannKey[0];e.depth=parseInt(e.depth);e.parent=null===e.parentKey?null:parseInt(e.parentKey);e.circ={};e.children=[];c[e.key]=e;d[e.key]=[];g[e.key]=[]}for(var j in c)e=c[j],null!==e.parent&&(f=c[e.parent],void 0!==f?f.children.push(e.key):e.parent=null);user_datasets[a].node_map=c;user_datasets[a].node_in_neighbor_map=
d;user_datasets[a].node_out_neighbor_map=g}function constructUserLinksMaps(a,b){for(var c={},d={},g=user_datasets[a],f=b.length,h=0;h<f;++h){var e=b[h],j=parseInt(e.sourceKey),l=parseInt(e.targetKey),e={key:parseInt(e.key),source:g.node_map[j],target:g.node_map[l],notes:e.notes,paper:e.paper,children:[],isDerived:!1,base_children:[]};c[e.key]=e;d[e.source.key+"-"+e.target.key]=e;g.node_in_neighbor_map[l].push(j);g.node_out_neighbor_map[j].push(l)}g.link_map=c;g.node_link_map=d}
function constructLinkHierarchy(a,b){for(var c=b.length,d=0,g=0;g<c;++g){var f=parseInt(b[g].key);f>d&&(d=f)}for(var h=user_datasets[a],g=0;g<c;++g){for(var f=parseInt(b[g].key),e=h.link_map[f],j=e.source,l=e.target,n=h.node_map[j.parent],q=h.node_map[l.parent],m=[],p=e.base_children.length,k=0;k<p;++k)m.push(e.base_children[k]);e.isDerived||(m.push(e.key),p+=1);if(null!==j.parent&&j.parent!==l.key&&0>$.inArray(l.key,n.children)){var k=j.parent+"-"+l.key,i=h.node_link_map[k];if(void 0===i)d+=1,i=
{key:d,source:h.node_map[parseInt(j.parent)],target:l,notes:"Meta link",children:[f],isDerived:!0,base_children:m,paper:[]},h.link_map[d]=i,h.node_link_map[k]=i,h.node_in_neighbor_map[l.key].push(j.parent),h.node_out_neighbor_map[j.parent].push(l.key),b.push(i),c+=1;else{0>$.inArray(f,i.children)&&i.children.push(f);for(k=0;k<p;++k)e=m[k],0>$.inArray(e,i.base_children)&&i.base_children.push(e)}}if(null!==l.parent&&l.parent!==j.key&&0>$.inArray(j.key,q.children))if(k=j.key+"-"+l.parent,i=h.node_link_map[k],
void 0===i)d+=1,i={key:d,source:j,target:h.node_map[parseInt(l.parent)],notes:"Meta link",children:[f],isDerived:!0,base_children:m,paper:[]},h.link_map[d]=i,h.node_link_map[k]=i,h.node_in_neighbor_map[l.parent].push(j.key),h.node_out_neighbor_map[j.key].push(l.parent),b.push(i),c+=1;else{0>$.inArray(f,i.children)&&i.children.push(f);for(k=0;k<p;++k)e=m[k],0>$.inArray(e,i.base_children)&&i.base_children.push(e)}if(null!==j.parent&&null!==l.parent&&j.parent!==l.parent&&0>$.inArray(l.key,n.children)&&
0>$.inArray(j.key,q.children))if(k=j.parent+"-"+l.parent,n=h.node_link_map[k],void 0===n)d+=1,n={key:d,source:h.node_map[parseInt(j.parent)],target:h.node_map[parseInt(l.parent)],notes:"Meta link",children:[f],isDerived:!0,base_children:m,paper:[]},h.link_map[d]=n,h.node_link_map[k]=n,h.node_in_neighbor_map[l.parent].push(j.parent),h.node_out_neighbor_map[j.parent].push(l.parent),b.push(n),c+=1;else{0>$.inArray(f,n.children)&&n.children.push(f);for(k=0;k<p;++k)e=m[k],0>$.inArray(e,n.base_children)&&
n.base_children.push(e)}}}function findActiveParent(a){for(;void 0!==a&&null!==a&&!a.isActive;)a=active_node_map[a.parent];return a}function findActiveDescends(a){for(var b=active_data_nodes.length,c=[],d=0;d<b;++d){var g=active_data_nodes[d];if(!(void 0===g.parent||null===g.parent))for(var f=active_node_map[g.parent];void 0!==f&&null!==f;){if(f===a){c.push(g);break}f=active_node_map[f.parent]}}return c}
function findDescAtDepth(a,b){for(var c=[a];0<c.length&&c[0].depth<b;){for(var d=c[0].children,g=d.length,f=0;f<g;++f)c.push(active_node_map[d[f]]);c.splice(0,1)}return c}function initActiveNodes(a){active_data_nodes=[];for(var b in a){var c=a[b];1===c.depth&&(c.isActive=!0,active_data_nodes.push(c))}}
function initActiveLinks(a){active_data_links=[];for(var b in a){var c=a[b];1===c.source.depth&&1===c.target.depth&&(c.strength=20<c.base_children.length?"strong":1<c.base_children.length?"moderate":"weak",active_data_links.push(c))}}
function calculatePaths(a){var b=0,c=[],d=[];c[0]=[selected_source];var g=selected_source.depth,f=selected_target.depth,h=Math.min(g,f),g=Math.max(g,f);console.log("map");for(console.log(active_node_out_neighbor_map);0<c.length&&c[0].length<=a+2;){f=c[0];c.splice(0,1);var e=f[f.length-1];if(e.key===selected_target.key)d.push(f);else if(!(f.length>=a+2)){for(var e=active_node_out_neighbor_map[e.key],j=e.length,l=0;l<j;++l){var n=active_node_map[e[l]];n.depth>=h&&n.depth<=g&&c.push(f.concat(n))}b++;
if(5E3<b){enable_owa&&(console.log(selected_source),console.log(selected_target),OWATracker.trackAction("Warning","Path size limit reached",selected_source.name+"-"+selected_target+"-"+max_hop));console.log("Reached path limit.");break}}}return d}
function populateForceElements(a){var b=a.length;active_data_nodes_force=[];active_data_links_force=[];console.log(a);for(var c=0;c<b;++c){console.log(c);for(var d=a[c],g=d.length-1,f=0;f<g;++f){var h=d[f],e=d[f+1],j=active_node_link_map[h.key+"-"+e.key];0>$.inArray(j,active_data_links_force)&&active_data_links_force.push(j);0>$.inArray(h,active_data_nodes_force)&&active_data_nodes_force.push(h);0>$.inArray(e,active_data_nodes_force)&&active_data_nodes_force.push(e)}}}
function startSession(){sessionStartTime=new Date;startTime=new Date;document.onmousemove=recordMouseMovement}function recordActionData(){actionData.push({timeElapsed:currentActionData.timeElapsed,mouseTrace:currentActionData.mouseTrace,actionBasic:currentActionData.actionBasic,actionDetail:currentActionData.actionDetail,time:currentActionData.time});startTime=new Date;currentActionData={timeElapsed:-1,mouseTrace:"",actionBasic:"",actionDetail:"",time:-1}}
function recordMouseMovement(a){2950<currentActionData.mouseTrace.length||(currentActionData.mouseTrace+="x:"+a.pageX+",y:"+a.pageY+",time:"+(new Date-startTime)+";")}function trackAction(a,b){currentActionData.actionBasic=a;currentActionData.actionDetail=b;endTime=new Date;currentActionData.timeElapsed=(endTime-startTime)/1E3;currentActionData.time=endTime.toString();recordActionData()}
function paperClick(){var a=$(this).text();enable_owa&&OWATracker.trackAction("UI","Click paper",a);enable_tracking&&(console.log("tracking paper click"),trackAction("Click paper",a))}
function saveSessionData(){sessionEndTime=new Date;var a=sessionEndTime-sessionStartTime;$.ajax({type:"POST",url:"media/php/writeActionData.php",data:{actionDataArray:actionData,sessionLength:a/1E3,userID:uid},error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Successfully passed data to php.");console.log(a)},async:!1})}
function populateUserId(){$.ajax({type:"POST",url:"media/php/getUserID.php",error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Success");uid=a;populateDatasets(uid)},async:!1})}
function populateDatasets(a){$.ajax({type:"POST",url:"media/php/getDatasetByUserId.php",data:{userID:a},error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Populate dataset success");console.log(a);dataset_list=$.parseJSON(a);populateDatasetUI()},async:!1})}
function createDataset(a,b){$.ajax({type:"POST",url:"media/php/addDataset.php",data:{datasetName:a,userID:b},error:function(a){console.log("Failed");console.log(a)},success:function(b){console.log("Success");$("#dataSelect").append(new Option(a,b));$("#dataSelect").trigger("liszt:updated");$("#createDatasetSuccessAlert").show()},async:!0})}
function getBrainData(a){$.ajax({type:"POST",url:"media/php/getBrainData.php",data:{datasetKey:a},error:function(a){console.log("Warning: call to getBrainData.php Failed");console.log(a)},success:function(b){console.log("Successfully passed data to php.");console.log(b);b=$.parseJSON(b);constructUserDataMaps(a,b.nodes,b.links);b=user_datasets[a];active_node_map=b.node_map;active_node_link_map=b.node_link_map;active_node_in_neighbor_map=b.node_in_neighbor_map;active_node_out_neighbor_map=b.node_out_neighbor_map;
active_link_map=b.link_map;updateOptions();visualizeUserData(a);is_preloaded_data=!1},async:!1})}function getBrodmannAreas(){$.ajax({type:"GET",url:"media/php/getBrodmannAreas.php",error:function(a){console.log("Failed");console.log(a)},success:function(a){console.log("Successfully passed data to php.");console.log(a);a=$.parseJSON(a);constructBrodmannMap(a)},async:!0})}function contains(a,b){for(var c=a.length,d=0;d<c;++d)if(b.key===a[d].key)return d;return-1}
function constructBrodmannMap(a){brodmann_map={};for(var b=a.length,c=0;c<b;++c){var d=a[c];brodmann_map[d.id]=d.name}};
