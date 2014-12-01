
// initial canvas settings
var visCanvas = { width: 1280, height: 400 };

// entity settings
var entity = { width: 100, height: 25, rdCorner: 5, freqWidth: 15 };

// entity list settings
var entList = { width: 120, height: 400, gap: 80, topGap: 10, startPos: 0, count: 0 };

// in-between bar settings
var bic = { frameWidth: 60, frameHeight: 30, frameRdCorner: 0, innerRdCorner: 0 };

// color settings
var color = {
	entNormal: "rgba(78, 131, 232, 0.3)",
	entHover: "rgba(78, 131, 232, 0.5)",
	entHighlight: "rgba(228, 122, 30, 0.4)", //"rgba(78, 131, 232, 0.7)",
	entFreColor: "rgba(22, 113, 229, 0.3)",
	bicFrameColor: "rgba(0, 20, 20, 0.2)"
}

// canvas for visualizations
var canvas = d3.select("#biset_canvas")
	.append('svg')
	.attr('id', 'vis_canvas')
    .attr("width", visCanvas.width)
    .attr('height', visCanvas.height);

var svgPos = canvas[0][0].getBoundingClientRect(),
	svgCanvasOffset = { left: svgPos.left, top: svgPos.top };

// an array for the displayed bics
var bicDisplayed = [];

d3.json("data/data.json", function(error, json) {
	var dumData = json;

	// 2 lists for testing
	var aListData =  dumData.lists[0],
		newListData = dumData.lists[1],
		bicData = dumData.bics;	    

	entList.count += 1;
	// a canvas for a list
	var aList = canvas.append('g')
		.attr('id', 'list_' + entList.count)
		.attr('width', entList.width)
		.attr('height', entList.height);   

	// add a list to the vis canvas
	var aListView = addList(aList, aListData, bicData, entList.startPos);
	addSortCtrl(aListView);

	// var svg = $("svg#vis_canvas")[0];
	// console.log(svg);
	// var bbox = svg.getBBox();
	//svg.setAttribute("viewBox", [bbox.x, bbox.y, bbox.width, bbox.height]);

	// testing for adding a new list
	$('#btn_change').click(function(){
		entList.count += 1;

		entList.startPos += entList.width + entList.gap;

		var newlist = canvas.append('g')
			.attr('id', 'list_' + entList.count)
			.attr('width', entList.width)
			.attr('height', entList.height)
			.attr("transform", "translate(" + entList.startPos + ",0)");	

		var newAddedList = addList(newlist, newListData, bicData, entList.startPos);
		addSortCtrl(newAddedList);
	});	
});


/*
* Add a list in a canvas and return this list
* @param canvas, the canvas for adding a list
* @param listData, data to generate the list
* @param bicList, the list of all bics
* @param startPos, position to draw bar
*/
function addList(canvas, listData, bicList, startPos) {
	
	// type of the list
	var type = listData.listType,
	// the list id
		listNum = listData.listID,
	// entities in the list
		entSet = listData.entities;

	// values of each entity
	var dataValues = [],
		dataFrequency = [];
	for (var i = 0; i < entSet.length; i++) {
		dataValues.push(entSet[i].entValue);
		dataFrequency.push(entSet[i].entFreq);
	}

	dataValues.sort();

	// position for each entity in y-axis
	var y = d3.scale.ordinal()
	    .domain(dataValues)
	    .rangePoints([entList.topGap, entSet.length * entity.height + entList.topGap], 1);

	var freIndicatorWidth = d3.scale.linear()
	    .domain([0, d3.max(dataFrequency)])
	    .range([3, entity.freqWidth - 1]);	    

    // add control group of a list
    if (listNum == 1)
	    $("#biset_control").append("<div class='listControlGroup'>" + 
	    	"<h5 class='listTitle' id='listTitle_" + listNum + "'>" + type + "</h5>" + 
	    	"<select class='orderCtrl' id='list_" + listNum + "_sortCtrl'>" + 
	    		"<option value='alph'>alphabeic</option>" + 
	    		"<option value='freq'>frequency</option>" + 
			"</select>" + 
		"</div>");
	else
	    $("#biset_control").append("<div class='listControlGroup'>" +
	    	"<h5 class='listTitle' id='listTitle_" + listNum + "'>" + type + "</h5>" +
	    	"<select class='orderCtrl' id='list_" + listNum + "_sortCtrl'>" + 
	    		"<option value='alph'>alphabeic</option>" +
	    		"<option value='freq'>frequency</option>" + 
			"</select>" + 
		"</div>");

	// add group to the svg
	var bar = canvas.selectAll("." + type)
    	.data(entSet)
  		.enter().append("g")
  		.attr('class', type)
  		.attr("transform", function(d, i) { return "translate(" + startPos + "," + y(d.entValue) + ")"; });

	// add texts for each entity
	var viewText = bar.append("text")
	    .attr("x", entity.width / 6)
	    .attr("y", entity.height / 2)
	    .attr("dy", ".35em")
	    .text(function(d) { return d.entValue; });

	// add bar for each entity
	var entityFreIndicator = bar.append("rect")
	    .attr("width", function(d, i) { return freIndicatorWidth(d.entFreq); })
	    .attr("height", entity.height - 1)
	    .attr("rx", entity.rdCorner)
	    .attr("ry", entity.rdCorner)
	    .attr("id", function(d, i) { return type + "_" + d.entityID + "_freq";})
	    .attr("fill", color.entFreColor);	    

	// add bar for each entity
	var entityFrame = bar.append("rect")
		.datum(function(d) { return d; })
	    .attr("width", entity.width)
	    .attr("height", entity.height - 1)
	    .attr("rx", entity.rdCorner)
	    .attr("ry", entity.rdCorner)
	    .attr("id", function(d, i) { return type + "_" + d.entityID;})
	    .attr("fill", color.entNormal)
    	.on("mouseover", function(d, i) {
    		if (d3.select(this).attr("class") != "entHighlight") 
    			d3.select(this).attr("fill", color.entHover);
    	})
    	.on("mouseout", function() {
    		if (d3.select(this).attr("class") != "entHighlight") 
    			d3.select(this).attr("fill", color.entNormal);
    	})
    	.on("click", function() {

    		var tmpID = d3.select(this).attr("id"),
    			entType = tmpID.split("_")[0],
    			entID = tmpID.split("_")[1],
    			thisEnt = entSet[entID - 1];

    		// ratio between row and column
			var bicRowPercent = [];
			for (var i = 0; i < bicList.length; i++) {
				var tmpRatio = bicList[i].entNumInRow / (bicList[i].entNumInRow + bicList[i].entNumInCol);
				bicRowPercent.push(tmpRatio);
			}

			// highlight selected entity
			if (d3.select(this).attr("class") != "entHighlight") {

				// visual percentage based on ratio
				var bicRatio = d3.scale.linear()
				    .domain([0, 1])
				    .range([1, bic.frameWidth]);

				if (thisEnt.bicSetsRight.length != 0) {

					// a canvas for a bicluster list
					var aBicList = canvas.append('g')
						.attr('id', 'bicList_0')
						.attr('width', bic.frameWidth)
						.attr('height', entList.height);

					// add group to the svg
					var bicFrame = aBicList.selectAll(".bics")
				    	.data(thisEnt.bicSetsRight)
				  		.enter().append("g")
				  		.attr("class", "bics")
				  		// .attr("id", function(d, i) {
				  		// 	bicDisplayed.push(d);
				  		// 	return "bic_" + d;
				  		// })
				  		.attr("transform", function(d, i) {
				  			var tmpX = startPos + entity.width + ((entList.width + entList.gap) * 2 - entity.width - bic.frameWidth)/2;
				  			return "translate(" + tmpX + "," + i * bic.frameHeight + ")";
				  		});

					// proportion of row
					bicFrame.append("rect")
				  		.attr("id", function(d, i) {
				  			bicDisplayed.push(d);
				  			return "bic_left_" + d;
				  		})
					    .attr("width", function(d, i) {
					    	return bicRatio(bicRowPercent[i]);
					    })
					    .attr("height", entity.height - 1)
					    .attr("rx", bic.innerRdCorner)
					    .attr("ry", bic.innerRdCorner)
					    .attr("fill", color.entFreColor);

					// 100% proportion
					bicFrame.append("rect")
						// bound the data of bics
						// .datum(function(d) { return d; })
				  		.attr("id", function(d, i) {
				  			bicDisplayed.push(d);
				  			return "bic_frame_" + d;
				  		})
					    .attr("width", bic.frameWidth)
					    .attr("height", entity.height - 1)
					    .attr("rx", bic.frameRdCorner)
					    .attr("ry", bic.frameRdCorner)
					    .attr("fill", color.bicFrameColor);

					var drag = d3.behavior.drag()
			            .origin(function() { 
			            	var t = d3.select(this);
			                return {x: t.attr("x"), y: t.attr("y")};
			            })
			            .on("dragstart", function (d) {
			                d3.event.sourceEvent.stopPropagation();
			                d3.select(this).classed("dragging", true);
			            })
			            .on("drag", function (d) {

			            	// d3.select(this).attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
			            	idNum = d3.select(this).attr("id").split("_")[2];	            	

			                d3.select(this).attr("x", d3.event.x).attr("y", d3.event.y);
			                d3.select("#bic_left_" + idNum).attr("x", d3.event.x).attr("y", d3.event.y);
			                for (var i = connections.length; i--;) {
			                    addLink(connections[i]);
			                }
			            })
			            .on("dragend", function (d) {
			                for (var i = connections.length; i--;) {
			                    addLink(connections[i]);
			                }			            	
			                d3.select(this).classed("dragging", false);			                
        			});

        			connections = [];

        			console.log(thisEnt.bicSetsRight.length);				    

					for (var i = 0; i < thisEnt.bicSetsRight.length; i++) {
						var obj1 = d3.select(this),
							obj2 = d3.select("#bic_frame_" + thisEnt.bicSetsRight[i]);

						console.log("here");
						console.log(obj2);

						// add a link between left and cluster
						connections.push(addLink(obj1, obj2, "#000", canvas));
						obj2.attr({cursor: "move"});
						obj2.call(drag);							

						// get the field of another column
						var colField = bicList[thisEnt.bicSetsRight[i] - 1].colField,
							col = bicList[thisEnt.bicSetsRight[i] - 1].col;

						for (var j = 0; j < col.length; j++) {
							var obj3 = d3.select("#" + colField + "_" + col[j]);
							// add a link between left and cluster
							connections.push(addLink(obj2, obj3, "#000", canvas));
							obj2.attr({cursor: "move"});
							obj2.call(drag);							
						}						
					}
		  		}

				// flag this entity, selected 
				d3.select(this).data()[0].selected = 1;
				// highlight selected entity
				d3.select(this)
					.attr("class", "entHighlight")
					.attr("fill", color.entHighlight);							
			}
			// unhighlight the entity
			else {
				d3.select(this)
					.classed("entHighlight", false)
					.attr("fill", color.entNormal);

				if (thisEnt.bicSetsRight.length != 0) {
					for (var i = 0; i < thisEnt.bicSetsRight.length; i++){
						// d3.select("#bic_" + thisEnt.bicSetsRight[i]).remove();
						d3.select("#bic_left_" + thisEnt.bicSetsRight[i]).remove();
						d3.select("#bic_frame_" + thisEnt.bicSetsRight[i]).remove();
					}
				}					
			}	  		
  		});

	// for an object for this list
	var listView = {
		"id": "list_" + listNum,
		"dataType": type,
		"relatedDataSet": listData,
		"startPos": startPos,
		"yAxis": y,
		"entGroups": bar,
		"entities": entityFrame,
		"texts": viewText
	}
    return listView;	    
}


/*
* sort a list visually
* @param aList, svg objects in a list selected by d3 with associated data
* @param sortType, sorting orders
*/
function sortList(aList, sortType) {
	// get all entities
	var entSet = aList.relatedDataSet.entities;

	// values of each entity
	var dataValues = [],
		dataFrequency = [];
	for (var i = 0; i < entSet.length; i++) {
		dataValues.push(entSet[i].entValue);
		dataFrequency.push(entSet[i].entFreq);
	}

	// sort by frequency
	if (sortType == "freq") {
		dataFrequency.sort(function(a, b) { return b - a; });
		// new positions for each entity
		aList.yAxis.domain(dataFrequency);

		// move entities to their new position
		aList.entGroups.transition()
			.duration(750)
			.delay(function(d, i) { return i * 50; })
			.attr("transform", function(d, i) {
				return "translate(" + aList.startPos + "," + aList.yAxis(d.entFreq) + ")"; 
			});		
	}
	// sort by alphabeic order
	if (sortType == "alph") {
		dataValues.sort();
		// new positions for each entity
		aList.yAxis.domain(dataValues);

		// move entities to their new position
		aList.entGroups.transition()
			.duration(750)
			.delay(function(d, i) { return i * 50; })
			.attr("transform", function(d, i) {
				return "translate(" + aList.startPos + "," + aList.yAxis(d.entValue) + ")"; 
			});
	}
}


/*
* Add sorting event handler to the dropdown
* @param listView, new added list
*/
function addSortCtrl(listView) {
	// sort a list by selected value
	$("#" + listView.id + "_sortCtrl").change(function() {
		var orderBy = $(this).val();
		sortList(listView, orderBy);
	});
}

/*
* add a line
* reference: http://raphaeljs.com/graffle.html
* @param obj1, the 1st object
* @param obj2, the 2nd object
* @param d3obj, d3 object to append the line
* @param bg, 
*/
var addLink = function (obj1, obj2, line, d3obj, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
        d3obj = line.d3Canvas;
    }

    var svgPos = d3obj[0][0].getBoundingClientRect();

    var bb1 = obj1[0][0].getBoundingClientRect(),
        bb2 = obj2[0][0].getBoundingClientRect(),

        p = [{x: bb1.left + bb1.width / 2 - svgPos.left, y: bb1.top - 1 - svgPos.top},
        {x: bb1.left + bb1.width / 2 - svgPos.left, y: bb1.top + bb1.height + 1 - svgPos.top},
        {x: bb1.left - 1 - svgPos.left, y: bb1.top + bb1.height / 2 - svgPos.top},
        {x: bb1.left + bb1.width + 1 - svgPos.left, y: bb1.top + bb1.height / 2 - svgPos.top},
        {x: bb2.left + bb2.width / 2 - svgPos.left, y: bb2.top - 1 - svgPos.top},
        {x: bb2.left + bb2.width / 2 - svgPos.left, y: bb2.top + bb2.height + 1 - svgPos.top},
        {x: bb2.left - 1 - svgPos.left, y: bb2.top + bb2.height / 2 - svgPos.top},
        {x: bb2.left + bb2.width + 1 - svgPos.left, y: bb2.top + bb2.height / 2 - svgPos.top}],        

        // p = [{x: bb1.left + bb1.width / 2 - svgCanvasOffset.left, y: bb1.top - 1 - svgCanvasOffset.top},
        // {x: bb1.left + bb1.width / 2 - svgCanvasOffset.left, y: bb1.top + bb1.height + 1 - svgCanvasOffset.top},
        // {x: bb1.left - 1 - svgCanvasOffset.left, y: bb1.top + bb1.height / 2 - svgCanvasOffset.top},
        // {x: bb1.left + bb1.width + 1 - svgCanvasOffset.left, y: bb1.top + bb1.height / 2 - svgCanvasOffset.top},
        // {x: bb2.left + bb2.width / 2 - svgCanvasOffset.left, y: bb2.top - 1 - svgCanvasOffset.top},
        // {x: bb2.left + bb2.width / 2 - svgCanvasOffset.left, y: bb2.top + bb2.height + 1 - svgCanvasOffset.top},
        // {x: bb2.left - 1 - svgCanvasOffset.left, y: bb2.top + bb2.height / 2 - svgCanvasOffset.top},
        // {x: bb2.left + bb2.width + 1 - svgCanvasOffset.left, y: bb2.top + bb2.height / 2 - svgCanvasOffset.top}], 

        d = {}, dis = [];

// console.log(bb1);
// console.log(bb2);
// console.log(p);

    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M" + x1.toFixed(3), y1.toFixed(3) + "C" + x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");  
    
    if (line && line.line) {
        //console.log(line.line.bg);
        //line.bg && line.bg.attr({path: path});
        line.line.attr("d", path);
    } else {
        var color = typeof line == "string" ? line : "#000";
        return {      
            //bg: bg && bg.split && robj.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: d3obj.append("path").attr("d", path).style({stroke: "#000", fill: "none"}),
            from: obj1,
            to: obj2,
            d3Canvas: d3obj            
        };
    }
};


$('.selectpicker').selectpicker({
	style: 'btn-default',
	size: 10
});