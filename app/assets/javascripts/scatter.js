var keys = [
  "zipcode",
  "graffiti_complaints",
  "heating_complaints",
  "illegal_parking_complaints",
  "noise_complaints",
  "restaurant_average_score",
  "streetlight_complaints",
  "amount_of_trees"
]

//populates dropdown. wishlist -- change keys to load from an activerecord var?
keys.forEach(function (key, index) {
  $('select').append("<option value=" + index + ">" + key + "</option>");
})

var load = function (n1, n2) {
  $.ajax({
    type: "GET",
    url: "/assets/master.csv",
    dataType: "text",
    success: function(data) {
      //array of hashes corresponding to each header
      parsedData = d3.csvParse(data);
      //n1 and n2 are the dropdown options currently selected (0-7, here)
      firstData = Object.keys(parsedData[0])[n1];
      secondData = Object.keys(parsedData[0])[n2];
      buildChart(parsedData, firstData, secondData);
      return data;
    }
  })
}
// data(5, 7);

//here's your event listener!
$('select').change(function () {
  d3.select('svg').remove();
  var first = $('select')[0].value;
  var second  = $('select')[1].value;
  load(first, second);
})

// function getSecondDataSet (firstDataset) {
//   $.ajax({
//     type: "GET",
//     url: "/assets/noise_complaints.csv",
//     dataType: "text",
//     success: function(data) {
//       debugger;
//       parsedData = d3.csvParse(data);
//       buildChart(firstDataset, parsedData);
//       return data;
//     }
//   })
// }

function buildChart (dataset, firstData, secondData) {
  //COLORS for circles and triangles
  // template from: http://codepen.io/sasidhar2992/pen/jbgbwV
  var firstColor = "#33A1FD";
  var secondColor = "#FDCA40";

  //data object to hold parsed data
  var stagingData = [];

  //parse the sample data into the data object D3 expects
  dataset.forEach(function(entry) {
    var tempArray = [];
    if (entry !== undefined) {
      tempArray.push(entry[firstData]);
      tempArray.push(entry[secondData]);
      tempArray.push(entry.zipcode);
      stagingData.push(tempArray);
    }
  });

  //stagingData is an array of arrays, the two values and the last being the zip (point of coincidence)

  //Create object with counted occurences
  var counts = _.countBy(stagingData);
  //Sort that object's counts and reverse to get highest at 0
  var sorted = _.sortBy(counts).reverse();
  //The highest count
  var highestCount = sorted[0];

  //This is going to be the data that d3 uses after we do stuff to get it right
  var data = [];

  //Avoid duplicate entries by looping through counts instead
  //of originalData. Go through each count and get the values from the keys
  _.forOwn(counts, function(value, key) {
    var result = key.split(",");
    var tempArray = [];
    tempArray.push(parseInt(result[0]));
    tempArray.push(parseInt(result[1]));
    tempArray.push(parseInt(result[2]));
    // console.log(tempArray);
    data.push(tempArray);
  });


  //Dimensions
  var margin = {
    top: 10,
    right: 10,
    bottom: 50,
    left: 50
  };
  var width = 800 - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;

  //Get and set maxValue
  var maxX = d3.max(data, function(d) {
    return d[0];
  })

  var maxY = d3.max(data, function(d) {
    return d[1];
  })

  var minX = d3.min(data, function(d) {
    return d[0];
  })

  var minY = d3.min(data, function(d) {
    return d[1];
  })

  var maxValue = 0;

  if (maxX > maxY) {
    maxValue = maxX;
  } else {
    maxValue = maxY;
  }

  //Set X range and domain
    var x = d3.scaleLinear()
      .range([0, width])
      .domain([minX, maxX]);
  //Set Y range and domain
    var y = d3.scaleLinear()
      .range([height, 0])
      .domain([minY, maxY]);

    //Prime axis
    var xAxis = d3.axisBottom(x).ticks(10).tickSize(-height);
    var yAxis = d3.axisLeft(y).ticks(10 * height / width).tickSize(-width);

    //Draw the shell
    // $('.chart').children().hide();
    var svg = d3.select("#scatter-plot").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Draw triangles
    var trianglePoints = "0 " + height + ", " + height + " 0, " + height + " " + height;
    var secondTrianglePoints = "0 0, 0 " + height + ", " + height + " 0";

    // svg.append('polyline')
    // .attr('points', trianglePoints)
    // .style('fill', '#000000');

    // svg.append('polyline')
    // .attr('points', secondTrianglePoints)
    // .style('fill', '#808080');

    //Draw the axis
    svg.append("g")
      .attr("class", "x axis ")
      .attr('id', "axis--x")
      .attr("transform", "translate(" + minX + "," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .attr('id', "axis--y")
      .call(yAxis);

    //Draw the dots
  var r = d3.scaleLinear()
    //Range for dot sizes
    .range([5, 20])
    //Set the domain from data values
    .domain([1, highestCount]);

    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", function(d) {
	var thisCount = counts[d[0] + "," + d[1]];
	return r(parseInt(thisCount));
      })
    .attr("cx", function(d) {
      return x(parseInt(d[0]));
    })
    .attr("cy", function(d) {
      return y(parseInt(d[1]));
    })
    .attr("opacity", .7)
    .style("fill", function(d) {
      if (d[0] > d[1]) {
	return firstColor;
      } else {
	return secondColor;
      }
    });

  //Set small dots on top of big ones
  d3.selectAll("circle")
  .each(function(d) {
    var rad =  parseInt(d3.select(this).attr("r"));
    if (rad < 10) {
      this.parentElement.appendChild(this);
    }
  })

  //Draw the diagonal
  // svg.append("line")
  // .attr("x1", height)
  // .attr("y1", 0)
  // .attr("x2", 0)
  // .attr("y2", height)
  // .attr("stroke-width", 1)
  // .attr("stroke", "silver");

  var col1 = Object.keys(dataset[0])[1];
  var col2 = Object.keys(dataset[0])[1];
  //Draw the labels
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(300,580)")
    .style('fill','#6395AA')
    .text(firstData);

  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(-30,300) rotate(-90)")
    .style('fill', '#6395AA')
    .text(secondData);

  //Tipsy, to display the values
  $('svg circle').tipsy({
    fade: true,
    gravity: 'w',
    html: true,
    trigger: 'focus',
    title: function() {
      d = this.__data__;
      return firstData + ": " + d[0] + "<br>" + secondData + ": " + d[1] + "<br>zipcode: " + d[2] +"<br/>"
    }
  });
}