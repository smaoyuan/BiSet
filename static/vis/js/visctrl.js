$('#btn_new_vis').click(function(){
	$("#vis_name_config").removeClass('hide_this');	
	$("#vis_dim_select").removeClass('hide_this');	
	// enable save button
	$("#btn_save_config").prop('disabled',false);
});


// add draggable for wiki with jQuery UI
$(function() {
	$( "#vis_wiki_summary" ).draggable();
});


// get project id and update vis list
$("#vis_sel_project").change(function(){
	var projectID = $(this).selectpicker('val'),
		requestJSON = { "project_id": projectID }
	// load vis list
	visCtrlRequest(requestJSON, "loadVisList");

	console.log($("#vis_ctrl").hasClass('hide_this'));

	// hide the visualization control buttons
	if (!$("#vis_ctrl").hasClass('hide_this'))
		$("#vis_ctrl").addClass('hide_this');

	// show the vis config buttons
	if ($("#vis_config_ctrl").hasClass('hide_this'))
		$("#vis_config_ctrl").removeClass('hide_this');

	// clear current canvas
	removeVis(canvas);	
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

	// hide the vis name config
	$("#vis_name_config").addClass('hide_this');
	// show visualization control
	$("#vis_ctrl").removeClass('hide_this');

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
		requestJSON = rJson
		rURL = "";

	if (rType == "wikisummary")
		rURL = window.SERVER_PATH + "wiki/wikisummary/"
	else
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
        		case "wikisummary": {
        			var rTerm = requestJSON.requestVal;
        			console.log(rTerm);
        			wikiSumHelper(repData, rTerm); 
        			break;
        		}
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
		// delete visualizations and sorting control
		removeVis(canvas);

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

	// delete visualizations
	removeVis(canvas);

	// clear global paramters
	glbParamClear();

	if (!$("#vis_config_ctrl").hasClass("hide_this"))
		$("#vis_config_ctrl").addClass('hide_this');		

	// show visualization control buttons	
	if ($("#vis_ctrl").hasClass("hide_this"))
		$("#vis_ctrl").removeClass('hide_this');

	// if ($("#vis_dim_select").hasClass("hide_this"))
	// 	$("#vis_dim_select").removeClass('hide_this');

	// load visualizations
	var listData = resData.lists,
		bicList = resData.bics,
		entHighlightData = resData.highlight_ent;

	// get the total number of bics
	var bicNum = 0;
	for (key in bicList) {
		bicNum += 1;
		// set all bics has not been displayed
		bicDisplayed[key] = 0;
	}

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

	// load highlight entities
	// this code block will not run, 
	// if there is no highlight entities
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
	    					bicIDVal = rightRelBicIDs[i],
	    					thisBicID = "bic_" + rightRelBicIDs[i];

						d3.select("#" + thisBicID)
							.attr("class", "bicSelected")
							// .style("opacity", 100);
							.style("display", "block");

						// record the bic has been clicked
						bicDisplayed[bicIDVal] += 1;

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
	    					bicIDVal = leftRelBicIDs[i],
	    					thisBicID = "bic_" + leftRelBicIDs[i];		    					

						d3.select("#" + thisBicID)
							.attr("class", "bicSelected")
							// .style("opacity", 100);
							.style("display", "block");

						// record the bic has been clicked
						bicDisplayed[bicIDVal] += 1;

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

/*
* helper function to get info from wiki
* @param resData, server response data for vis list
* @param term, requsted term for wiki
*/
function wikiSumHelper(resData, term) {
	var sumtxt = resData.sumtxt,
		optiontxt = resData.option,
		empTxt = resData.empty;

	console.log(term);

	// set the title
	$("#vis_wiki_title").html(term);

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
}