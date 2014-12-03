$('#btn_new_vis').click(function(){
	$("#vis_dim_select").removeClass('hide_this');
	// $("#vis_wiki_summary").removeClass('hide_this');
	// $( "#vis_wiki_summary" ).draggable();
});

$(function() {
	$( "#vis_wiki_summary" ).draggable();
});

// get project id
$("#vis_sel_project").change(function(){
	var projectID = $(this).selectpicker('val');
	var requestJSON = {
		"project_id": projectID
	}

	var csrftoken = $('#csrf_token').val();

	$.ajax({
        url: window.SERVER_PATH + 'vis/loadVisList/',
        type: "POST",
        data: JSON.stringify(requestJSON),
        contentType: "application/json",
        success: function(data){
        	var visList = JSON.parse(data);

        	$("#vis_list").children().remove();
        	$("#vis_list").prop('disabled',false);
        	for (var i = 0; i < visList.length; i++){
        		$('#vis_list').prepend("<option value='" + visList[i].id + "'>" + visList[i].vis_name + "</option>");
        	}
        	$("#vis_list").prepend("<option value=''></option>");        	        	
        	$('#vis_list').selectpicker('refresh');

        	$("#btn_new_vis").prop('disabled',false);
        	$("#btn_save_config").prop('disabled',false);
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });	
});

// save visualization config
$("#btn_save_config").click(function(){
	var projectID = $("#vis_sel_project").selectpicker('val'),
		visName = $("#vis_name").val();

	console.log(visName);
	// return;

	var selDims = $("input:checkbox:checked");
	var requestJSON = {
		"project_id": projectID,
		"vis_name": visName	
	}

	// add all lists
	for (var i = 0; i < selDims.length; i++) {
		var lkey = $(selDims[i]).val();
		requestJSON[lkey] = 1;
	}

	var csrftoken = $('#csrf_token').val();

	$.ajax({
        url: window.SERVER_PATH + 'vis/addVis/',
        type: "POST",
        data: JSON.stringify(requestJSON),
        contentType: "application/json",
        success: function(data){

        	var jsonData = JSON.parse(data),
        		visID = jsonData.vis.id,
        		visName = jsonData.vis.vis_name;

    		console.log(jsonData);

        	// console.log(jsonData);

        	$("#vis_list").append("<option value='" + visID + "'>" + visName + "</option>");
        	$("#vis_list").selectpicker('val', visID);
        	$("#vis_list").selectpicker('refresh');

			// // load visualizations
			// var listData = jsonData.lists,
			// 	bicData = jsonData.bics;

			// // set all bics has not been displayed
			// for (var i = 0; i < bicData.length; i++)
			// 	bicDisplayed.put(bicData[i].bicID, 0);

			// // get selected dimensions
			// var selDims = $("input:checkbox:checked");
			
			// // add all lists
			// for (var i = 0; i < selDims.length; i++) {

			// 	var lkey = $(selDims[i]).val();

			// 	entList.count += 1;
			// 	entList.startPos += (entList.width + entList.gap) * 2 * i;

			// 	var aList = canvas.append('g')
			// 		.attr('id', 'list_' + entList.count)
			// 		.attr('width', entList.width)
			// 		.attr('height', entList.height)
			// 		.attr("transform", function(d, i) { return "translate(" + entList.startPos + "," + 0 + ")"; });
			// 	entLists.push(aList);

			// 	var aListData = listData[lkey];		

			// 	// add a list to the vis canvas
			// 	var aListView = addList(aList, aListData, bicData, entList.startPos);
			// 	addSortCtrl(aListView);		 
			// }

			// // add all bics with lines
			// for (var i = 0; i < selDims.length; i++) {
			// 	if (i % 2 == 0) {
			// 		var bicStartPos = (entList.width + entList.gap) * 2 * (i / 2 + 1) - ((entList.width + entList.gap) * 2 * (i / 2 + 1) - entList.width - bic.frameWidth) / 2 - bic.frameWidth;

			// 		var aBicList = canvas.append('g')
			// 			.attr('id', 'bic_list_' + entList.count)
			// 			.attr('width', bicList.width)
			// 			.attr('height', bicList.height)
			// 			.attr("transform", function(d, i) { return "translate(" + bicStartPos + "," + 0 + ")"; });;

			// 		var rowField = $(selDims[i]).val(),
			// 			colField = $(selDims[i + 1]).val();
			// 		addBics(entLists[i], aBicList, aListData, bicData, bicStartPos, rowField, colField);				
			// 	}
			// }

        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});

// save current visualization
$("#btn_vis_save").click(function() {
	var projectID = $("#vis_sel_project").selectpicker('val'),
		curVisID = $("#vis_list").selectpicker('val');

	var requestJSON = {
		"project_id": projectID,
		"vis_id": curVisID,
		"highlight_ent": selectedEnts
	}

	var csrftoken = $('#csrf_token').val();

	$.ajax({
        url: window.SERVER_PATH + 'vis/saveVis/',
        type: "POST",
        data: JSON.stringify(requestJSON),
        contentType: "application/json",
        success: function(data){
        	var jsonData = JSON.parse(data);
        	if (jsonData.status == "success")
        		alert("Visualization has been successfully saved!");
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });	
});

// delete current visualization
$("#btn_vis_del").click(function(){
	var projectID = $("#vis_sel_project").selectpicker('val'),
		curVisID = $("#vis_list").selectpicker('val');

	var requestJSON = {
		"project_id": projectID,
		"vis_id": curVisID
	}

	var csrftoken = $('#csrf_token').val();

	$.ajax({
        url: window.SERVER_PATH + 'vis/deleteVis/',
        type: "POST",
        data: JSON.stringify(requestJSON),
        contentType: "application/json",
        success: function(data){
        	var jsonData = JSON.parse(data);

        	if (jsonData.status == "success") {
        		$('#vis_list').find('[value='+ curVisID +']').remove();
        		$('#vis_list').selectpicker('val', "");
        		$('#vis_list').selectpicker('refresh');

        		$('.listControlGroup').remove();

        		// delete visualizations
        		canvas.selectAll("*").remove();

	    		connections = [];
				biclusters = [];
				entLists = [];
				selectedEnts = [];
				entList.count = 0;
				entList.startPos = 0;				
				bic.count = 0;  				
        	}
        	// 	alert("Visualization has been successfully saved!");
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});

// load saved visualization
$("#vis_list").change(function(){

	if ($("#vis_list").selectpicker('val') == "")
		return;

	var projectID = $("#vis_sel_project").selectpicker('val'),
		curVisID = $("#vis_list").selectpicker('val');

	var requestJSON = {
		"project_id": projectID,
		"vis_id": curVisID
	}

	var csrftoken = $('#csrf_token').val();

	$.ajax({
        url: window.SERVER_PATH + 'vis/loadVis/',
        type: "POST",
        data: JSON.stringify(requestJSON),
        contentType: "application/json",
        success: function(data){
        	var jsonData = JSON.parse(data);

    		console.log(jsonData);

    		$('.listControlGroup').remove();
    		// delete visualizations
    		canvas.selectAll("*").remove();

    		connections = [];
			biclusters = [];
			entLists = [];
			selectedEnts = [];
			entList.count = 0;
			entList.startPos = 0;
			bic.count = 0;      	

        	// if (jsonData.status == "success") {

			// load visualizations
			var listData = jsonData.lists,
				bicList = jsonData.bics,
				entHighlightData = jsonData.highlight_ent;

			// set all bics has not been displayed
			for (var i = 0; i < bicList.length; i++)
				bicDisplayed.put(bicList[i].bicID, 0);

			// get selected dimensions
			var selDims = [];
			for (key in listData) { selDims.push(listData[key].listType); }

			// add all lists
			for (var i = 0; i < selDims.length; i++) {

				var lkey = selDims[i];

				entList.count += 1;
				entList.startPos += (entList.width + entList.gap) * 2 * i;

				var aList = canvas.append('g')
					.attr('id', 'list_' + entList.count)
					.attr('width', entList.width)
					.attr('height', entList.height)
					.attr("transform", function(d, i) { return "translate(" + entList.startPos + "," + 0 + ")"; });
				entLists.push(aList);

				var aListData = getListDataByKey(listData, lkey);

				// for (key in listData) {
				// 	if (listData[key].listType == lkey)
				// 		aListData = listData[key];
				// }	

				// add a list to the vis canvas
				var aListView = addList(aList, aListData, bicList, entList.startPos);
				addSortCtrl(aListView); 
			}

			// add all bics with lines
			for (var i = 0; i < selDims.length; i++) {
				if (i % 2 == 0) {
					var bicStartPos = (entList.width + entList.gap) * 2 * (i / 2 + 1) - ((entList.width + entList.gap) * 2 * (i / 2 + 1) - entList.width - bic.frameWidth) / 2 - bic.frameWidth;

					var aBicList = canvas.append('g')
						.attr('id', 'bic_list_' + entList.count)
						.attr('width', bicList.width)
						.attr('height', bicList.height)
						.attr("transform", function(d, i) { return "translate(" + bicStartPos + "," + 0 + ")"; });;

					var rowField = selDims[i],
						colField = selDims[i + 1];
					addBics(entLists[i], aBicList, aListData, bicList, bicStartPos, rowField, colField);				
				}
			}

			for (key in entHighlightData){
				var frameID = key //d3.select(this).attr("id"),
    			thisEntType = frameID.split("_")[0],
    			thisListID = getListDataByKey(listData, thisEntType).listID; // listData[thisEntType].listID;

	    		var entData = d3.select("#" + key).data()[0],
	    			// d3.select(this).data()[0],
	    			// all associated bic ids
	    			leftRelBicIDs = [],
	    			rightRelBicIDs = [];

				var requestVal = d3.select("#" + key).data()[0].entValue;
				// d3.select(this).data()[0].entValue;
				
				var csrftoken = $('#csrf_token').val();

				var requestJSON = { "query": requestVal }

	    		// change color when highlight
	    		if (d3.select("#" + key).attr("class") != "entSelected") { //d3.select(this)
	    			d3.select("#" + frameID + "_frame").attr("fill", color.entHighlight);
	    			d3.select("#" + key).attr("class", "entSelected");

	    			var thisEntID = d3.select("#" + key).attr("id");
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

		    					console.log(thisBicID);			    					

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
			}

        	// }
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});


function getListDataByKey(ldata, searchKey) {
	for (el in ldata) {
		if (ldata[el].listType == searchKey)
			return ldata[el];
	}
	return null;
}