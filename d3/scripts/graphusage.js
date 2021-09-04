/*
 * This file is part of symfinder.
 *
 * symfinder is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * symfinder is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with symfinder. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2018-2019 Johann Mortara <johann.mortara@univ-cotedazur.fr>
 * Copyright 2018-2019 Xhevahire Tërnava <xhevahire.ternava@lip6.fr>
 * Copyright 2018-2019 Philippe Collet <philippe.collet@univ-cotedazur.fr>
 */

import {NodesFilter} from "./nodes-filter.js";
import {PackageColorer} from "./package-colorer.js";
import {VariantsFilter} from "./variants-filter.js";
import {IsolatedFilter} from "./isolated-filter.js";
import {EntryPointFilter} from "./entry-point-filter.js";
import {HotspotsFilter} from "./hotspots-filter.js";


class Graph {

    constructor(jsonFile, jsonStatsFile, nodeFilters, entryPointFilters, defaultUsageLevel, defaultUsageType) {
        this.jsonFile = jsonFile;
        this.jsonStatsFile = jsonStatsFile;
        this.defaultUsageType = defaultUsageType;
        this.defaultUsageLevel = defaultUsageLevel;
        this.filter = new NodesFilter("#add-filter-button", "#package-to-filter", "#list-tab", nodeFilters, async () => {
            this.firstLevelUsage = true;
            await this.displayGraph();
        });
        this.packageColorer = new PackageColorer("#add-package-button", "#package-to-color", "#color-tab", [], async () => await this.displayGraph());
        this.entryPointFilter = new EntryPointFilter("#add-api-class-button", "#api-class-to-filter", "#list-tab-api", entryPointFilters, async () => {
            this.firstLevelUsage = true;
            await this.displayGraph();
        });
        if (sessionStorage.getItem("firstTime") === null) {
            sessionStorage.setItem("firstTime", "true");
        }
        this.color = d3.scaleLinear();
        this.setButtonsClickActions();
        this.nodes_dict = {};
        this.links_dict = {};
        this.firstLevelUsage = true;
        this.hybridView = false;
        this.apiFiltering = false;
    }


    async displayGraph() {
        if (sessionStorage.getItem("firstTime") === "true") {
            sessionStorage.setItem("filteredIsolated", "false");
            sessionStorage.setItem("filteredVariants", "true");
            sessionStorage.setItem("onlyHotspots", "false");
            sessionStorage.setItem("firstTime", "false");
            sessionStorage.setItem("filterApi", "false");
            // sessionStorage.setItem("hybridView", "false");
        }
        d3.selectAll("svg > *").remove();
        this.filterIsolated = sessionStorage.getItem("filteredIsolated") === "true";
        this.filterVariants = sessionStorage.getItem("filteredVariants") === "true";
        this.filterHotspots = sessionStorage.getItem("onlyHotspots") === "true";
        await this.generateGraph();
        return this.graph;
    }

    async generateGraph() {

        this.width = window.innerWidth;
        this.height = window.innerHeight - 10;

        this.generateStructure(this.width, this.height);

        await this.getData(this);

    }

    generateStructure(width, height) {
        //	svg selection and sizing
        this.svg = d3.select("svg").attr("width", width).attr("height", height);

        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", -5)
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,0L10,-5L10,5")
            .attr('fill', 'gray')
            .style('stroke', 'none');


        //add encompassing group for the zoom
        this.g = this.svg.append("g")
            .attr("class", "everything");

        this.link = this.g.append("g").selectAll(".link");
        if(this.hybridView) this.linkvp = this.g.append("g").selectAll(".linkvp");
        this.node = this.g.append("g").selectAll(".node");
        this.label = this.g.append("g").selectAll(".label");
    }

    async getData(graph) {
        return new Promise((resolve, reject) => {
            d3.queue()
                .defer(d3.json, graph.jsonFile)
                .defer(d3.json, graph.jsonStatsFile)
                .await((err, gr, stats) => {
                    if (err) throw err;
                    graph.displayData(gr, stats);
                    graph.update();
                    resolve();
                });
        });

    }

    displayData(gr, stats) {

        const usageTypeEnum = {
            IN: 'IN',
            OUT: 'OUT',
            IN_OUT: 'IN-OUT'
        }

        //	data read and store
        document.getElementById("statistics").innerHTML =
            // "Number of VPs: " + stats["VPs"] + "<br>" +
            // "Number of methods VPs: " + stats["methodVPs"] + "<br>" +
            // "Number of constructors VPs: " + stats["constructorsVPs"] + "<br>" +
            "Number of class level VPs: " + stats["classLevelVPs"] + "<br>" +
            "Number of method level VPs: " + stats["methodLevelVPs"] + "<br>" +
            // "Number of variants: " + stats["variants"] + "<br>" +
            // "Number of methods variants: " + stats["methodsVariants"] + "<br>" +
            // "Number of constructors variants: " + stats["constructorsVariants"] + "<br>" +
            "Number of class level variants: " + stats["classLevelVariants"] + "<br>" +
            "Number of method level variants: " + stats["methodLevelVariants"];

        var sort = gr.allnodes.filter(a => a.types.includes("CLASS")).map(a => parseInt(a.constructorVariants)).sort((a, b) => a - b);
        this.color.domain([sort[0] - 3, sort[sort.length - 1]]); // TODO deal with magic number

        var nodeByID = {};

        this.graph = gr;
        this.store = $.extend(true, {}, gr);

        this.allnodesSave = this.graph.allnodes;
        this.alllinksSave = this.graph.alllinks;

        this.graph.allnodes.forEach(function (n) {
            n.radius = n.types.includes("CLASS") ? 10 + n.methodVPs : 10;
            nodeByID[n.name] = n;
        });

        if(!this.hybridView){
            this.graph.alllinks = this.graph.linkscompose;
        }

        this.graph.alllinks.filter(l => [l.source, l.target].every(s => s in nodeByID)).forEach(function (l) {
            l.sourceTypes = nodeByID[l.source].types;
            l.targetTypes = nodeByID[l.target].types;
        });


        this.store.allnodes.forEach(function (n) {
            n.radius = n.types.includes("CLASS") ? 10 + n.methodVPs : 10;
        });

        this.graph.alllinks.filter(l => [l.source, l.target].every(s => s in nodeByID)).forEach(function (l) {
            l.sourceTypes = nodeByID[l.source].types;
            l.targetTypes = nodeByID[l.target].types;
        });

        this.graph.allnodes = this.filter.getNodesListWithoutMatchingFilter(gr.allnodes);
        this.graph.alllinks = this.filter.getLinksListWithoutMatchingFilter(gr.alllinks);

        this.nodesList = [];
        this.apiList = [];

        if (this.filterVariants) {
            var variantsFilter = new VariantsFilter(this.graph.allnodes, this.graph.alllinks);
            this.graph.allnodes = variantsFilter.getFilteredNodesList();
            this.graph.alllinks = variantsFilter.getFilteredLinksList();
        }

        if (this.filterIsolated) {
            var isolatedFilter = new IsolatedFilter(this.graph.allnodes, this.graph.alllinks);
            this.graph.allnodes = isolatedFilter.getFilteredNodesList();
        }

        if (this.firstLevelUsage) {
            $("#usagetypes").val(this.defaultUsageType);
        }

        if(this.filterHotspots) {
            var hotspotsFilter = new HotspotsFilter(this.graph.allnodes, this.graph.alllinks);
            this.graph.allnodes = hotspotsFilter.getFilteredNodesList();
            this.graph.alllinks = hotspotsFilter.getFilteredLinksList();
        }

        if(this.apiFiltering) {
            this.graph.allnodes.filter(n => n.types.includes("API")).forEach(n => this.entryPointFilter.addFilter(n.name));
        } else {
            this.graph.allnodes.filter(n => n.types.includes("API")).forEach(n => this.entryPointFilter.removeValue(n.name));
        }

        var nodesNames = this.graph.allnodes.map(n => n.name);
        let inheritanceLinks = this.alllinksSave.filter(l => ["IMPLEMENTS", "EXTENDS"].includes(l.type) && nodesNames.includes(l.source));

        let nodesNamesInInheritanceLinks = new Set();
        inheritanceLinks.forEach(l => {
            nodesNamesInInheritanceLinks.add(l.target);
        })
        let nodesInInheritanceLinks = this.allnodesSave.filter(n => nodesNamesInInheritanceLinks.has(n.name));

        if(this.hybridView) {
            inheritanceLinks.forEach(l => this.graph.alllinks.push(l));
            nodesInInheritanceLinks.forEach(n => this.graph.allnodes.push(n));
        }

        if(this.graph.allnodes.filter(n => n.types.includes("API")).length > 0) {
            document.getElementById("apiFiltering").style.visibility = "visible";
        }

        if (this.entryPointFilter.filtersList.length !== 0) {
            if (document.getElementById("usageLevel").style.display === "none"){
                document.getElementById("usageLevel").style.display = "block";
                document.getElementById("usageType").style.display = "inline-grid";
                document.getElementById("hybridView").style.display = "inline-grid";
            }
            //Filter to find all nodes which are in the api list
            this.nodesList = this.entryPointFilter.getNodesListWithMatchingFilter(this.graph.allnodes);
            this.apiList = this.entryPointFilter.getNodesListWithMatchingFilter(this.graph.allnodes);
            if(this.nodesList.length !== 0){
                //Finds all the links which contain one of the API classes as target or source
                var current = [];
                if (this.apiList.length !== 0) {
                    this.apiList.forEach(node => node.usageLevel = 0);
                    switch (this.defaultUsageType) {
                        case usageTypeEnum.IN:
                            this.hs = this.entryPointFilter.getLinksListWithMatchingFilterIn(this.graph.alllinks);
                            break;
                        case usageTypeEnum.OUT:
                            this.hs = this.entryPointFilter.getLinksListWithMatchingFilterOut(this.graph.alllinks);
                            break;
                        case usageTypeEnum.IN_OUT:
                            this.hs = this.entryPointFilter.getLinksListWithMatchingFilterInOut(this.graph.alllinks);
                            break;
                    }

                    //Found all the nodes which are linked to one of those nodes
                    this.hs.forEach(
                        d => gr.allnodes.forEach(node => {
                                if ((EntryPointFilter.matchesFilter(node.name, d.source) || (EntryPointFilter.matchesFilter(node.name, d.target))) && !this.nodesList.includes(node)) {
                                    node.usageLevel = 1;
                                    this.nodesList.push(node);
                                    current.push(node.name);
                                }
                            }
                        )
                    );
                }
                this.nodes_dict[1] = this.nodesList.length;
                this.links_dict[1] = this.hs.length;

                var next = [];
                var links = []
                var usageLevel = 2;
                while (current.length !== 0) {
                    switch (this.defaultUsageType) {
                        case usageTypeEnum.IN:
                            links = this.entryPointFilter.getLinksListWithMatchingFiltersIn(this.graph.alllinks, current);
                            break;
                        case usageTypeEnum.OUT:
                            links = this.entryPointFilter.getLinksListWithMatchingFiltersOut(this.graph.alllinks, current);
                            break;
                        case usageTypeEnum.IN_OUT:
                            links = this.entryPointFilter.getLinksListWithMatchingFiltersInOut(this.graph.alllinks, current);
                            break;
                    }

                    links.forEach(
                        d => gr.allnodes.forEach(node => {

                            if ((EntryPointFilter.matchesFilter(node.name, d.source) || (EntryPointFilter.matchesFilter(node.name, d.target)))) {
                                this.hs.push(d);
                                if(!this.nodesList.includes(node)){
                                    node.usageLevel = usageLevel;
                                    this.nodesList.push(node);
                                    next.push(node.name);
                                }
                            }
                        })
                    );
                    this.nodes_dict[usageLevel] = this.nodesList.length;
                    this.links_dict[usageLevel] = this.hs.length;
                    current = next;
                    next = [];
                    usageLevel++;
                }
                this.updateUsageLevelView(this);
                this.firstLevelUsage = false;
            }
        }else{
            document.getElementById("usageLevel").style.display = "block";
            document.getElementById("usageType").style.display = "inline-grid";
            document.getElementById("hybridView").style.display = "inline-grid";
        }

    }

    // check refresh when changing usage level
    setDataToDisplay(nodesList, alllinks, usageLevel) {
        this.graph.allnodes = nodesList.splice(0, this.nodes_dict[usageLevel]);
        this.graph.alllinks = alllinks.splice(0, this.links_dict[usageLevel]);
    }

    updateUsageLevelView(graphusage) {
        var x = document.getElementById("usage-level");
        var length = x.options.length;
        if (length !== 0) {
            for (i = length-1; i >= 0; i--) {
                x.options[i] = null;
            }
        }
        for(var i = 0; i < this.nodesList[this.nodesList.length - 1].usageLevel; i++) {
            var option = document.createElement("option");
            option.text = (i + 1).toString();
            option.value = (i + 1).toString();
            if( (i+1) === graphusage.defaultUsageLevel) option.selected = true;
            x.add(option);
        }
        var nodes_graph = [...graphusage.nodesList];
        var links_graph = [...graphusage.hs];
        graphusage.setDataToDisplay(nodes_graph, links_graph, graphusage.defaultUsageLevel);
    }


    //	general update pattern for updating the graph

    update() {

        //	UPDATE
        this.node = this.node.data(this.graph.allnodes, function (d, nodeList) {
            return d.name;
        });
        //	EXIT
        this.node.exit().remove();
        //	ENTER
        var newNode = this.node.enter().append("circle")
            .attr("class", "node")
            .style("stroke-dasharray", function (d) {
                return d.types.includes("ABSTRACT") ? "3,3" : "3,0"
            })
            //.style("stroke", "black")

            //On api classes
            .style("stroke", (d) => {
                return this.apiList.includes(d) ? '#0e90d2' : "black";
            })
            .style("stroke-width", function (d) {
                return d.types.includes("ABSTRACT") ? d.classVariants + 1 : d.classVariants;
            })
            .attr("r", function (d) {
                return d.radius
            })
            .attr("fill", (d) => {
                if (d.types.includes("API_ROOT")) return "#FFFF00";
                if (d.types.includes("INTERFACE")) return "#000000";
                if (! d.types.includes("HOTSPOT")) return "#aaaaaa";
                if ((d.types.includes("METHOD_LEVEL_VP") || d.types.includes("VARIANT") || d.types.includes("VP"))) return d3.rgb(this.getNodeColor(d.name, d.constructorVariants))
                return '#DDDDDD';
            })
            .attr("name", function (d) {
                return d.name
            });

        newNode.append("title").text(function (d) {
            return "types: " + d.types + "\n" + "name: " + d.name;
        });
        newNode.on("mouseover", function () {
            d3.select(this).style("cursor", "pointer");
        });
        newNode.on("click", function (d) {
            navigator.clipboard.writeText(d.name).then(function () {
                console.log("COPY OK");
            }, function () {
                console.log("COPY NOT OK");
            });
        });

        //	ENTER + UPDATE
        this.node = this.node.merge(newNode);

        //	UPDATE
        this.link = this.link.data(this.graph.alllinks.filter(l => l.type.includes("USE") || l.type.includes("API")), function (d) {
            return d.name;
        });
        //	EXIT
        this.link.exit().remove();
        //	ENTER
        var newLink = this.link.enter().append("line")
            .attr("stroke-dasharray", (l) => l.type.includes("USE") ? 5 : 0)
            .attr("class", "link")
            .attr("source", d => d.source)
            .attr("target", d => d.target)
            .attr('marker-start', "url(#arrowhead)")
            .style("pointer-events", "none")
            .style("stroke","#0E90D2")
            .style("stroke-width",3);

        newLink.append("title")
            .text(function (d) {
                return "source: " + d.source + "\n" + "target: " + d.target;
            });

        //	ENTER + UPDATE
        this.link = this.link.merge(newLink);

        if(this.hybridView){
            //	UPDATE
            this.linkvp = this.linkvp.data(this.graph.alllinks.filter(l => !l.type.includes("USE") && !l.type.includes("API")), function (d) {
                return d.name;
            });
            //	EXIT
            this.linkvp.exit().remove();
            //	ENTER
            var newLinkvp = this.linkvp.enter().append("line")
                .attr("stroke-with", 1)
                .attr("class", "link")
                .attr("source", d => d.source)
                .attr("target", d => d.target)
                .attr('marker-start', "url(#arrowhead)")
                .style("pointer-events", "none")
                .style("stroke-width",5);

            newLinkvp.append("title")
                .text(function (d) {
                    return "source: " + d.source + "\n" + "target: " + d.target;
                });
            //	ENTER + UPDATE
            this.linkvp = this.linkvp.merge(newLinkvp);
        }

        //  UPDATE
        this.label = this.label.data(this.graph.allnodes, function (d) {
            return d.name;
        });
        //	EXIT
        this.label.exit().remove();
        //  ENTER
        var newLabel = this.label.enter().append("text")
            .attr("dx", -5)
            .attr("dy", ".35em")
            .attr("name", d => d.name)
            .attr("fill", (d) => {
                var nodeColor = d.types.includes("INTERFACE") ? d3.rgb(0, 0, 0) : d3.rgb(this.getNodeColor(d.name, d.constructorVariants));
                return contrastColor(nodeColor);
            })
            .text(function (d) {
                return ["STRATEGY", "FACTORY", "TEMPLATE", "DECORATOR", "COMPOSITION_STRATEGY"]
                    .filter(p => {
                        if (p === "COMPOSITION_STRATEGY") {
                            return d.types.includes(p) && ! d.types.includes("STRATEGY")
                        }
                        return d.types.includes(p);
                    }).map(p => p === "COMPOSITION_STRATEGY" ? "S" : p[0]).join(", ");
            });

        //	ENTER + UPDATE
        this.label = this.label.merge(newLabel);

        d3.selectAll("circle.node").on("contextmenu", async (node) => {
            d3.event.preventDefault();
            await this.filter.addFilterAndRefresh(d3.select(node).node().name);
        });

        //this.nodesList.forEach()

        this.addAdvancedBehaviour(newNode, this.width, this.height);


    }

    addAdvancedBehaviour(newNode, width, height) {
        newNode.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

        //	force simulation initialization
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().distance(100)
                .id(function (d) {
                    return d.name;
                }))
            .force("charge", d3.forceManyBody()
                .strength(function (d) {
                    return -50;
                }))
            .force("center", d3.forceCenter(width / 2, height / 2));


        //	update simulation nodes, links, and alpha
        simulation
            .nodes(this.graph.allnodes)
            //	tick event handler with bounded box
            .on("tick", () => {
                this.node
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });

                this.link
                    .attr("x1", function (d) {
                        if(d.type.includes("USE")){
                            return d.target.x;
                        }else{
                            return d.source.x
                        }
                    })
                    .attr("y1", function (d) {
                        if(d.type.includes("USE")){
                            return d.target.y
                        }else{
                            return d.source.y
                        }
                    })
                    .attr("x2", function (d) {
                        if(d.type.includes("USE")){
                            return d.source.x
                        }else{
                            return d.target.x
                        }
                    })
                    .attr("y2", function (d) {
                        if(d.type.includes("USE")){
                            return d.source.y
                        }else{
                            return d.target.y
                        }
                    });

                if(this.hybridView){
                    this.linkvp
                        .attr("x1", function (d) {
                            if(d.type.includes("USE")){
                                return d.target.x;
                            }else{
                                return d.source.x
                            }
                        })
                        .attr("y1", function (d) {
                            if(d.type.includes("USE")){
                                return d.target.y
                            }else{
                                return d.source.y
                            }
                        })
                        .attr("x2", function (d) {
                            if(d.type.includes("USE")){
                                return d.source.x
                            }else{
                                return d.target.x
                            }
                        })
                        .attr("y2", function (d) {
                            if(d.type.includes("USE")){
                                return d.source.y
                            }else{
                                return d.target.y
                            }
                        });
                }

                this.label
                    .attr("x", function (d) {
                        return d.x;
                    })
                    .attr("y", function (d) {
                        return d.y;
                    });
            });

        simulation.force("link")
            .links(this.graph.alllinks);

        simulation.alpha(1).alphaTarget(0).restart();

        //add zoom capabilities
        var zoom_handler = d3.zoom()
            .on("zoom", () => this.g.attr("transform", d3.event.transform));

        zoom_handler(this.svg);

        //	drag event handlers
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    getNodeColor(nodeName, valueOnScale) {
        var upperRangeColor = this.packageColorer.getColorForName(nodeName);
        return this.color
            .range(["#FFFFFF", upperRangeColor])
            .interpolate(d3.interpolateRgb)(valueOnScale);
    }

    getPerimeterColor(valueOnScale) {
        var upperRangeColor = "#40E0D0";
        if (valueOnScale === undefined) return upperRangeColor;
        return this.color
            .range(["#FFFFFF", upperRangeColor])
            .interpolate(d3.interpolateRgb)(valueOnScale);
    }

    setButtonsClickActions() {
        $(document).on('click', ".list-group-item", e => {
            e.preventDefault();
            $('.active').removeClass('active');
        });

        $(document).on('change', "#usagetypes", async e => {
            e.preventDefault();
            this.defaultUsageType = $(e.target).val();
            this.firstLevelUsage = true;
            await this.displayGraph();
        });

        $(document).on('change', "#usage-level", async e => {
            e.preventDefault();
            this.defaultUsageLevel = $(e.target).val();
            var nodes_graph = [...this.nodesList];
            var links_graph = [...this.hs];
            this.setDataToDisplay(nodes_graph, links_graph, $(e.target).val());
            this.update();
        });

        $(document).on('change', "#hybridSwitch", async e => {
            e.preventDefault();
            if($(e.target).val() === 'off') {
                $(e.target).val('on');
                this.hybridView = true;
                document.getElementById("usagetypes").disabled = true;
            } else {
                $(e.target).val('off');
                this.hybridView = false;
                document.getElementById("usagetypes").disabled = false;
            }
            this.firstLevelUsage = true;
            await this.displayGraph();
        });

        $(document).on('change', "#apiFilteringSwitch", async e => {
            e.preventDefault();
            if($(e.target).val() === 'off') {
                $(e.target).val('on');
                this.apiFiltering = true;
            } else {
                $(e.target).val('off');
                this.apiFiltering = false;
            }
            this.firstLevelUsage = true;
            await this.displayGraph();

        });

        $("#filter-isolated").on('click', async e => {
            e.preventDefault();
            var previouslyFiltered = sessionStorage.getItem("filteredIsolated") === "true";
            sessionStorage.setItem("filteredIsolated", previouslyFiltered ? "false" : "true");
            $("#filter-isolated").text(previouslyFiltered ? "Unfilter isolated nodes" : "Filter isolated nodes");
            this.firstLevelUsage = true;
            await this.displayGraph();
        });

        $("#filter-variants-button").on('click', async e => {
            e.preventDefault();
            var previouslyFiltered = sessionStorage.getItem("filteredVariants") === "true";
            sessionStorage.setItem("filteredVariants", previouslyFiltered ? "false" : "true");
            $("#filter-variants-button").text(previouslyFiltered ? "Hide variants" : "Show variants");
            this.firstLevelUsage = true;
            await this.displayGraph();
        });

        $(document).on('click', "#hotspots-only-button", async e => {
            e.preventDefault();
            const previouslyFiltered = sessionStorage.getItem("onlyHotspots") === "true";
            sessionStorage.setItem("onlyHotspots", previouslyFiltered ? "false" : "true");
            $("#hotspots-only-button").text(previouslyFiltered ? "Show hotspots only" : "Show all nodes");
            this.firstLevelUsage = true;
            await this.displayGraph();
        });

        $('#hide-info-button').click(function () {
            $(this).text(function (i, old) {
                return old === 'Show project information' ? 'Hide project information' : 'Show project information';
            });
        });

        $('#hide-legend-button').click(function () {
            $(this).text(function (i, old) {
                return old === 'Hide legend' ? 'Show legend' : 'Hide legend';
            });
        });
    }

}

function contrastColor(color) {
    var d = 0;

    // Counting the perceptive luminance - human eye favors green color...
    const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;

    if (luminance > 0.5)
        d = 0; // bright colors - black font
    else
        d = 255; // dark colors - white font

    return d3.rgb(d, d, d);
}

export {Graph};