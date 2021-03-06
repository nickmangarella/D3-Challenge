// SVG height and width
var svgWidth = 960;
var svgHeight = 500;

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
  .select("#scatter")
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
function xScale(censusData, chosenXAxis) {

  // Create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
    d3.max(censusData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
    
  return xLinearScale;
}

// Function that updates the y-scale by clicking on the axis label
function yScale(censusData, chosenYAxis) {
    
  // Create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
    d3.max(censusData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
    
  return yLinearScale;
}

// Function that updates both axes by clicking on either y-axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
    
  return xAxis;
}

// Function that updates both axes by clicking on either y-axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
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
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;

  // Parse the data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.smokes = +data.smokes;
    });

  // xLinearScale function
  var xLinearScale = xScale(censusData, chosenXAxis);

  // yLinearScale function
  var yLinearScale = yScale(censusData, chosenYAxis);
  
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
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Append state abbreviations as text to circles
  circlesGroup.selectAll("text")
    .data(censusData)
    .enter()
    .append("text")
    .text(function(d) {
      return d.abbr;
    })

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
    .attr("y", 0 - 100)
    .attr("x", 0 - (height/2))
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)")
    
  // Append smokes label on y-axis
  var smokesLabel = yLabelsGroup.append("text")
    .attr("y", 0 - 120)
    .attr("x", 0 - (height/2))
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)")
    
  // updateToolTip function
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // X-axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      
        // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // Replace chosenXAxis with the value
        chosenXAxis = value;
        console.log(chosenXAxis);

        // Update the xScale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // Update x-axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // Update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // Update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // Change classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // Y-axis labels event listener
  yLabelsGroup.selectAll("text")
    .on("click", function() {
    
      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

      // Replace chosenXAxis with the value
      chosenYAxis = value;
      console.log(chosenYAxis);

      // Update the xScale for new data
      yLinearScale = yScale(censusData, chosenyAxis);

      // Update x-axis with transition
      yAxis = renderyAxis(yLinearScale, yAxis);

      // Update circles with new x values
      circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

      // Update tooltips with new info
      circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

      // Change classes to change bold text
      if (chosenYAxis === "age") {
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
    console.log(error);
});