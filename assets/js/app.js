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
var chosenXAxis = "in_poverty";
var chosenYAxis = "lacks_healthcare";

// Function that updates the x-scale var by clicking on the axis label
function xScale(healthData, chosenXAxis) {

    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    
    return xLinearScale;
}

// Function that updates xAxis by clicking on the axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function that updates circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// Function that updates circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    var label;

    if (chosenXAxis === "in_poverty") {
        label = "Poverty:"
    }
    else {
        label = "Age:"
    }
}

