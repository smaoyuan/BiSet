// control for doc view (hide the view)
$("#doc_ctrl_icon").click(function(e){
	// cancel default browser event
	// e.preventDefault();
	if ($("#doc_vis").is(":hidden") == true) {
		$("#doc_vis").slideToggle("slow");
		// change the control icon
		$("#doc_ctrl_icon").removeClass('glyphicon-folder-close');
		$("#doc_ctrl_icon").addClass('glyphicon-remove-sign');
	}
	else {
		$("#doc_vis").slideToggle("hide");
		// change the control icon
		$("#doc_ctrl_icon").removeClass('glyphicon-remove-sign');
		$("#doc_ctrl_icon").addClass('glyphicon-folder-close');	
	}
});


$('#btn_new_vis').click(function(){
	$("#vis_name_config").removeClass('hide_this');	
	// $("#vis_dim_select").removeClass('hide_this');	
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

	// hide the visualization control buttons
	if (!$("#vis_ctrl").hasClass('hide_this'))
		$("#vis_ctrl").addClass('hide_this');

	// show the vis config buttons
	if ($("#vis_config_ctrl").hasClass('hide_this'))
		$("#vis_config_ctrl").removeClass('hide_this');

	if (biset.visCanvas.inUse == 1)
		// clear current canvas
		biset.removeVis(canvas);
});


// save visualization config
$("#btn_save_config").click(function(){
	var projectID = $("#vis_sel_project").selectpicker('val'),
		visName = $("#vis_name").val();
    if(visName.trim() == ""){
        alert("Please enter the name for the new visualization.");
        return;
    }
	var requestJSON = {
		"project_id": projectID,
		"vis_name": visName	
	}

	var selDims = $("input:checkbox:checked");

	console.log(selDims.length);

	if (selDims.length < 2){
	// if (selDims.length > 2 || selDims.length == 1 || selDims.length == 0){
		alert("Please select at least two dimensions.");
        return;
    }
	else {
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
	}
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


// delete confirmation dialog window
$("#btn_vis_del").click(function(){
	$('#vis_delete_alert').modal('toggle');
});
// delete current visualization
$('#btn_vis_delete').click(function() {
	var projectID = $("#vis_sel_project").selectpicker('val'),
		curVisID = $("#vis_list").selectpicker('val');

	var requestJSON = {
		"project_id": projectID,
		"vis_id": curVisID
	}

	visCtrlRequest(requestJSON, "deleteVis");
	
	// reload the page after deletion
	location.reload();
})


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

	// enable the new vis button
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

		console.log(visID);

		// remove the name of current vis in the list
		$('#vis_list').find('[value='+ visID +']').remove();
		$('#vis_list').selectpicker('val', "");
		$('#vis_list').selectpicker('refresh');
		// delete visualizations and sorting control
		biset.removeVis(canvas);

		// empty all global parameters
		biset.globalParamClear();
	}
}


/*
* helper function to load vis by id
* @param resData, server response data for vis list
* @param visID, id of current vis to delete
*/
function loadVisHelper(resData) {

	// delete visualizations
	biset.removeVis(canvas);

	// clear global paramters
	biset.globalParamClear();

	if (!$("#vis_config_ctrl").hasClass("hide_this"))
		$("#vis_config_ctrl").addClass('hide_this');		

	// show visualization control buttons	
	if ($("#vis_ctrl").hasClass("hide_this"))
		$("#vis_ctrl").removeClass('hide_this');

	// load visualizations
	var listData = resData.lists,
		bicList = resData.bics,
		linkList = resData.links,
		entHighlightData = resData.highlight_ent,
		networkData = resData.relNetwork,
		oriLinks = resData.oriRelationsReduced,
		docs = resData.docs;

	console.log(resData);

	// get the total number of bics
	var bicNum = 0;
	for (key in bicList) {
		bicNum += 1;
		// set all bics has not been displayed
		bicDisplayed[key] = 0;
		// intialize all bics
		allBics[bicList[key].bicIDCmp] = bicList[key];
	}

	// initialize all links
	for (lk in linkList)
		allLinks[lk] = linkList[lk];

	// initialize all original links
	for (var i = 0; i < oriLinks.length; i++)
		allOriLinks[oriLinks[i].oriLinkID] = oriLinks[i];


	// add the container for the list of doc names
	$("#biset_doc_list").append("<form role='form'>" + 
		"<div class='input-group'>" + 
			"<span class='input-group-addon'>Name:</span>" + 
			"<input class='form-control' id='doc_name_search' type='search' placeholder='Search...'' />" +
		"</div>" + 
		"<div id='doc_name_list' class='list-group' style='overflow-y: auto; max-height: 300px; margin-top:15px'>" +
		"</div>" +
	"</form>");

	// initialize all docs
	for (e in docs) {
		allDocs[docs[e].docName] = docs[e];

		// append document names
		$("#doc_name_list").append("<a href='#' class='list-group-item' style='margin-left: 0; padding-left:15px'>" +
			docs[e].docName + 
		"</a>");
	}


    $('#doc_name_search').keyup(function () {

    	console.log("here");

        var rex = new RegExp($(this).val(), 'i');
        $('.list-group-item').hide();
        $('.list-group-item').filter(function () {
            return rex.test($(this).text());
        }).show();

    });


	// get selected dimensions
	var selDims = [];
	for (key in listData) { selDims.push(listData[key].listType); }

	// initialize the number of list
	selectedLists = selDims;

	// uncheck all
	$(':checkbox').prop("checked", false);

	// add all lists
	for (var i = 0; i < selDims.length; i++) {

		var lkey = selDims[i];

		// check the selected domain
		$('#d_' + lkey).prop("checked", true);

		biset.entList.count += 1;
		biset.entList.startPos = (biset.entList.width + biset.entList.gap * 4 + biset.bic.frameWidth) * i;

		var aList = canvas.append('g')
			.attr('id', 'list_' + biset.entList.count)
			.attr('width', biset.entList.width)
			.attr('height', biset.entList.height)
			.attr("transform", function(d, i) { return "translate(" + biset.entList.startPos + "," + 0 + ")"; });
		entLists.push(aList);

		var aListData = getListDataByKey(listData, lkey);

		// console.log(selDims);

		// add a list to the vis canvas
		var aListView = biset.addList(aList, aListData, bicList, biset.entList.startPos, networkData);
				
		// flag the canvas has been used
		biset.visCanvas.inUse = 1;
		addSortCtrl(aListView);
	}

	// add control fro bic list
	biset.addBicListCtrl(selDims);

	// add all bics with lines
	for (var i = 0; i < selDims.length - 1; i++) {
		var bicStartPos = biset.entList.width * (i + 1) + biset.entList.gap * 2 * (2 * i + 1) + biset.bic.frameWidth * i,
			bicListID = i + 1;
	
		var aBicList = canvas.append('g')
			.attr('id', 'bic_list_' + bicListID)
			.attr('width', biset.bicList.width)
			.attr('height', biset.bicList.height)
			.attr("transform", function(d, i) { return "translate(" + bicStartPos + "," + 0 + ")"; });

		var rowField = selDims[i],
			colField = selDims[i + 1];

		// the bicluster list
		var theList = [];
		for (key in bicList) {
			if (bicList[key].rowField == selDims[i] && bicList[key].colField == selDims[i + 1])
				theList.push(bicList[key]);
		}

		biset.addBics(entLists[i], aBicList, aListData, theList, bicStartPos, rowField, colField, networkData);
	}

	// add all original links
	biset.addOriginalLinks(oriLinks);
	// hide all original links
	for (var i = 0; i < oriLinks.length; i++)
		biset.setVisibility(oriLinks[i].oriLinkID, "hidden");


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
			d3.select("#" + frameID + "_frame").attr("fill", biset.colors.entHighlight);
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

// add tooltip for product name
$('#vis_name').tooltip({
    html: "true",
    trigger: "focus",
    title: "<span id='vis_name_msg' class='glyphicon glyphicon-remove' style=color:#FF0004;'></span> No empty name",
	animation: false,
	placement: "bottom"
});

// show instance message
instantMsg('#vis_name', '#vis_name_msg');

/*
* Show wrong icon when validating fails
* @param msgID, the tooltip id 
*/
function valWrong(msgID) {
    $(msgID).removeClass("glyphicon-ok");
    $(msgID).addClass("glyphicon-remove");
    $(msgID).css("color","#FF0004");
}

/*
* Show success icon when validating fails
* @param msgID, the tooltip id 
*/
function valCorrect(msgID) {
    $(msgID).removeClass("glyphicon-remove");
    $(msgID).addClass("glyphicon-ok");
    $(msgID).css("color","#00A41E");

    // hide the alert
    if (!$('#alert_msg').hasClass('hide_div'))
    	$('#alert_msg').addClass('hide_div');
}

/*
* Show instance message for text input box
* @param inputTextID, the text input box id
* @param msgID, the tooltiop id 
*/
function instantMsg(inputTextID, msgID) {
	$(inputTextID).on('shown.bs.tooltip', function(){
		// check when the input value changes
		$(inputTextID).keyup(function(){
			if ($(inputTextID).val().length > 0)
				valCorrect(msgID);
			else
				valWrong(msgID);		
		});
		// check when user clicking the input box
		$(inputTextID).click(function(){
			if ($(inputTextID).val().length > 0)
				valCorrect(msgID);
			else
				valWrong(msgID);		
		});
	});	
}
