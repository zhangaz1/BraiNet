/**
 * brainMap.js
 * 
 * Author: Hua
 * 
 */

(function() {
    brainMap = {
        // Lazily construct the brain hierarchy from brain region names.
        root: function(data) {
            var map = {};
            function find(name, data, key) {
                var node = map[name], i;
                if (!node) {
                    node = map[name] = data || {name: name, children: []};
                    if (name.length) {
                        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                        node.parent.children.push(node);
                        node.key = key;
                        node.displayName = name.substring(i + 1);
                        node.children = [];
                    }
                }
                return node;
            }


            data.forEach(function(d) {

                find(d.name, d, d.key);
            }
            );
            return map[""];
        },
        // Generate the mapping from [source region name, target region name] to an ID of the associated literature
        evidence: function(nodes) {
            var map = {};

            nodes.forEach(function(d) {
                if (d.links) d.links.forEach(function(i) {
                    map[d.name, i.name] = i.PMID;
                });
            });

            return map;
        },
        // Return a list of connections for the given array of brain regions.
        connections: function(nodes) {
            var map = {},
            links = [];

            // Compute a map from name to node.
            nodes.forEach(function(d) {
                map[d.name] = d;
            });

            // Construct links
            nodes.forEach(function(d) {
                if (d.links) d.links.forEach(function(i) {
                    // Debug code: map[i.name] will be undefined if the connectivity data is incorrect
                    if (map[i.name] == undefined) {
                        console.log(d.name);
                        console.log(i.name);
                    }
                    else {
                        links.push({source: map[d.name], target: map[i.name]});
                    }
                });
            });
            return links;
        }
    };
})();
