
// initial canvas settings
var visCanvas = { width: 1280, height: 2650 };

// entity settings
var entity = { width: 260, height: 25, rdCorner: 5, freqWidth: 30 };

// entity list settings
var entList = { width: 260, height: 2650, gap: 80, topGap: 10, startPos: 0, count: 0 };

// in-between bar settings
var bic = { frameWidth: 60, frameHeight: 30, frameRdCorner: 0, innerRdCorner: 0, count: 0 };

var bicList = { width: 60, height: 2650 }

// color settings
var color = {
	entNormal: "rgba(78, 131, 232, 0.3)",
	entHover: "rgba(78, 131, 232, 0.5)",
	entHighlight: "rgba(228, 122, 30, 0.4)", //"rgba(78, 131, 232, 0.7)",
	entFreColor: "rgba(22, 113, 229, 0.3)",
	bicFrameColor: "rgba(0, 20, 20, 0.2)",
	lineNormalColor: "rgba(0, 0, 0, 0.3)"
};

// an array to store all links
var connections = [],
	biclusters = [],
	entLists = [],
	selectedEnts = [];

// a hash table to maintain the displayed bics
//var bicDisplayed = [];
var bicDisplayed = new Hashtable();

// canvas for visualizations
var canvas = d3.select("#biset_canvas")
	.append('svg')
	.attr('id', 'vis_canvas')
    .attr("width", visCanvas.width)
    .attr('height', visCanvas.height);


// for debug
$("svg").css({"border-color": "#C1E0FF", 
         "border":"0px", 
         "border-style":"solid"});

var svgPos = canvas[0][0].getBoundingClientRect(),
	svgCanvasOffset = { left: svgPos.left, top: svgPos.top };


var getOffset = function(element) {
        var $element = $(element[0][0]);
        return {
            left: $element.position().left,
            top: $element.position().top,
            width: element[0][0].getBoundingClientRect().width,
            height: element[0][0].getBoundingClientRect().height,
        };
    }

$('.selectpicker').selectpicker({
	style: 'btn-default',
	size: 10
});

// get dataset name
var selData = $('#selDataSet').val();
// to do get column names from the database about the dataset

$("#dataDimensionList").append(
	"<input type='checkbox' name='dimensions' value='person' id='d_person'> Person<br />" + 
	"<input type='checkbox' name='dimensions' value='location' id='d_location'> Location<br />" +
    // "<input type='checkbox' name='dimensions' value='date' id='d_date'> Date<br />" +
    "<input type='checkbox' name='dimensions' value='org' id='d_org'> Organization<br />"
);    

// d3.json(window.SERVER_PATH + 'vis/loadbisets/', function(error, json) {
// for testing purpose
// // d3.json("http://localhost:8000/static/vis/data/data.json", function(error, json) {	
// 	var dumData = json,
// 		bicData = dumData.bics;

// 	// set all bics has not been displayed
// 	for (var i = 0; i < bicData.length; i++)
// 		bicDisplayed.put(bicData[i].bicID, 0);

// 	// var svg = $("svg#vis_canvas")[0];
// 	// var bbox = svg.getBBox();
// 	//svg.setAttribute("viewBox", [bbox.x, bbox.y, bbox.width, bbox.height]);

// 	// testing for adding a new list
// 	$('#btn_add_list').click(function(){

// 		datasetRequest();

// 		// get selected dimensions
// 		var selDims = $("input:checkbox:checked");
		
// 		// add all lists
// 		for (var i = 0; i < selDims.length; i++) {

// 			var lkey = $(selDims[i]).val();

// 			entList.count += 1;
// 			entList.startPos += (entList.width + entList.gap) * 2 * i;

// 			var aList = canvas.append('g')
// 				.attr('id', 'list_' + entList.count)
// 				.attr('width', entList.width)
// 				.attr('height', entList.height)
// 				.attr("transform", function(d, i) { return "translate(" + entList.startPos + "," + 0 + ")"; });
// 			entLists.push(aList);

// 			var aListData = dumData.lists[lkey];		

// 			// add a list to the vis canvas
// 			var aListView = addList(aList, aListData, bicData, entList.startPos);
// 			addSortCtrl(aListView);		 
// 		}

// 		// add all bics with lines
// 		for (var i = 0; i < selDims.length; i++) {
// 			if (i % 2 == 0) {
// 				var bicStartPos = (entList.width + entList.gap) * 2 * (i / 2 + 1) - ((entList.width + entList.gap) * 2 * (i / 2 + 1) - entList.width - bic.frameWidth) / 2 - bic.frameWidth;

// 				var aBicList = canvas.append('g')
// 					.attr('id', 'bic_list_' + entList.count)
// 					.attr('width', bicList.width)
// 					.attr('height', bicList.height)
// 					.attr("transform", function(d, i) { return "translate(" + bicStartPos + "," + 0 + ")"; });;

// 				var rowField = $(selDims[i]).val(),
// 					colField = $(selDims[i + 1]).val();
// 				addBics(entLists[i], aBicList, aListData, bicData, bicStartPos, rowField, colField);				
// 			}
// 		}
// 	});	
// });

var drag = d3.behavior.drag()
    // .origin(function() {

    // 	thisOffset = getOffset(d3.select(this));
    // 	return { x: thisOffset.left, y: thisOffset.top };

    // 	// var t = d3.select(this);
    //     // return {x: t.attr("x"), y: t.attr("y")};
    // })
    .on("dragstart", function (d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    })
    .on("drag", function (d) {

    	d3.select(this).attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
    	// idNum = d3.select(this).attr("id").split("_")[2];	            	

     //    d3.select(this).attr("x", d3.event.x).attr("y", d3.event.y);
     //    d3.select("#bic_left_" + idNum).attr("x", d3.event.x).attr("y", d3.event.y);
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
	    		"<option value='freq' disabled>frequency</option>" + 
			"</select>" + 
		"</div>");
	else
	    $("#biset_control").append("<div class='listControlGroup'>" +
	    	"<h5 class='listTitle' id='listTitle_" + listNum + "'>" + type + "</h5>" +
	    	"<select class='orderCtrl' id='list_" + listNum + "_sortCtrl'>" + 
	    		"<option value='alph'>alphabeic</option>" +
	    		"<option value='freq' disabled>frequency</option>" + 
			"</select>" + 
		"</div>");

	// add group to the svg
	var bar = canvas.selectAll("." + type)
    	.data(entSet)
  		.enter().append("g")
  		.attr('class', type)
  		.attr("id", function(d, i) { return type + "_" + d.entityID;})
  		.attr("transform", function(d, i) { return "translate(" + 0 + "," + y(d.entValue) + ")"; })
  		// mouseover event
    	.on("mouseover", function(d, i) {

    		var frameID = d3.select(this).attr("id"),
    			thisEntType = frameID.split("_")[0],
    			thisListID = listData.listID;

    		var entData = d3.select(this).data()[0],
    			// all associated bic ids
    			leftRelBicIDs = [],
    			rightRelBicIDs = [];

    		// change color when highlight
    		if (d3.select(this).attr("class") != "entSelected") {
    			d3.select("#" + frameID + "_frame").attr("fill", color.entHover);
    			d3.select(this).attr("class", "entHover");

				// 1st list
				if (thisListID == 1) {
					if (entData.bicSetsRight != null) {
						for (var i = 0; i < entData.bicSetsRight.length; i++){
							rightRelBicIDs.push(entData.bicSetsRight[i]);
						}

						for (var i = 0; i < rightRelBicIDs.length; i++) {
		    				var rowListIDs = bicList[rightRelBicIDs[i]].row,
		    					colListIDs = bicList[rightRelBicIDs[i]].col,
		    					rowField = bicList[rightRelBicIDs[i]].rowField,
		    					colField = bicList[rightRelBicIDs[i]].colField,
		    					thisBicID = "bic_" + rightRelBicIDs[i];

							d3.select("#" + thisBicID)
								.style("display", "block");
								//.style("opacity", 100)//

					        for (var l = connections.length; l--;) {
					            addLink(connections[l]);
					        }

		    				for (var j = 0; j < rowListIDs.length; j++) {
		    					d3.select("#" + rowField + "_" + rowListIDs[j] + "__" + thisBicID)
		    						// .style("opacity", 100)
		    						.style("display", "block");
		    				}

		    				for (var k = 0; k < colListIDs.length; k++) {
		    					d3.select("#" + thisBicID + "__" + colField + "_" + colListIDs[k])
		    						// .style("opacity", 100)
		    						.style("display", "block");    					
		    				}
						}
					}
				}
				// 2nd list
				else {
					if (entData.bicSetsLeft != null) {
						for (var i = 0; i < entData.bicSetsLeft.length; i++){
							leftRelBicIDs.push(entData.bicSetsLeft[i]);
						}

						for (var i = 0; i < leftRelBicIDs.length; i++) {
		    				var rowListIDs = bicList[leftRelBicIDs[i]].row,
		    					colListIDs = bicList[leftRelBicIDs[i]].col,
		    					rowField = bicList[leftRelBicIDs[i]].rowField,
		    					colField = bicList[leftRelBicIDs[i]].colField,
		    					thisBicID = "bic_" + leftRelBicIDs[i];

							d3.select("#" + thisBicID)
								// .style("opacity", 100)
								.style("display", "block");

					        for (var l = connections.length; l--;) {
					            addLink(connections[l]);
					        }

		    				for (var j = 0; j < rowListIDs.length; j++) {
		    					d3.select("#" + rowField + "_" + rowListIDs[j] + "__" + thisBicID)
		    						// .style("opacity", 100)
		    						.style("display", "block");
		    				}

		    				for (var k = 0; k < colListIDs.length; k++) {
		    					d3.select("#" + thisBicID + "__" + colField + "_" + colListIDs[k])
		    						// .style("opacity", 100)
		    						.style("display", "block");    					
		    				}
						}
					}
				}
    		}
    	})
    	.on("mouseout", function() {

    		var frameID = d3.select(this).attr("id"),
    			thisEntType = frameID.split("_")[0],
    			thisListID = listData.listID;

    		var entData = d3.select(this).data()[0],
    			// all associated bic ids
    			leftRelBicIDs = [],
    			rightRelBicIDs = [];

    		// change color when highlight
    		if (d3.select(this).attr("class") == "entHover") {
    			d3.select("#" + frameID + "_frame").attr("fill", color.entNormal);
    			d3.select(this).classed("entHover", false);

				// 1st list
				if (thisListID == 1) {
					if (entData.bicSetsRight != null) {
						for (var i = 0; i < entData.bicSetsRight.length; i++){
							rightRelBicIDs.push(entData.bicSetsRight[i]);
						}

						for (var i = 0; i < rightRelBicIDs.length; i++) {
		    				var rowListIDs = bicList[rightRelBicIDs[i]].row,
		    					colListIDs = bicList[rightRelBicIDs[i]].col,
		    					rowField = bicList[rightRelBicIDs[i]].rowField,
		    					colField = bicList[rightRelBicIDs[i]].colField,
		    					thisBicID = "bic_" + rightRelBicIDs[i];

							if (d3.select("#" + thisBicID).attr("class") != "bicSelected")
								d3.select("#" + thisBicID)
									// .style("opacity", 0)
									.style("display", "none");

		    				for (var j = 0; j < rowListIDs.length; j++) {
		    					if (d3.select("#" + rowField + "_" + rowListIDs[j] + "__" + thisBicID).attr("class") != "linkSelected")
		    						d3.select("#" + rowField + "_" + rowListIDs[j] + "__" + thisBicID)
		    							// .style("opacity", 0)
		    							.style("display", "none");
		    				}

		    				for (var k = 0; k < colListIDs.length; k++) {
		    					if (d3.select("#" + thisBicID + "__" + colField + "_" + colListIDs[k]).attr("class") != "linkSelected")
		    						d3.select("#" + thisBicID + "__" + colField + "_" + colListIDs[k])
		    							// .style("opacity", 0)
		    							.style("display", "none");    					
		    				}
						}
					}
				}
				// 2nd list
				else {
					if (entData.bicSetsLeft != null) {
						for (var i = 0; i < entData.bicSetsLeft.length; i++){
							leftRelBicIDs.push(entData.bicSetsLeft[i]);
						}

						for (var i = 0; i < leftRelBicIDs.length; i++) {
		    				var rowListIDs = bicList[leftRelBicIDs[i]].row,
		    					colListIDs = bicList[leftRelBicIDs[i]].col,
		    					rowField = bicList[leftRelBicIDs[i]].rowField,
		    					colField = bicList[leftRelBicIDs[i]].colField,
		    					thisBicID = "bic_" + leftRelBicIDs[i];

							if (d3.select("#" + thisBicID).attr("class") != "bicSelected")
								d3.select("#" + thisBicID)
									// .style("opacity", 0)
									.style("display", "none");

		    				for (var j = 0; j < rowListIDs.length; j++) {
		    					if (d3.select("#" + rowField + "_" + rowListIDs[j] + "__" + thisBicID).attr("class") != "linkSelected")
		    						d3.select("#" + rowField + "_" + rowListIDs[j] + "__" + thisBicID)
		    							// .style("opacity", 0)
		    							.style("display", "none");
		    				}

		    				for (var k = 0; k < colListIDs.length; k++) {
		    					if (d3.select("#" + thisBicID + "__" + colField + "_" + colListIDs[k]).attr("class") != "linkSelected")
		    						d3.select("#" + thisBicID + "__" + colField + "_" + colListIDs[k])
		    							// .style("opacity", 0)
		    							.style("display", "none");    					
		    				}
						}
					}
				}
			}
    	})

  		// .attr("transform", function(d, i) { return "translate(" + startPos + "," + y(d.entValue) + ")"; })
		.on("click", function() {

    		var frameID = d3.select(this).attr("id"),
    			thisEntType = frameID.split("_")[0],
    			thisListID = listData.listID;

    		var entData = d3.select(this).data()[0],
    			// all associated bic ids
    			leftRelBicIDs = [],
    			rightRelBicIDs = [];

			// console.log(d3.select(this).data()[0].entValue);
			var requestVal = d3.select(this).data()[0].entValue;
			
			var csrftoken = $('#csrf_token').val();

			var requestJSON = {
				"query": requestVal
			}

			// retrieve information from Wiki
			$.ajax({
		        url: window.SERVER_PATH + 'wiki/wikisummary/',
		        type: "POST",
		        data: JSON.stringify(requestJSON),
		        contentType: "application/json",
		        success: function(data){
		        	var sumtxt = data.sumtxt,
		        		optiontxt = data.option,
		        		empTxt = data.empty;

	        		$("#vis_wiki_title").html(requestVal);

	        		if (sumtxt.length != 0)
	        			$("#vis_wiki_text").html(sumtxt);
	        		else {
	        			if (optiontxt.length != 0) {
	        				var text = "Do you mean: " + optiontxt[0] + ", or "  + optiontxt[1] + "?";
		        			$("#vis_wiki_text").html(text);
	        			}
	        			else {
	        				$("#vis_wiki_text").html(empTxt);
	        			}
	        		}
		        },
		        beforeSend: function(xhr, settings) {
		            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
		                xhr.setRequestHeader("X-CSRFToken", csrftoken);
		            }
		        }
		    });


    		// change color when highlight
    		if (d3.select(this).attr("class") != "entSelected") {
    			d3.select("#" + frameID + "_frame").attr("fill", color.entHighlight);
    			d3.select(this).attr("class", "entSelected");

    			var thisEntID = d3.select(this).attr("id");
    			selectedEnts.push(thisEntID);

				// 1st list
				if (thisListID == 1) {
					if (entData.bicSetsRight != null) {
						for (var i = 0; i < entData.bicSetsRight.length; i++){
							rightRelBicIDs.push(entData.bicSetsRight[i]);
						}

						for (var i = 0; i < rightRelBicIDs.length; i++) {
		    				var rowListIDs = bicList[rightRelBicIDs[i]].row,
		    					colListIDs = bicList[rightRelBicIDs[i]].col,
		    					rowField = bicList[rightRelBicIDs[i]].rowField,
		    					colField = bicList[rightRelBicIDs[i]].colField,
		    					thisBicID = "bic_" + rightRelBicIDs[i];

							d3.select("#" + thisBicID)
								.attr("class", "bicSelected")
								// .style("opacity", 100);
								.style("display", "block");

		    				for (var j = 0; j < rowListIDs.length; j++) {
		    					d3.select("#" + rowField + "_" + rowListIDs[j] + "__" + thisBicID)
									.attr("class", "linkSelected")
									// .style("opacity", 100);
		    						.style("display", "block");
		    				}

		    				for (var k = 0; k < colListIDs.length; k++) {
		    					d3.select("#" + thisBicID + "__" + colField + "_" + colListIDs[k])
		    						.attr("class", "linkSelected")
		    						// .style("opacity", 100);
		    						.style("display", "block");    					
		    				}
						}
					}
				}
				// 2nd list
				else {
					if (entData.bicSetsLeft != null) {
						for (var i = 0; i < entData.bicSetsLeft.length; i++){
							leftRelBicIDs.push(entData.bicSetsLeft[i]);
						}

						for (var i = 0; i < leftRelBicIDs.length; i++) {
		    				var rowListIDs = bicList[leftRelBicIDs[i]].row,
		    					colListIDs = bicList[leftRelBicIDs[i]].col,
		    					rowField = bicList[leftRelBicIDs[i]].rowField,
		    					colField = bicList[leftRelBicIDs[i]].colField,
		    					thisBicID = "bic_" + leftRelBicIDs[i];

							d3.select("#" + thisBicID)
								.attr("class", "bicSelected")
								// .style("opacity", 100);
								.style("display", "block");

		    				for (var j = 0; j < rowListIDs.length; j++) {
		    					d3.select("#" + rowField + "_" + rowListIDs[j] + "__" + thisBicID)
		    						.attr("class", "linkSelected")
		    						// .style("opacity", 100);
		    						.style("display", "block");
		    				}

		    				for (var k = 0; k < colListIDs.length; k++) {
		    					d3.select("#" + thisBicID + "__" + colField + "_" + colListIDs[k])
		    						.attr("class", "linkSelected")
		    						// .style("opacity", 100);
		    						.style("display", "block");    					
		    				}
						}
					}
				}
    		}
    		else {

    		}


    		// var tmpID = d3.select(this).attr("id"),
    		// 	entType = tmpID.split("_")[0],
    		// 	entID = tmpID.split("_")[1],
    		// 	thisEnt = entSet[entID - 1];

    		// ratio between row and column
			// var bicRowPercent = [];
			// for (var i = 0; i < bicList.length; i++) {
			// 	var tmpRatio = bicList[i].entNumInRow / (bicList[i].entNumInRow + bicList[i].entNumInCol);
			// 	bicRowPercent.push(tmpRatio);
			// }

			// get the highlight box id
			// var entBoxID = d3.select(this).attr("id") + "_frame";
			// highlight selected entity
			// if (d3.select("#" + entBoxID).attr("class") != "entHighlight") {
			// 	// visual percentage based on ratio
			// 	var bicRatio = d3.scale.linear()
			// 	    .domain([0, 1])
			// 	    .range([1, bic.frameWidth]);

			// 	if (thisEnt.bicSetsRight.length != 0) {
			// 		// a canvas for a bicluster list
			// 		// var aBicList = canvas.append('g')
			// 		// 	.attr('width', bic.frameWidth)
			// 		// 	.attr('height', entList.height);
                    
			// 		for (var i = 0; i < thisEnt.bicSetsRight.length; i++) {
			// 			if (bicDisplayed.get(thisEnt.bicSetsRight[i]) == 0) {
			// 				// add flag for dispaying the bic
			// 				bicDisplayed.put(thisEnt.bicSetsRight[i], 1);

			// 				// add group to the svg
			// 				var bicFrame = canvas //aBicList
			// 			  		.append("g")
			// 			  		.attr("class", "bics")
			// 			  		.attr("id", function() { return "bic_" + thisEnt.bicSetsRight[i]})
			// 			  		.attr("transform", function() {
			// 			  			var tmpX = startPos + entity.width + ((entList.width + entList.gap) * 2 - entity.width - bic.frameWidth)/2;
			// 			  			bic.count += 1;
			// 			  			return "translate(" + tmpX + "," + bic.count * bic.frameHeight + ")";
			// 			  		});

			// 				// proportion of row
			// 				bicFrame.append("rect")
			// 			  		.attr("id", function() { return "bic_left_" + thisEnt.bicSetsRight[i] })
			// 				    .attr("width", function(d, i) {
			// 				    	return bicRatio(bicRowPercent[i]);
			// 				    })
			// 				    .attr("height", entity.height - 1)
			// 				    .attr("rx", bic.innerRdCorner)
			// 				    .attr("ry", bic.innerRdCorner)
			// 				    .attr("fill", color.entFreColor);

			// 				// 100% proportion
			// 				bicFrame.append("rect")
			// 					.attr("id", function() { return "bic_frame_" + thisEnt.bicSetsRight[i] })
			// 				    .attr("width", bic.frameWidth)
			// 				    .attr("height", entity.height - 1)
			// 				    .attr("rx", bic.frameRdCorner)
			// 				    .attr("ry", bic.frameRdCorner)
			// 				    .attr("fill", color.bicFrameColor);
                           
			// 				var	obj2 = d3.select("#bic_" + thisEnt.bicSetsRight[i]),
			// 					// get the field of another column
			// 					colField = bicList[thisEnt.bicSetsRight[i]].colField,
			// 					rowField = bicList[thisEnt.bicSetsRight[i]].rowField,
			// 					col = bicList[thisEnt.bicSetsRight[i]].col,
			// 					row = bicList[thisEnt.bicSetsRight[i]].row;


			// 				// lines from left to cluster
			// 				for (var k = 0; k < row.length; k++) {
			// 					var obj1 = d3.select("#" + rowField + "_" + row[k]);
			// 					// add a link between left and cluster
			// 					connections.push(addLink(obj1, obj2, color.lineNormalColor, canvas));
			// 					obj2.attr({cursor: "move"});							
			// 					obj2.call(drag);
			// 				}							
			// 				// lines from cluster to right
			// 				for (var j = 0; j < col.length; j++) {
			// 					var obj3 = d3.select("#" + colField + "_" + col[j]);
			// 					// add a link between left and cluster
			// 					connections.push(addLink(obj2, obj3, color.lineNormalColor, canvas));
			// 					obj1.attr({cursor: "move"});
			// 					obj1.call(drag);
			// 				}

			// 			}
			// 			else {
			// 				// get current count and grow by 1
			// 				var tmpCount = bicDisplayed.get(thisEnt.bicSetsRight[i]);
			// 				tmpCount += 1;
			// 				bicDisplayed.put(thisEnt.bicSetsRight[i], tmpCount);							
			// 			}
			// 		}
		 //  		}

			// 	// flag this entity, selected 
			// 	d3.select(this).data()[0].selected = 1;

			// 	// highlight the box of selected entity
			// 	var entBoxID = d3.select(this).attr("id") + "_frame";
			// 	d3.select("#" + entBoxID)				
			// 		.attr("class", "entHighlight")
			// 		.attr("fill", color.entHighlight);						
			// }
			// unhighlight the entity
			// else {

			// 	// highlight the box of selected entity
			// 	var entBoxID = d3.select(this).attr("id") + "_frame";
			// 	d3.select("#" + entBoxID)				
			// 		.classed("entHighlight", false)
			// 		.attr("fill", color.entNormal);

			// 	if (thisEnt.bicSetsRight.length != 0) {
			// 		for (var i = 0; i < thisEnt.bicSetsRight.length; i++){
			// 			// reduce the display count by 1
			// 			var tmpCount = bicDisplayed.get(thisEnt.bicSetsRight[i]);
			// 			tmpCount -= 1;
			// 			bicDisplayed.put(thisEnt.bicSetsRight[i], tmpCount);

			// 			// no other related entities selected
			// 			if (bicDisplayed.get(thisEnt.bicSetsRight[i]) == 0) {
			// 				var targetBicID = "bic_" + thisEnt.bicSetsRight[i];
			// 				for(var j = 0; j < connections.length; j++) {
			// 					if (connections[j].from.attr("id") == targetBicID
			// 						|| connections[j].to.attr("id") == targetBicID) {
			// 						connections[j].line.remove();
			// 						connections[j] = null;
			// 					}
			// 				}
			// 				var counter = connections.length - 1;					
			// 				while(counter >=0 ) {	
			// 					if (connections[counter] == null)
			// 						connections.splice(counter, 1);
			// 					counter--;
			// 				}						
			// 				d3.select("#bic_" + thisEnt.bicSetsRight[i]).remove();
			// 				// reduce the bic count by 1
			// 				bic.count--;				
			// 			}
			// 			// other entities related to this bic has been selected
			// 			else {
			// 				console.log("here");
			// 			}
			// 		}
			// 	}
			// }  		
  		});

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
	    .attr("id", function(d, i) { return type + "_" + d.entityID + "_frame";})
	    .attr("fill", color.entNormal);    	

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


function addBics(preListCanvas, bicListCanvas, listData, bicList, bicStartPos, row, col) {    		
	// ratio between row and column
	var bicRowPercent = [];
	for (key in bicList) {
		var entNumInRow = bicList[key].row.length,
			entNumInCol = bicList[key].col.length,
			tmpRatio = entNumInRow / (entNumInRow + entNumInCol);
		// ratio of each bic
		bicRowPercent.push(tmpRatio);
		if (bicList[key].rowField == row && bicList[key].colField == col)
			// get all biclusters
			biclusters.push(bicList[key]);
	}

	// visual percentage based on ratio
	var bicRatio = d3.scale.linear()
	    .domain([0, 1])
	    .range([1, bic.frameWidth]);	

    // add all bics
	var bics = bicListCanvas.selectAll(".bics")
		.data(biclusters)
		.enter().append("g")
		.attr("id", function(d, i) { return "bic_" + d.bicID; })
		.attr("class", "bics")
  		.attr("transform", function(d, i) {
  			return "translate(" + 0 + "," + (i + 1) * bic.frameHeight + ")"; 
  		});

  		// .style("display", "none");

	// proportion of row
	bics.append("rect")
  		.attr("id", function(d, i) { return "bic_left_" + d.bicID; })
	    .attr("width", function(d, i) { return bicRatio(bicRowPercent[i]); })
	    .attr("height", entity.height - 1)
	    .attr("rx", bic.innerRdCorner)
	    .attr("ry", bic.innerRdCorner)
	    .attr("fill", color.entFreColor);

	// 100% proportion
	bics.append("rect")
		.attr("id", function(d, i) { return "bic_frame_" + d.bicID; })
	    .attr("width", bic.frameWidth)
	    .attr("height", entity.height - 1)
	    .attr("rx", bic.frameRdCorner)
	    .attr("ry", bic.frameRdCorner)
	    .attr("fill", color.bicFrameColor);	      			

    for (var i = 0; i < biclusters.length; i++) {
    	// console.log(biclusters[i]);
    	var rowType = biclusters[i].rowField,
    		colType = biclusters[i].colField,
    		rowIDs = biclusters[i].row,
    		colIDs = biclusters[i].col,
    		bicID = biclusters[i].bicID;

		for (var j = 0; j < rowIDs.length; j++) {
			var obj1 = d3.select("#" + rowType + "_" + rowIDs[j]);
				obj2 = d3.select("#bic_" + bicID);

			// append lines to previous list g
			connections.push(addLink(obj1, obj2, color.lineNormalColor, canvas));
			// obj2.attr({cursor: "move"});
			obj2.call(drag);
		}

		for (var k = 0; k < colIDs.length; k++) {
			var obj1 = d3.select("#bic_" + bicID),
				obj2 = d3.select("#" + colType + "_" + colIDs[k]);

			// append lines to previous list g
			connections.push(addLink(obj1, obj2, color.lineNormalColor, canvas));
			// obj2.attr({cursor: "move"});
			obj1.call(drag);
		}
    }

    // hide bics for mouse over
    // we should hide bics after adding the line, 
    // since the pos of line is determined by that of bics
    d3.selectAll(".bics")
    	// .style("opacity", 0);
		.style("display", "none");
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

    // var bb1 = obj1[0][0].getBoundingClientRect(),
    //     bb2 = obj2[0][0].getBoundingClientRect(),

    //     p = [{x: bb1.left + bb1.width / 2 - svgPos.left, y: bb1.top - 1 - svgPos.top},
    //     {x: bb1.left + bb1.width / 2 - svgPos.left, y: bb1.top + bb1.height + 1 - svgPos.top},
    //     {x: bb1.left - 1 - svgPos.left, y: bb1.top + bb1.height / 2 - svgPos.top},
    //     {x: bb1.left + bb1.width + 1 - svgPos.left, y: bb1.top + bb1.height / 2 - svgPos.top},
    //     {x: bb2.left + bb2.width / 2 - svgPos.left, y: bb2.top - 1 - svgPos.top},
    //     {x: bb2.left + bb2.width / 2 - svgPos.left, y: bb2.top + bb2.height + 1 - svgPos.top},
    //     {x: bb2.left - 1 - svgPos.left, y: bb2.top + bb2.height / 2 - svgPos.top},
    //     {x: bb2.left + bb2.width + 1 - svgPos.left, y: bb2.top + bb2.height / 2 - svgPos.top}],
	var bb1 = getOffset(obj1), //[0][0].getBoundingClientRect(),
        bb2 = getOffset(obj2), //[0][0].getBoundingClientRect(),

        p = [{x: bb1.left + bb1.width / 2, y: bb1.top - 1},
        {x: bb1.left + bb1.width / 2, y: bb1.top + bb1.height + 1},
        {x: bb1.left - 1, y: bb1.top + bb1.height / 2},
        {x: bb1.left + bb1.width + 1, y: bb1.top + bb1.height / 2},
        {x: bb2.left + bb2.width / 2, y: bb2.top - 1},
        {x: bb2.left + bb2.width / 2, y: bb2.top + bb2.height + 1},
        {x: bb2.left - 1 , y: bb2.top + bb2.height / 2},
        {x: bb2.left + bb2.width + 1, y: bb2.top + bb2.height / 2}],    
        d = {}, dis = [];

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
        // var color = typeof line == "string" ? line : "#000";
        return {      
            //bg: bg && bg.split && robj.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            // default to be hide
            line: d3obj.append("path")
            		.attr("d", path)
            		.attr("id", function() { return obj1.attr("id") + "__" + obj2.attr("id")})
            		.style({stroke: color.lineNormalColor, fill: "none", display:"none" }), // opacity: 0
            from: obj1,
            to: obj2,
            d3Canvas: d3obj            
        };
    }
};


/*
*
*/
function datasetRequest() {
    var csrftoken = $('#csrf_token').val();

    var requestJSON = {

    }    

    $.ajax({
        url: window.SERVER_PATH + 'vis/loadbisets/',
        type: "POST",
        data: JSON.stringify(requestJSON),
        contentType: "application/json",
        success: function(data){
        	// console.log(data);
        	// var dataJson = eval(data);
        	// console.log(dataJson);
            // if(data['status'] == 'success') {

                // refreshColList('#list_collaborator', data['collaborators']);
            // }
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });    
}

// these HTTP methods do not require CSRF protection
function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


// $(document).ready(function() {
// 	datasetRequest();
// });

// $(".location").tooltip({
//     'container': 'body',
//     'placement': 'bottom'
// });