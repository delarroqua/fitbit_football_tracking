// Todo: select speed (slow, normal, fast)
// Todo: refactor code and clean it (tcx data to js file & movements_football_d3)

//Width and height
var w = 1050;
var h = 680;
var padding = 20;
var speed = 100;

// var points = d3.values(JSON.parse(coords_pedro));  
d3.csv("input/coords_pedro.csv", function(coords_pedro) {
    var points = coords_pedro.map(function(obj) {
      return Object.keys(obj).map(function(key) { 
        return obj[key];
        });
    });

    var pauseValues = {
      lastTime: 0,
      currentTime: 0
    };

    var i_time = 0;

    // Create x & y - max & min
    var xMin = d3.min(points, function(d) { return d[1]; })
    var xMax = d3.max(points, function(d) { return d[1]; })
    var yMin = d3.min(points, function(d) { return d[2]; })
    var yMax = d3.max(points, function(d) { return d[2]; })

    //Create scale functions
    var xScale = d3.scaleLinear()
                    .domain([xMin, xMax])
                    .range([padding, w - (padding * 2)]);

    var yScale = d3.scaleLinear()
                    .domain([yMin, yMax])
                    .range([h - padding, padding]);

    var hrMin = d3.min(points, function(d) { return Number(d[3]); })
    var hrMax = d3.max(points, function(d) { return Number(d[3]); })

    var hrScale = d3.scaleLinear()
                    .domain([hrMin, hrMax])
                    .range([0, 100]);


    var pointsScaled = [];

    for (var i = 0; i < points.length; i++) {
        pointsScaled[i] = [Number(xScale(points[i][1])), 
        Number(yScale(points[i][2])), Number(hrScale(points[i][3]))];
    }


    function make_RGB(hr_scaled) {
        var R = Math.floor((255 * hr_scaled) / 100)
        var G = Math.floor((255 * (100 - hr_scaled)) / 100)
        var B = 0 
        return 'rgb(' + R + ',' + G + ',0)'
    }


    d3.xml("input/field.svg", function(xml) {
        var svgdom = document.getElementById("main-container").appendChild(xml.documentElement);

        //Select SVG element in svgdom
        var svg = d3.select("svg")   
                    .attr("width", w)
                    .attr("height", h)

        // Initiatiate circle at the first point
        var circle = svg.append("circle")
            .attr("r", 13)
            .attr('cx', pointsScaled[0][0])
            .attr('cy', pointsScaled[0][1])
            .attr('fill', make_RGB(pointsScaled[0][2]))

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
                .attr('fill', make_RGB(pointsScaled[i_time][2]))
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
            return pointsScaled[i_time][0] 
        }

        function cy_circle(i_time) { 
            return pointsScaled[i_time][1] 
        }

        function transition_time(i_time) {
            time_p.transition()
            .duration(speed)
            .text(function(d){ 
                return points[i_time][0] 
            })
            //.on("end", transition_time);
        }

        var time_p = d3.select("#time-div");
        time_p.text(points[0][0]);

    });

}) 
        