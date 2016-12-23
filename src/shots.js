var activeDisplay = "scatter";
var activeTheme = "day";
// SCALES USED TO INVERT COURT Y COORDS AND MAP SHOOTING PERCENTAGES OF BINS TO A FILL COLOR 
var yScale = d3.scaleLinear().domain([0, 47]).rangeRound([47, 0]);
var percentFormatter = d3.format(".2%");

export default function() {
    
    var hexRadiusValues = [.8, 1, 1.2],
        hexMinShotThreshold = 1,
        heatScale = d3.scaleQuantize().domain([0, 1]).range(['#5458A2', '#6689BB', '#FADC97', '#F08460', '#B02B48']),
        hexRadiusScale = d3.scaleQuantize().domain([0, 2]).range(hexRadiusValues),
        toolTips = false,
        hexbin = d3_hexbin.hexbin()
                .radius(1.2)
                .x(function(d) { return d.key[0]; }) // accessing the x, y coords from the nested json key
                .y(function(d) { return yScale(d.key[1]); });        
    
    var _nestShotsByLocation = function(data) {
        var nestedData = d3.nest()
            .key(function(d) {
                return [d.x, d.y];
            })
            .rollup(function(v) { return {
                "made": d3.sum(v, function(d) { return d.shot_made_flag }),
                "attempts": v.length,
                "shootingPercentage":  d3.sum(v, function(d) { return d.shot_made_flag })/v.length
            }})
            .entries(data);
        // change to use a string split and force cast to int
        nestedData.forEach(function(a){
            a.key = JSON.parse("[" + a.key + "]");
        });

        return nestedData;
    };

    var _getHexBinShootingStats = function(data, index) {
        var attempts = d3.sum(data, function(d) { return d.value.attempts; })
        var makes = d3.sum(data, function(d) { return d.value.made; })
        var shootingPercentage = makes/attempts;
        data.shootingPercentage = shootingPercentage;
        data.attempts = attempts;
        data.makes = makes;
        return data;
    };
    

    function shots(selection){

        selection.each(function(data){

            var shotsGroup = d3.select(this).select("svg").select(".shots"),
                legends = d3.select(this).select("#legends"),
                nestedData = _nestShotsByLocation(data),
                hexBinCoords = hexbin(nestedData).map(_getHexBinShootingStats);

            if (activeDisplay === "scatter"){
                if (legends.empty() === false){
                    legends.remove();
                }
                
                var shots = shotsGroup.selectAll(".shot")
                                    .data(data, function(d){ return [d.x, d.y]; });
                shots.exit()
                    .transition().duration(1000)
                    .attr("r", 0)
                    .attr("d", hexbin.hexagon(0))
                    .remove();

                if (toolTips) {
                    var tool_tip = d3.tip()
                      .attr("class", "d3-tip")
                      .offset([-8, 0])
                      .html(function(d) { 
                            return d.shot_distance + "' " + d.action_type; 
                        });
                    
                    shotsGroup.call(tool_tip);
                }

                shots.enter()
                    .append("circle")
                    .classed("shot", true)
                    .classed("make", function(d){
                          return d.shot_made_flag === 1; // used to set fill color to green if it's a made shot
                    })
                    .classed("miss", function(d){
                          return d.shot_made_flag === 0; // used to set fill color to red if it's a miss
                    })
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return yScale(d.y); })
                    .attr("r", 0)
                    .on('mouseover', function(d) { if (toolTips) {tool_tip.show(d);} })
                    .on('mouseout', function(d) { if (toolTips) {tool_tip.hide(d);} })
                    .transition().duration(1000)
                    .attr("r", .5);
                
            }
            else if (activeDisplay === "hexbin"){

                var shots = shotsGroup.selectAll(".shot")
                                    .data(hexBinCoords, function(d){ return [d.x, d.y]; });

                shots.exit()
                    .transition().duration(1000)
                    .attr("r", 0)
                    .attr("d", hexbin.hexagon(0))                
                    .remove();
                
                if (toolTips) {
                    var tool_tip = d3.tip()
                      .attr("class", "d3-tip")
                      .offset([-8, 0])
                      .html(function(d) { 
                            return d.makes + " / " + d.attempts + " (" + percentFormatter(d.shootingPercentage) + ")"; 
                        });
                    
                    shotsGroup.call(tool_tip);
                }

                shots.enter()                
                    .append("path")
                    .classed("shot", true)
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                    .attr("d", hexbin.hexagon(0))
                    .on('mouseover', function(d) { if (toolTips) {tool_tip.show(d);} })
                    .on('mouseout', function(d) { if (toolTips) {tool_tip.hide(d);} })
                    .transition().duration(1000)
                    .attr("d", function(d) { 
                                if (d.length >= hexMinShotThreshold) {
                                    if (d.length <= 3){
                                        return hexbin.hexagon(hexRadiusScale(0));
                                    }
                                    else if (3 < d.length && d.length <= 8){
                                        return hexbin.hexagon(hexRadiusScale(1));
                                    }
                                    else {
                                        return hexbin.hexagon(hexRadiusScale(2));
                                    }
                                } 
                            })
                    .style("fill", function(d) { return heatScale(d.shootingPercentage); });
                
                // CHANGE TO USE SELECTION.EMPTY()
                if (legends.empty() === true){
                    var legendSVG = d3.select(this).append('svg').attr("viewBox", "0, 0, " + 50 + ", " + 10 + "").attr('id', 'legends'),
                        efficiencyLegend = legendSVG.append('g').classed('legend', true),
                        frequencyLegend = legendSVG.append('g').classed('legend', true)
                                                            .classed('frequency', true),
                        frequencyLegendXStart = 7;

                    efficiencyLegend.append("text")
                                    .classed('legend-text', true)
                                    .attr("x", 40)             
                                    .attr("y", 5)
                                    .attr("text-anchor", "middle") 
                                    .text("Efficiency");
                    efficiencyLegend.append("text")
                                    .classed("legend-text", true)
                                    .attr("x", 34.25)             
                                    .attr("y", 2.5)
                                    .attr("text-anchor", "end") 
                                    .text("cold");
                    efficiencyLegend.append("text")
                                    .classed("legend-text", true)
                                    .attr("x", 45.75)             
                                    .attr("y", 2.5)
                                    .attr("text-anchor", "start") 
                                    .text("hot");
                    efficiencyLegend.selectAll('path').data(heatScale.range())
                                    .enter()
                                    .append('path')
                                    .attr("transform", function (d, i) {
                                      return "translate(" + 
                                        (35 + ((1 + i*2) * 1)) + ", " + 2 + ")";
                                    })
                                    .attr('d', hexbin.hexagon(0))
                                    .transition().duration(1000)
                                    .attr('d', hexbin.hexagon(1))
                                    .style('fill', function (d) { return d; });
                    efficiencyLegend.selectAll("text").style("fill", function(){ 
                                        if (activeTheme === "night"){ return "white"; }
                                        else if (activeTheme === "day"){ return "black"; };
                                    });
                    
                    frequencyLegend.append("text")
                                    .classed('legend-text', true)
                                    .attr("x", 10.25)             
                                    .attr("y", 5)
                                    .attr("text-anchor", "middle")  
                                    .text("Frequency");
                    frequencyLegend.append("text")
                                    .classed("legend-text", true)
                                    .attr("x", 6.25)             
                                    .attr("y", 2.5)
                                    .attr("text-anchor", "end")  
                                    .text("low");
                    frequencyLegend.selectAll('path').data(hexRadiusValues)
                                    .enter()
                                    .append('path')
                                    .attr("transform", function (d, i) {
                                        frequencyLegendXStart += d * 2;
                                        return "translate(" + (frequencyLegendXStart - d) + ", " + 2 + ")";
                                    })
                                    .attr('d', hexbin.hexagon(0))
                                    .transition().duration(1000)
                                    .attr('d', function (d) { return hexbin.hexagon(d); })
                    frequencyLegend.append("text")
                                    .classed("legend-text", true)
                                    .attr("x", 13.75)             
                                    .attr("y", 2.5)
                                    .attr("text-anchor", "start")  
                                    .text("high");
                    
                    frequencyLegend.selectAll("text").style("fill", function(){ 
                                        if (activeTheme === "night"){ return "white"; }
                                        else if (activeTheme === "day"){ return "black"; };
                                    })
                    frequencyLegend.selectAll("path").style("fill", function(){ 
                                        if (activeTheme === "night"){ return "none"; }
                                        else if (activeTheme === "day"){ return "grey"; };
                                    });
                };                                                      
            };
        });
    };
  
  shots.displayType = function(_) {
    if (!arguments.length) return activeDisplay;
    activeDisplay = _;
    return shots;
  };
  
  shots.shotRenderThreshold = function(_) {
    if (!arguments.length) return hexMinShotThreshold;
    hexMinShotThreshold = _;
    return shots;
  }; 
  
  shots.displayToolTips = function(_) {
    if (!arguments.length) return toolTips;
    toolTips = _;
    return shots;
  };

  shots.theme = function(_) {
    if (!arguments.length) return activeTheme;
    activeTheme = _;
    return shots;
  };


    return shots;
};