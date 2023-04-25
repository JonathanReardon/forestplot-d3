async function createForestPlot(datafile, 
                                id="#forestPlot",
                                xAxisLabel="Effect Size", 
                                pointHoverColor, 
                                textHoverColor, 
                                backgroundDashlines=true, 
                                plotBackgroundColor="white", 
                                shapeColor="black", 
                                zeroLineColor="black", 
                                dotColor="black", 
                                yAxisColor="black",
                                backDashLineColor="lightgrey",
                                TextColor="black",
                                ciLineHozWidth="1px",
                                xAxisLabelColor="black",
                                xAxisLineColor="black",
                                backgStyle="style1",
                                textTipTitColor="#fc5424",
                            ){
                                
  // Remove any existing plot with the given id
  d3.select(id).selectAll("*").remove();
    const data = await d3.csv(datafile, d => {
        return {
          group: d.group,
          estimate: +d.estimate,
          lower: +d.lower,
          upper: +d.upper,
          title: d.title, 
          year: +d.year,
          abstract: d.abstract,
        };
      });

    // Set the dimensions and margins of the graph
    const margin = {top: 50, right: 50, bottom: 50, left: 150},

    width = 780 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


    // Append the SVG object to the body of the page
    const svg = d3.select(id)
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .style("background-color", plotBackgroundColor)
                  .append("g")
                  .attr("transform", "translate(" + (margin.left + 20) + "," + (margin.top - 5) + ")"); // Decrease the y translation value
  
    // Create x and y scales
    const x = d3.scaleLinear().range([margin.left - 120, width - margin.right - 80]);
    const y = d3.scaleBand().range([0, height]).padding(0.2);

    // Create x-axis and y-axis
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    if (backgStyle==="style1") {
        // Set the domain for x and y scales
        const xMin = d3.min(data, d => +d.lower) - 0.5;
        const xMax = d3.max(data, d => +d.upper) + 0.5;
        x.domain([xMin, xMax]);
        xAxis.ticks(xMax - xMin + 1);
    
        // Set the domain for the y scale
        y.domain(data.map(d => d.group));
    } else if (backgStyle==="style2") {
        // Set the domain for x and y scales
        x.domain([d3.min(data, d => +d.lower) - 0.5, d3.max(data, d => +d.upper) + 0.5]);
        y.domain(data.map(d => d.group));
    }
    

    
  
    // Add x-axis and y-axis to the SVG
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll(".tick line") // Select all tick lines
        .attr("stroke-width", 0); // Set the stroke-width to 0 to remove them

    // Change the color of the x-axis line
    svg.selectAll(".domain")
        .style("stroke", xAxisLineColor);

    // Change the color of the x-axis tick labels
    svg.selectAll(".tick text")
        .style("fill", xAxisLabelColor);

    if (backgroundDashlines) {
        svg.selectAll(".x.axis .tick")
            .each(function(d) {
                if (d !== 0) {
                    d3.select(this)
                        .append("line")
                        .attr("class", "grid-line")
                        .attr("x1", 0)
                        .attr("x2", 0)
                        .attr("y1", 0)
                        .attr("y2", -height)
                        .attr("stroke", backDashLineColor)
                        .attr("stroke-width", 1)
                        .attr("stroke-dasharray", "4, 4");
                }
            });
    }
  
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll(".tick text")
        .style("font-size", "14px")
    svg.select(".y-axis path")
        .attr("stroke-width", 0); // Set the stroke-width of the y-axis path to 0

    // Add tooltip functionality for the group label items
    svg.select(".y-axis")
        .selectAll(".tick text")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("fill", textHoverColor)
                .style("font-weight", "bold")
                .style("font-size", "16");

            const groupData = data.find(item => item.group === d);
            const groupTitle = groupData.title ? groupData.title : "N/A";
            const groupAbstract = groupData.abstract ? groupData.abstract : "No abstract available.";


            d3.select("#tooltip_author")
                .style("display", "inline-block")
                .html("<span style='color: #24343c; font-weight: bold;'><b>" + groupTitle + "</b></span><br><span style='color: " + textTipTitColor + "; font-weight: bold;'>" + d + "</span><br><br>" + groupAbstract)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("fill", yAxisColor)
                .style("font-weight", "normal")
                .style("font-size", "14");
            d3.select("#tooltip_author").style("display", "none");
        });

    // Create a tooltip div element
    d3.select("body")
        .append("div")
        .attr("id", "tooltip_author")
        .style("display", "none")
        .style("position", "absolute")
        .style("background-color", "white");

    // Set the font size for the y-axis labels
    svg.selectAll(".y-axis .tick text")
        .style("font-size", "14px")
        .style("fill", yAxisColor);

    // Add the title "Author"
    svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", margin.left - 200 + y.bandwidth() / 2)
        .attr("y", -margin.top / 3.5)
        .text("Author")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", TextColor)
        .attr("transform", "rotate(-360)"); // Rotate the text vertically




// Add the title "CI (LB)"
svg.append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr("x", width - 70) // Use the same x position as the LB values
    .attr("y", -margin.top / 3.5)
    .text("LB")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", TextColor)
    .attr("transform", "rotate(-360)"); // Rotate the text vertically

    // Add the title "CI (UB)"
    svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width - 20) // Use the same x position as the LB values
        .attr("y", -margin.top / 3.5)
        .text("UB")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", TextColor)
        .attr("transform", "rotate(-360)"); // Rotate the text vertically

  
    // Set the transition duration and delay
    const duration = 1000;
    const delay = 500;

    // Add the confidence interval lines
    const ciLines = svg.selectAll(".ci")
        .data(data)
        .enter()
        .append("line")
        .attr("class", "ci")
        .attr("x1", d => x(0))
        .attr("x2", d => x(0))
        .attr("y1", d => y(d.group) + y.bandwidth() / 2)
        .attr("y2", d => y(d.group) + y.bandwidth() / 2)
        .style("stroke", shapeColor)
        .style("stroke-width", ciLineHozWidth);

    ciLines.transition()
        .duration(1200)
        .delay(200)
        .attr("x1", d => x(d.lower))
        .attr("x2", d => x(d.upper));

    // Add small vertical lines at the leftmost edge of the "lower" line
    const lowerLines = svg.selectAll(".lowerLine")
        .data(data)
        .enter()
        .append("line")
        .attr("class", "lowerLine")
        .attr("x1", d => x(d.lower))
        .attr("x2", d => x(d.lower))
        .attr("y1", d => y(d.group) + y.bandwidth() / 2 - 5)
        .attr("y2", d => y(d.group) + y.bandwidth() / 2 + 5)
        .style("stroke", shapeColor)
        .style("stroke-width", "1px")
        .style("opacity", 0);

    lowerLines.transition()
        .duration(duration)
        .delay(1300)
        .style("opacity", 1);

    // Add small vertical lines at the rightmost edge of the "upper" line
    const upperLines = svg.selectAll(".upperLine")
        .data(data)
        .enter()
        .append("line")
        .attr("class", "upperLine")
        .attr("x1", d => x(d.upper))
        .attr("x2", d => x(d.upper))
        .attr("y1", d => y(d.group) + y.bandwidth() / 2 - 5)
        .attr("y2", d => y(d.group) + y.bandwidth() / 2 + 5)
        .style("stroke", shapeColor)
        .style("stroke-width", "1px")
        .style("opacity", 0);

    upperLines.transition()
        .duration(duration)
        .delay(1300)
        .style("opacity", 1);

    // Add a dashed vertical line starting from "0" on the x-axis
    svg.append("line")
        .attr("class", "dashedLine")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", zeroLineColor)
        .style("stroke-width", "1px")

    const pointsGroup = svg.append("g");

    pointsGroup.selectAll(".point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", x(x.domain()[0]))
    .attr("cy", d => y(d.group) + y.bandwidth() / 2)
    .attr("r", 5)
    .attr("opacity", 0) // Set initial opacity to 0
    .style("fill", dotColor)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("r", 14)
                .style("fill", pointHoverColor);
    
            const estimate = d.estimate ? d.estimate.toFixed(2) : "N/A";
            const lower = d.lower ? d.lower.toFixed(2) : "N/A";
            const upper = d.upper ? d.upper.toFixed(2) : "N/A";
    
            const groupLabel = svg.select(".y-axis")
                                    .selectAll(".tick")
                                    .filter(t => t === d.group)
                                    .select("text")
                                    .style("fill", pointHoverColor)
                                    .style("font-weight", "bold")
                                    .style("font-size", "14px");
    
            groupLabel.style("fill", pointHoverColor)
                        .style("font-weight", "bold")
                        .style("font-size", "14px");
    
            d3.select("#tooltip")
                .style("display", "inline-block")
                .html("Effect Size: " + estimate + "<br/>CI (lower): " + lower + "<br/>CI (upper): " + upper)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .attr("r", 5)
                .style("fill", dotColor);
    
            svg.select(".y-axis")
                .selectAll(".tick text")
                .style("fill", yAxisColor)
                .style("font-weight", "normal")
                .style("font-size", "14px");
            d3.select("#tooltip").style("display", "none");
        });
    
        pointsGroup.selectAll(".point")
            .transition()
            .duration(700)
            .delay((d, i) => i * 50) // Add this line for a 50ms delay between each circle's animation
            .attr("cx", d => x(d.estimate))
            .attr("opacity", 1);
        
    
    // Create a tooltip div element
    d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("display", "none")
        .style("position", "absolute")
        .style("background-color", "white");

        svg.selectAll(".upper")
        .data(data)
        .enter()
        .append("text")
        .attr("class", function(d) {
            return "upper" + (d.upper >= 0 ? " positive" : "");
        })
        .style("fill", TextColor)
        .attr("x", function(d) {
            return d.upper >= 0 ? width - 20 : width - 40;
        })
        .attr("y", function(d) {
            return y(d.group) + y.bandwidth() / 2;
        })
        .attr("dy", ".35em")
        .attr("dx", function(d) {
            return d.upper >= 0 ? -15 : 0;
        })
        .text(function(d) {
            return d.upper.toFixed(2);
        })
        .style("font-size", "14px");
    

    // Add the lower bound values
    // Add the lower bound values
    svg.selectAll(".lower")
        .data(data)
        .enter()
        .append("text")
        .attr("class", function(d) {
            return "lower" + (d.lower >= 0 ? " positive" : "");
        })
        .style("fill", TextColor)
        .attr("x", function(d) {
            return d.lower >= 0 ? width - 70 : width - 90;
        })
        .attr("y", function(d) {
            return y(d.group) + y.bandwidth() / 2;
        })
        .attr("dy", ".35em")
        .attr("dx", function(d) {
            return d.lower >= 0 ? -15 : 0;
        })
        .text(function(d) {
            return d.lower.toFixed(2);
        })
        .style("font-size", "14px");



    svg.append("text")
        .attr("class", "x-label")
        .attr("x", x(0))
        .attr("y", height + margin.bottom * 0.8)
        .attr("text-anchor", "middle")
        .text(xAxisLabel)
        .style("font-size", "16px")
        .style("fill", TextColor)
};

  // Call the function with the filename as argument
createForestPlot(datafile="data/data.csv", 
                id="#forestPlot", 
                xAxisLabel="Effect Size", 
                pointHoverColor="#fc5424", 
                textHoverColor="#fc5424", 
                backgroundDashlines=true, 
                plotBackgroundColor="transparent",
                 shapeColor="#5A5A5A", 
                 zeroLineColor="#5A5A5A", 
                 dotColor="#5A5A5A",
                 yAxisColor="#5A5A5A",
                 backDashLineColor="lightgrey",
                 TextColor="#5A5A5A",
                 ciLineHozWidth="1px",
                 xAxisLabelColor="#5A5A5A",
                 xAxisLineColor="#5A5A5A",
                 backgStyle="style2",
                 textTipTitColor="#fc5424");
                
// Call the function with the filename as argument
createForestPlot(datafile="data/data.csv", 
                 id="#forestPlot1",
                 xAxisLabel="Effect Size", 
                 pointHoverColor="red", 
                 textHoverColor="red", 
                 backgroundDashlines=false, 
                 plotBackgroundColor="transparent",
                 shapeColor="#5A5A5A", 
                 zeroLineColor="#5A5A5A", 
                 dotColor="#5A5A5A",
                 yAxisColor="#5A5A5A",
                 backDashLineColor="red",
                 TextColor="#5A5A5A",
                 ciLineHozWidth="1px",
                 xAxisLabelColor="#5A5A5A",
                 xAxisLineColor="#5A5A5A",
                 backgStyle="style1",
                 textTipTitColor="red");

createForestPlot(datafile="data/data.csv", 
                 id="#forestPlot2",
                 xAxisLabel="Effect Size", 
                 pointHoverColor="#5A5A5A", 
                 textHoverColor="black", 
                 backgroundDashlines=true, 
                 plotBackgroundColor="transparent",
                 shapeColor="#5A5A5A", 
                 zeroLineColor="#5A5A5A", 
                 dotColor="#5A5A5A",
                 yAxisColor="#5A5A5A",
                 backDashLineColor="#b6b6b6",
                 TextColor="#5A5A5A",
                 ciLineHozWidth="2px",
                 xAxisLabelColor="#5A5A5A",
                 xAxisLineColor="#5A5A5A",
                 backgStyle="style2",
                 textTipTitColor="grey");

createForestPlot(datafile="data/data.csv", 
                 id="#forestPlot3",
                 xAxisLabel="Effect Size", 
                 pointHoverColor="#fc5424", 
                 textHoverColor="black", 
                 backgroundDashlines=true, 
                 plotBackgroundColor="transparent",
                 shapeColor="#5A5A5A", 
                 zeroLineColor="#5A5A5A", 
                 dotColor="#5A5A5A",
                 yAxisColor="#5A5A5A",
                 backDashLineColor="#5A5A5A",
                 TextColor="#5A5A5A",
                 ciLineHozWidth="1px",
                 xAxisLabelColor="#5A5A5A",
                 xAxisLineColor="#5A5A5A",
                 backgStyle="style1",
                 textTipTitColor="#fc5424");