var data = undefined;
function shiftvalue(input,max) {
  // var length = count_digit(input);
  // length = length + Math.floor((length-1)/3);
  // return length;
  if (input > (max/2) ) {
    return 0;
  }
  else {
    return (8*count_digit(input)+4);
  }
}

function count_digit(input) {
  return String(input).length;
}

function graphChanger(input) {
  hash = {
    "Graffiti Complaints":1,
    "Heating Complaints":2,
    "Illegal Parking Complaints":3,
    "Noise Complaints":4,
    "Restaurant Average Score":5,
    "Streetlight Complaints":6,
    "Amount Of Trees":7
  };
  return hash[input];
}

function setglob(tmp) {
  data = tmp;
}

function jump(h){
    // var url = location.href;               //Save down the URL without hash.
    // location.href = "#"+h;                 //Go to the target element.
    // history.replaceState(null,null,url);   //Don't like hashes. Changing it back.
    $('html, body').animate({
      scrollTop: $('#'+h).offset().top
    }, 1000);
}

$(function () {
  d3.csv("/assets/master.csv", function(error, data) {
    if (error) throw error;
    setglob(data);
  });

  var shrink = true;
  $('select').change(function (e) {

  if (shrink) {
    $("header#myheader ul").wrap("<li></li>");
    $("header#myheader").animate({
      "textAlign":"left",
      "font-size":"1em"
    },1000);
    $("header#myheader").css({"textAlign":"left"});
    // $("header#myheader").animate(function() { $("header#myheader").css({"textAlign":"left"})},1000);
    shrink = false;
  }
  var gtitle = $('select[name="first"] :selected').text();
  var graphytitle = gtitle.replace(/_/g,"").toLowerCase();
  var typeofsort = "zipcode";

  var breakexecution = false;
  $('.graphytitle').each(function() {
    if ( $(this).attr('id') == ( graphytitle+typeofsort ) ) {
      jump(( graphytitle+typeofsort ));
      // $('html, body').animate({
      //   scrollTop: $( "#"+ (graphytitle+typeofsort )).offset().top
      // }, 1000);
      breakexecution = true;
      return;
    }
  });
  if (breakexecution) {
    e.preventDefault();
    return;
  }

  if (data != undefined) {
  // d3.select("svg").remove();
  $('body div#graphy').prepend('<p></p>');
    var firstptag = $('body div#graphy p:first-child');
    // firstptag.hide();
    firstptag.animate({ "height": "toggle", "opacity": "toggle" });
    //headers defined here
    var tmp = Object.keys(data[0])
    var zipcode = tmp[0];
    var gname = parseInt($('select[name="first"] :selected').val());
    var value = tmp[gtitle == undefined ? 1 : gname];
    var name_of_column = value.replace(/_/g," ");
    firstptag.append('<h2 class="graphytitle" id="' + graphytitle + typeofsort + '">' + name_of_column.toUpperCase() + ' SORT BY ' + typeofsort.toUpperCase() + '</h3>');
    firstptag.append('<a class="myanchors" onclick="return false" href="#toptop"> <img src="/assets/toptop" alt="Back to Top"/> </a>');
    firstptag.append('<h3>' + tmp[0].toUpperCase() + '</h3>');

    var mediawidnowlength = $(window).width();
    var m = [60, 10, 10, 60],
        w = (mediawidnowlength <= 800 ? 800 : (mediawidnowlength-50))- m[1] - m[3],
        h = (15*data.length) - m[0] - m[2];

    var format = d3.format(",.0f");

    var x = d3.scale.linear().range([0, w]),
        y = d3.scale.ordinal().rangeRoundBands([0, h], .1);

    var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h),
        yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
        debugger;

    var svg = d3.select("body div#graphy p:first-child").append("svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
      .append("g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    // Parse numbers, and sort by SCORE.
    // converts to integer
    data.forEach(function(d) { d[value] = +d[value]; });
    if ( typeofsort == "value" ) {
      data.sort(function(a, b) { return b[value] - a[value]; });
    } else {
      data.sort(function(a, b) { return b[zipcode] - a[zipcode]; });
    }

    // Set the scale domain.
    var max = d3.max(data, function(d) { return d[value]; });
    x.domain([0, max]);
    y.domain(data.map(function(d) { return d[zipcode]; }));

    var bar = svg.selectAll("g.bar")
        .data(data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(0," + y(d[zipcode]) + ")"; });

    bar.append("rect")
        .attr("width", function(d) { return x(d[value]); })
        .attr("height", y.rangeBand());

    bar.append("text")
        .attr("class", "value")
        .attr("x", function(d) { return (x(d[value]) +  (shiftvalue((d[value]),max))   ); })
        .attr("y", y.rangeBand() / 2)
    //shiftvalue(x(d[value]))
        .attr("dx", -3 )
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d) { return format(d[value]); });

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

  // firstptag.fadeIn(2000);
  // firstptag.show("slow");

  firstptag.animate({ "height": "toggle", "opacity": "toggle" }, 2000);
  }
  e.preventDefault();
  });
 $(document).delegate('a.myanchors','click', function (e) {
     jump('toptop');
    e.preventDefault();
 });
});

// $(document).ready(function() {
//   window.restaurant_average_score = {};
//   $.ajax({
//       type: "GET",
//       url: "assets/restaurant_average_score.csv",
//       dataType: "text",
//       success: function(data) {processData(data);}
//    });
// });


// function processData(allText) {
//   var arr = allText.split("\n");
//   for (var i = 0, len = arr.length; i < len; i++) {
//     var morearr = arr[i].split(",");
//     window.restaurant_average_score[morearr[0]] = parseInt(morearr[1]);
//   }
// }