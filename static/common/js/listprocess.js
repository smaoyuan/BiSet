/*
* this file contains functions for project list management,
* and it is used by plist.php
*/

// show popup for confirming deletion
$('.p_delete_icon').click(function(){
	// find project id
	var project_id = $(this).val();
	// add this id to the hidden label
	$('#p_hidden_id').html(project_id);
	// show confirm deletion popup
	$('#delete_alert').modal('toggle');
});

// delete a project
$('.plist_delete_btn').click(function(){
	// find project id
	var project_id = $('#p_hidden_id').html();
	// request to delete the proejct
	window.location = window.SERVER_PATH + "projects/delete/" + project_id;
});

// update a project
$('.plist_update').click(function(event) {
	// find project id
	var project_id = $(this).val();
	// requrest to update the project
	window.location = window.SERVER_PATH + "projects/edit/" + project_id;
});

$('#plist_create_new_project').click(function(){
    window.location = window.SERVER_PATH + "projects/add/";
});