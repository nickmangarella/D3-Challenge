// SVG height and width
var svgWidth = 960;
var svgHeeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// SVG wrapper
var svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function that updates the x-scale var by clicking on the axis label
function xScale(healthData, chosenXAxis) {

    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2])
        .range([0, width]);
    
    return xLinearScale;
}

// Function that updates the y-scale by clicking on the axis label
function yScale(healthData, chosenYAxis) {
    
    // Create scales
    var YLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2])
        .range([height, 0]);
    
    return yLinearScale;
}

// Function that updates both axes by clicking on either axis label
function renderAxes(newXScale, xAxis, newYScale, yAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    var leftAxis = d3.axisLeft(newYScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return xAxis, yAxis;
}

// Function that updates circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function that updates circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xLabel;
    var yLabel;

    if (chosenXAxis === "poverty")  {
        xLabel = "Poverty:"
    }
    else {
        xLabel = "Age:"
    }

    if (chosenYAxis === "healthcare") {
        yLabel = "Healthcare:"
    }
    else {
        yLabel = "Smokes:"
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`); 
        });

        circlesGroup.call(toolTip);

        // On mouseover event
        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
            // On mouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });
    
    return circlesGroup;
}

// Retrieve data from CSV file and execute the chart
d3.csv("/data/data.csv").then(function(healthData, err) {
    if (err) throw err;

    // Parse the data
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
    });

    // xLinearScale function
    var xLinearScale = xScale(healthData, chosenXAxis);

    // yLinearScale function
    var yLinearScale = yScale(healthData, chosenYAxis);
    
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x-axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y-axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(leftAxis);
    
    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("text", d => d.abbr)
        .attr("opacity", ".5");

    // Create group for two x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    // Create group for two y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
    
    // Append poverty label on x-axis
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)")
    
    // Append age label on x-axis
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    // Append healthcare label on y-axis
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0)
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)")
    
    // Append smokes label on y-axis
    var smokesLabel = yLabelsGroup.append("text")
        .attr("x", 40)
        .attr("y", 0)
        .attr("value", "smokes")
        .classed("active", true)
        .text("Smokes (%)")
    
    // updateToolTip function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
})