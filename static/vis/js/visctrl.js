$('#btn_new_vis').click(function(){
	$("#vis_dim_select").removeClass('hide_this');
});

$(function() {
	$( "#vis_wiki_summary" ).draggable();
});


// get project id and update vis list
$("#vis_sel_project").change(function(){
	var projectID = $(this).selectpicker('val'),
		requestJSON = { "project_id": projectID }

	visCtrlRequest(requestJSON, "loadVisList");	
});


// save visualization config
$("#btn_save_config").click(function(){
	var projectID = $("#vis_sel_project").selectpicker('val'),
		visName = $("#vis_name").val();

	var requestJSON = {
		"project_id": projectID,
		"vis_name": visName	
	}

	var selDims = $("input:checkbox:checked");
	// add all lists
	for (var i = 0; i < selDims.length; i++) {
		var lkey = $(selDims[i]).val();
		requestJSON[lkey] = 1;
	}

	visCtrlRequest(requestJSON, "addVis");
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

	visCtrlRequest(requestJSON, "saveVis");	
});


// delete current visualization
$("#btn_vis_del").click(function(){
	var projectID = $("#vis_sel_project").selectpicker('val'),
		curVisID = $("#vis_list").selectpicker('val');

	var requestJSON = {
		"project_id": projectID,
		"vis_id": curVisID
	}

	visCtrlRequest(requestJSON, "deleteVis");
});


// load visualization
$("#vis_list").change(function(){

	if ($("#vis_list").selectpicker('val') == "")
		return;

	var projectID = $("#vis_sel_project").selectpicker('val'),
		curVisID = $("#vis_list").selectpicker('val');

	var requestJSON = {
		"project_id": projectID,
		"vis_id": curVisID
	}

	visCtrlRequest(requestJSON, "loadVis");
});


/*
* find the data of a list with the specified type
* @param ldata, data of all lists
* @param searchKey, a specific type of list
*/
function getListDataByKey(ldata, searchKey) {
	for (el in ldata) {
		if (ldata[el].listType == searchKey)
			return ldata[el];
	}
	return null;
}

// these HTTP methods do not require CSRF protection
function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

/*
* vis control related request handler
* @param rJson, request data in the format of json
* @param rType, request type
*/
function visCtrlRequest(rJson, rType) {
    var csrftoken = $('#csrf_token').val(),
		requestJSON = rJson,
		rURL = window.SERVER_PATH + 'vis/' + rType + "/"; 

    $.ajax({
        url: rURL,
        type: "POST",
        data: JSON.stringify(requestJSON),
        contentType: "application/json",
        success: function(data){
        	var repData = JSON.parse(data);
        	switch(rType) {
        		case "loadVisList": loadVisListHelper(repData); break;
        		case "addVis": saveVisConfigHelper(repData); break;
        		case "saveVis": saveVisHelper(repData); break;
        		case "deleteVis": {
        			var visIDtoDel = requestJSON.vis_id;
        			deleteVisHelper(repData, visIDtoDel); 
        			break;
        		}
        		case "loadVis": loadVisHelper(repData); break;
        	}
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });    
}


/*
* update the list of visualization names
* @param resData, server response data for vis list
*/
function loadVisListHelper(resData) {
	$("#vis_list").children().remove();
	$("#vis_list").prop('disabled',false);
	for (var i = 0; i < resData.length; i++){
		$('#vis_list').prepend("<option value='" + resData[i].id + "'>" + resData[i].vis_name + "</option>");
	}
	$("#vis_list").prepend("<option value=''></option>");
	$('#vis_list').selectpicker('refresh');

	$("#btn_new_vis").prop('disabled',false);
	$("#btn_save_config").prop('disabled',false);
}

/*
* helper function to save vis config
* @param resData, server response data for vis list
*/
function saveVisConfigHelper(resData) {
	var visID = resData.vis.id,
	visName = resData.vis.vis_name;

	$("#vis_list").append("<option value='" + visID + "'>" + visName + "</option>");
	$("#vis_list").selectpicker('val', visID);
	$("#vis_list").selectpicker('refresh');
}

/*
* helper function to save current vis
* @param resData, server response data for vis list
*/
function saveVisHelper(resData) {
	if (resData.status == "success")
		alert("Visualization has been successfully saved!");
}

/*
* helper function to delete current vis
* @param resData, server response data for vis list
* @param visID, id of current vis to delete
*/
function deleteVisHelper(resData, visID) {
	if (resData.status == "success") {
		// remove the name of current vis in the list
		$('#vis_list').find('[value='+ visID +']').remove();
		$('#vis_list').selectpicker('val', "");
		$('#vis_list').selectpicker('refresh');
		// remove sort control
		$('.listControlGroup').remove();
		// delete visualizations
		canvas.selectAll("*").remove();

		// empty all global parameters
		glbParamClear();
	}
}

/*
* helper function to load vis by id
* @param resData, server response data for vis list
* @param visID, id of current vis to delete
*/
function loadVisHelper(resData) {

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
	var listData = resData.lists,
		bicList = resData.bics,
		entHighlightData = resData.highlight_ent;

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
		var frameID = key,
			thisEntType = frameID.split("_")[0],
			thisListID = getListDataByKey(listData, thisEntType).listID;

		var entData = d3.select("#" + key).data()[0],
			// all associated bic ids
			leftRelBicIDs = [],
			rightRelBicIDs = [];

		var requestVal = d3.select("#" + key).data()[0].entValue;

		// change color when highlight
		if (d3.select("#" + key).attr("class") != "entSelected") {
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
	}
}
