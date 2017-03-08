//Width and height
var w = 1150;
var h = 720;
var padding = 40;
var speed = 300;

// Real coordinates stadium lenglen
/*var top_left = [48.831832, 2.272053],
    top_right = [48.831997, 2.272831],
    bottom_left = [48.830974, 2.272471],
    bottom_right = [48.831140, 2.273253];*/


// Real coordinates stadium Wimille
var top_left = [48.875114, 2.277239],
    top_right = [48.874824, 2.277940],
    bottom_left = [48.874339, 2.276526],
    bottom_right = [48.874057, 2.277226];


var xMin = Math.min(top_left[0], top_right[0], bottom_left[0], bottom_right[0]);
var xMax = Math.max(top_left[0], top_right[0], bottom_left[0], bottom_right[0]);
var yMin = Math.min(top_left[1], top_right[1], bottom_left[1], bottom_right[1]);
var yMax = Math.max(top_left[1], top_right[1], bottom_left[1], bottom_right[1]);


var points_raw = coords_pedro.map(function(obj) {
  return Object.keys(obj).map(function(key) {
    return obj[key];
    });
});

//points = points_raw.slice(1000, 6800);
points = points_raw.slice(3900, 6720);

var pauseValues = {
  lastTime: 0,
  currentTime: 0
};

var i_time = 0;


// Create x & y - max & min
/* var xMin = d3.min(points, function(d) { return d[1]; })
var xMax = d3.max(points, function(d) { return d[1]; })
var yMin = d3.min(points, function(d) { return d[2]; })
var yMax = d3.max(points, function(d) { return d[2]; }) */

var hrMin = d3.min(points, function(d) { return Number(d[3]); })
var hrMax = d3.max(points, function(d) { return Number(d[3]); })

//Create scale functions
var xScale = d3.scaleLinear()
                .domain([xMin, xMax])
                .range([padding, w + padding]);

var yScale = d3.scaleLinear()
                .domain([yMax, yMin])
                .range([h + (padding * 2), 0]);


var hrScale = d3.scaleLinear()
                .domain([hrMin, hrMax])
                .range([0, 100]);


var pointsScaled = [];

for (var i = 0; i < points.length; i++) {
    pointsScaled[i] = [points[i][0], Number(xScale(points[i][1])),
    Number(yScale(points[i][2])), Number(hrScale(points[i][3]))];
}


function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

var pointsScaled_rotated = [];

for (var i = 0; i < pointsScaled.length; i++) {
    var cx = 575,
        cy = 360,
        angle = 20;
    pointsScaled_rotated[i] = rotate(cx, cy, pointsScaled[i][1], pointsScaled[i][2], angle);
}



function make_RGB(hr_scaled) {
    var R = Math.floor((255 * hr_scaled) / 100)
    var G = Math.floor((255 * (100 - hr_scaled)) / 100)
    var B = 0
    return 'rgb(' + R + ',' + G + ',0)'
}



d3.xml("static/input/field.svg", function(xml) {
    var svgdom = document.getElementById("main-container").appendChild(xml.documentElement);

    //Select SVG element in svgdom
    var svg = d3.select("svg")
                .attr("width", w)
                .attr("height", h)

    // Initiatiate circle at the first point
    var circle = svg.append("circle")
        .attr("r", 13)
        .attr('cx', pointsScaled_rotated[0][0])
        .attr('cy', pointsScaled_rotated[0][1])
        .attr('fill', make_RGB(pointsScaled[0][3]))

    d3.select("button").on("click",function(d, i){
      var button = d3.select(this);
      if (button.text() == "Pause") {
        button.text("Play");
        circle.transition().duration(0);
        time_p.transition().duration(0);
        setTimeout(function() {
          pauseValues.lastTime = pauseValues.currentTime;
          },
        100);  // introduces a delay before resetting the times
      } else {
        button.text("Pause");
        transition_circle(pauseValues.lastTime);
        transition_time(pauseValues.lastTime)
      }
    });

    function transition_circle(i_time) {
      circle.transition()
            .duration(speed)
            .attr('cx', cx_circle(i_time))
            .attr('cy', cy_circle(i_time))
            .attr('fill', make_RGB(pointsScaled[i_time][3]))
            .on("end", function() {
                    pauseValues = {
                      lastTime: 0,
                      currentTime: 0
                    };
                i_time = i_time + 1;
                if (i_time >= points.length) {
                    i_time = 0;
                }
                pauseValues.currentTime = i_time;
                transition_circle(i_time)
                transition_time(i_time);
            });
    }

    function cx_circle(i_time) {
        return pointsScaled_rotated[i_time][0]
    }

    function cy_circle(i_time) {
        return pointsScaled_rotated[i_time][1]
    }

    function transition_time(i_time) {
        time_p.transition()
        .duration(speed)
        .text(function(d) {
            return pointsScaled[i_time][0]
        })
        //.on("end", transition_time);
    }

    var time_p = d3.select("#time-div");
    time_p.text(pointsScaled[0][0]);

    // svg.selectAll("point")
    //    .data(pointsScaled_rotated)
    //    .enter()
    //    .append("circle")
    //    .attr("r", 3)
    //    .attr("transform", function(d) { return "translate(" + d.slice(0, 2) + ")"; });

});
        