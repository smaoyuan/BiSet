/*
* This file contains front end validation for register a new user
* which is used in the register page
* validation includes: 1) format of email address, 2) format of the password
* and 3) whether the two passwords are matched or not
*/

// check whether the input for user name is empty
function validateUserName() { 
    if ($("#register_username").val().length > 0){
        $("#usernameval").removeClass("glyphicon-remove");
        $("#usernameval").addClass("glyphicon-ok");
        $("#usernameval").css("color","#00A41E");
    } else {
        $("#usernameval").removeClass("glyphicon-ok");
        $("#usernameval").addClass("glyphicon-remove");
        $("#usernameval").css("color","#FF0004");                
    }
}

// check whether the input for email is leagal
function validateEmail() { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var email = $('#register_email').val();

    if (re.test(email)) {
        $("#emailval").removeClass("glyphicon-remove");
        $("#emailval").addClass("glyphicon-ok");
        $("#emailval").css("color","#00A41E");
    } else {
        $("#emailval").removeClass("glyphicon-ok");
        $("#emailval").addClass("glyphicon-remove");
        $("#emailval").css("color","#FF0004");                
    }
}

// check whether the input password meets the requirement
function passVerify() {
    var ucase = new RegExp("[A-Z]+");
    var lcase = new RegExp("[a-z]+");
    var num = new RegExp("[0-9]+");
    
    // check the length of the passwork
    if($("#register_password1").val().length >= 8){
        $("#8char").removeClass("glyphicon-remove");
        $("#8char").addClass("glyphicon-ok");
        $("#8char").css("color","#00A41E");
    } else{
        $("#8char").removeClass("glyphicon-ok");
        $("#8char").addClass("glyphicon-remove");
        $("#8char").css("color","#FF0004");
    }
    
    // check the upper case of the password
    if(ucase.test($("#register_password1").val())){
        $("#ucase").removeClass("glyphicon-remove");
        $("#ucase").addClass("glyphicon-ok");
        $("#ucase").css("color","#00A41E");
    } else{
        $("#ucase").removeClass("glyphicon-ok");
        $("#ucase").addClass("glyphicon-remove");
        $("#ucase").css("color","#FF0004");
    }
    
    // check the lower case of the password
    if(lcase.test($("#register_password1").val())){
        $("#lcase").removeClass("glyphicon-remove");
        $("#lcase").addClass("glyphicon-ok");
        $("#lcase").css("color","#00A41E");
    } else{
        $("#lcase").removeClass("glyphicon-ok");
        $("#lcase").addClass("glyphicon-remove");
        $("#lcase").css("color","#FF0004");
    }
    
    // check where any numbers exist in the password
    if(num.test($("#register_password1").val())){
        $("#num").removeClass("glyphicon-remove");
        $("#num").addClass("glyphicon-ok");
        $("#num").css("color","#00A41E");
    } else{
        $("#num").removeClass("glyphicon-ok");
        $("#num").addClass("glyphicon-remove");
        $("#num").css("color","#FF0004");
    }
}

// check whether two passwords match or not
function passMatchVerify() {
    if($("#register_password1").val() == $("#register_password2").val()){
        $("#pwmatch").removeClass("glyphicon-remove");
        $("#pwmatch").addClass("glyphicon-ok");
        $("#pwmatch").css("color","#00A41E");
    } else{
        $("#pwmatch").removeClass("glyphicon-ok");
        $("#pwmatch").addClass("glyphicon-remove");
        $("#pwmatch").css("color","#FF0004");
    }
}


// show tooltip when the user name input is focused
$("#register_username").focusin(function(){

	$.ajaxSetup({async:false});

    $(".username_message a").tooltip({
        html: "true",
        trigger: "focus",
        placement: "top",
        title: "<span id='usernameval' class='glyphicon glyphicon-remove' style=color:#FF0004;'></span> Empty user name",
		animation: false
	});

    // verifed the user name after the tooltip is shown
    $(".username_message a").on('shown.bs.tooltip', function() {
        $('#register_username').keyup(function(){
			validateUserName();
			isAllInputValid();
		});
        $('#register_username').click(validateUserName);
    })
});

// show tooltip when the email input is focused
$("#register_email").focusin(function(){
	$.ajaxSetup({async:false});
    $(".email_message a").tooltip({
        html: "true",
        trigger: "focus",
        placement: "top",
        title: "<span id='emailval' class='glyphicon glyphicon-remove' style=color:#FF0004;'></span> Legal email address",
		animation: false
    });

    // verifed the email address after the tooltip is shown
    $(".email_message a").on('shown.bs.tooltip', function() {
        $('#register_email').keyup(function(){
			validateEmail();
			isAllinputValid();
		});
        $('#register_email').click(validateEmail);
    });
});

// hide the tooltip when the email input is unfocused
$("#register_email").focusout(function(){
    $(".email_message a").tooltip('hide');
});


// show tooltip when the 1st password input is focused
$("#register_password1").focusin(function(){
    $(".password1_message a").tooltip({
        html: "true",
        trigger: "focus",
        placement: "top",
        title: "<p align='left'><span id='8char' class='glyphicon glyphicon-remove' style='color:#FF0004;'></span> 8 Characters Long<br /><span id='ucase' class='glyphicon glyphicon-remove' style='color:#FF0004;'></span> 1 Uppercase Letter<br /><span id='lcase' class='glyphicon glyphicon-remove' style='color:#FF0004;'></span> 1 Lowercase Letter<br /><span id='num' class='glyphicon glyphicon-remove' style='color:#FF0004;'></span> 1 Number</p>",
		animation: false
	});

    // verifed the 1st password after the tooltip is shown
    $(".password1_message a").on('shown.bs.tooltip', function () {
        $('#register_password1').keyup(function(){
			passVerify();
			isAllInputValid();
		});
        // click the input for verification when browser automatically fill in the form
        $('#register_password1').click(passVerify);
    });
});

// hide the tooltip when the 1st password input is unfocused
$("#register_password1").focusout(function(){
    $(".password1_message a").tooltip('hide');
});


// show tooltip when the 1st password input is focused
$("#register_password2").focusin(function(){
    $(".password2_message a").tooltip({
        html: "true",
        trigger: "focus",
        placement: "top",
        title: "<span id='pwmatch' class='glyphicon glyphicon-remove' style=color:#FF0004;'></span> Passwords Match",
		animation: false
	});

    // verifed the 2nd password after the tooltip is shown
    $(".password2_message a").on('shown.bs.tooltip', function () {
        $("#register_password2").keyup(function(){
			passMatchVerify();
			isAllInputValid();			
		});
        $("#register_password2").click(passMatchVerify);
    });
});

// hide the tooltip when the 1st password input is unfocused
$("#register_password2").focusout(function(){
    $(".password1_message a").tooltip('hide');
});

// Verify if all inputs are valid
function isAllInputValid(){
	// regex expression to verify email
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var email = $('#register_email').val();
	// regex expressions to verify passwords
	var ucase = new RegExp("[A-Z]+");
    var lcase = new RegExp("[a-z]+");
    var num = new RegExp("[0-9]+");
	// Indicates if all input are valid
	var status = true;
	
	// Check if the user name empty
	if ($("#register_username").val().length == 0){
		status = false;
	}
	
	// Check if the email valid
    if (!re.test(email)) {
		status = false;
	}
    
    // check the length of the passwork
    if($("#register_password1").val().length < 8){
		status = false;
	}
	
	// check is the password contains at least one uppercase
	if(!ucase.test($("#register_password1").val())){
		status = false;	
	}
	
	// check is the password contains at least one lower case
	if(!lcase.test($("#register_password1").val())){
		status = false;
	}
	
	// check if two passwords are equals
	if($("#register_password1").val() != $("#register_password2").val()){
		status = false;
	}
	
	// Enable or disable the submit button based on if all inputs are valid
	if(status){
		$('#register_submit').prop('disabled', false);
	}else{
		$('#register_submit').prop('disabled', true);
	}
	
}
