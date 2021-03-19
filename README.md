# census-d3.js

## Description
Using D3.js and HTML to create a dynamic scatter plot based on data from the U.S. Census Bureau and the Behavioral Risk Factor Surveillance System. The data is based on 2014 ACS 1-year estimates from (https://data.census.gov/cedsci/).

## Scatter Plot
### Step 1
* Set the SVG height and width
* Created an SVG wrapper 
* Appended an SVG group
* Chose initial parameters
* For each axis label created functions to: 
    * Update the x and y scales
    * Render the axes with a transition
    * Render the data points with a transition
    * Render the text (state abbreviations) inside the points with a transition
* Grabed the d3-tip class from the style.css file
```
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
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function that updates the x-scale var by clicking on the axis label
function xScale(censusData, chosenXAxis) {

  // Create scale for x-axis
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
    d3.max(censusData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
    
  return xLinearScale;
}

// Function that updates the y-scale by 
function yScale(censusData, chosenYAxis) {
    
  // Create scale for y axis
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
    d3.max(censusData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
    
  return yLinearScale;
}

// Function that updates x-axis with a transition
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
    
  return xAxis;
}

// Function that updates y-axis with a transition
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Function that updates circlesGroup with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// Function that updates the textsGroup with a transition to new circles
function renderTexts(textsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
  textsGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textsGroup;
}

// Grab the d3-tip class from the CSS for display of data corresponding to each circle
var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${chosenXAxis} ${d[chosenXAxis]}<br>${chosenYAxis} ${d[chosenYAxis]}`); 
  });
  svg.call(toolTip);
```

### Step 2
Part 1:
* Loaded the data from the CSV file using d3.csv and setup error handling
* Parsed the dataset
* Set the x and y scales to pick up each chosen axis label
* Created initial bottom and left axis functions
* Appended both axes to the plot by grouping elements
* Appened the data points with the U.S. Censes data and added "mouseover" and "mouseout" functions to show and hide the toolTip
* Appened the state abbreviations text inside the data points
* Created groups for three x-axis and three y-axis labels
* Appended all of the data to its respective axis label
```
// Retrieve data from CSV file and execute the chart
d3.csv("assets/data/data.csv").then(function(censusData, err) {
  if (err) throw err;

  // Parse the data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.income = +data.income;
    data.obesity = +data.obesity;
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
    .attr("transform", `translate(0, ${height} * 2)`)
    .call(leftAxis);
    
  // Append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "lightblue")
    .attr("opacity", "1.5")
    .on("mouseover", function(data) {
      toolTip.show(data, this);
    })
    .on("mouseout", function(data) {
      toolTip.hide(data, this);
    });
  
  // Append state abbreviations as text to circles
  var textsGroup = chartGroup.selectAll("null")
    .data(censusData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d => d.abbr)
    .attr("font-size", "12px")
    .attr("font-family", "sans-serif")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central");

  // Create group for three x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
  // Create group for three y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");
    
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
  
  // Append income label on x-axis
  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Append healthcare label on y-axis
  var healthcareLabel = yLabelsGroup.append("text")
    .attr("y", 0 - 40)
    .attr("x", 0 - (height/2))
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)")
    
  // Append smokes label on y-axis
  var smokesLabel = yLabelsGroup.append("text")
    .attr("y", 0 - 60)
    .attr("x", 0 - (height/2))
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)")

  // Append obesity label on y-axis
  var obesityLabel = yLabelsGroup.append("text")
    .attr("y", 0 - 80)
    .attr("x", 0 - (height/2))
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)")
```
Part 2:
* For both x and y axes:
    * Created event listeners for each label (on "click")
    * Grabbed the value of the selection chosen
    * Replaced the current axis with the axis of the chosen value
    * Updated the scales and the axes with transitions for the new data
    * Updated the ciricles with the new values
    * If statements to change classes to update the chosen axis label in bold text
* Closed error handling
```
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
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Change classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
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

      // Replace chosenYAxis with the value
      chosenYAxis = value;
      console.log(chosenYAxis);

      // Update the yScale for new data
      yLinearScale = yScale(censusData, chosenYAxis);

      // Update y-axis with transition
      yAxis = renderYAxis(yLinearScale, yAxis);

      // Update circles with new y values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // Change classes to change bold text
      if (chosenYAxis === "healthcare") {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "obesity") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
    console.log(error);
});
```

