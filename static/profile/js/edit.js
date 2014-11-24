function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// add tooltip for first name
$('#edit_first_name').tooltip({
    html: "true",
    trigger: "focus",
    title: "<span id='first_name_msg' class='glyphicon glyphicon-remove' style=color:#FF0004;'></span> No empty first name",
	animation: false,
	placement: "bottom"
});
// show instance message
instMsgForText('#edit_first_name', '#first_name_msg');


// add tooltip for last name
$('#edit_last_name').tooltip({
    html: "true",
    trigger: "focus",
    title: "<span id='last_name_msg' class='glyphicon glyphicon-remove' style=color:#FF0004;'></span> No empty last name",
	animation: false,
	placement: "bottom"
});
// show instance message
instMsgForText('#edit_last_name', '#last_name_msg');

$('#btn_profile_save').click(function(){
    $.ajaxSetup({async:false}); 
    var userName = $('#username').html().toString(),
        uid = $('#userid').html().toString(),
        firstName = $('#edit_first_name').val();
        lastName = $('#edit_last_name').val();
        email = $('#edit_email').val();
        career = $('#id_career').val();
        theLocation = $('#edit_location').val();
        
    var jsonData = {
        'user_id':uid,
        'user_name':userName,
        'first_name':firstName,
        'last_name':lastName,
        'email':email,
        'career':career,
        'location':theLocation}
    
        
    var csrftoken = $('#csrf_token').val();
    
    
    $.ajax({
        url: window.SERVER_PATH + 'profile/edit/',
        type: "POST",
        data: JSON.stringify(jsonData),
        contentType: "application/json",
        success: function(data){                
            if(data['status'] == 'success') {
                window.location.href = window.SERVER_PATH + "profile/" + uid + "/";
            }
            
            
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});

$('#btn_change_pass').click(function(){
    window.location.href = window.SERVER_PATH + "profile/change_password/";
});

$('#btn_profile_edit').click(function(){
	// set first name
	$('#edit_first_name').val($('#profile_first_name').html());
	// set last name
	$('#edit_last_name').val($('#profile_last_name').html());
	// set email
	$('#edit_email').val($('#profile_email').html());
	// set location
	$('#edit_location').val($('#profile_location').html());
    // set career
    $('#edit_career').val($('#profile_career').html());
    
	$('.hide_this').addClass('tmp_this')
	$('.hide_this').removeClass('hide_this');
	$('.active_this').addClass('hide_this');
});


// clicking event for the cancel button
$('#btn_profile_cancel').click(function(){
	// hide edit divs
	$('.tmp_this').addClass('hide_this');
	// display information divs
	$('.active_this').removeClass('hide_this');
	$('.hide_this').removeClass('tmp_this');

	// hide save button
	$('#btn_profile_save').addClass('hide_this');
	// hide cancel button
	$('#btn_profile_cancel').addClass('hide_this');
	// show edit button
	$('#btn_profile_edit').removeClass('hide_this');
});


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
    if (!$('#alert_msg').hasClass('hide_this'))
    	$('#alert_msg').addClass('hide_this');
}

/*
* Show instance message for text input box
* @param inputTextID, the text input box id
* @param msgID, the tooltiop id 
*/
function instMsgForText(inputTextID, msgID) {
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

/*-------- Change password ---------*/
$('#btn_change_pass_save').click(function(){
    var current_password = $('#old_password').val(),
        new_password = $('#new_password').val(),
        repeat_password = $('#repeat_password').val();
        
    var jsonData = {
        'current_password':current_password,
        'new_password':new_password,
        'repeat_password':repeat_password
    };    
    
    var csrftoken = $('#csrf_token').val(); 
    $.ajax({
        url: window.SERVER_PATH + 'profile/change_password/',
        type: "POST",
        data: JSON.stringify(jsonData),
        contentType: "application/json",
        success: function(data){                
            if(data['status'] == 'success') {
                window.location.href = window.SERVER_PATH;
            }else if(data['status'] == 'password_incorrect'){
                alert("The password is incorrect!");
            }else if(data['status'] == 'repeat_password_incorrect'){
                alert("Two passwords are not match!");
            }else{
                alert("Unknown error!");
            }
            
            
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});


$('#btn_change_pass_cancel').click(function(){
    var user_id = $('#userid').html().toString();    
    window.location.href = window.SERVER_PATH + "profile/" + user_id + "/";
});