
// initialize bootstrap select plugin
$('.selectpicker').selectpicker();
// set initial value be none
$('.selectpicker').selectpicker('val', ' ');

// refresh the data view when changing selected dataset
$('.selectpicker').on('change', function(){
    requestDataset($('.selectpicker').selectpicker('val'));

});

selectedDocID = [];

/*
* show the content of a certain dataset
* @param datasetId, the ID of a dataset
*/
function requestDataset(datasetId){

    var csrftoken = $('#csrf_token').val();
    
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajax({
        url: window.SERVER_PATH + "datasets/load_doc_data/",
        type: "POST",
        data: JSON.stringify({'dataset_id': datasetId}),
        contentType: "application/json",
        success: function(data){
            console.log(data);
            if(data['status'] == 'success') {
			    // cancel ajax to get values from all inputs
			    $.ajaxSetup({async:false});            	
                // delete the previous table
                $('#myturk_doc_list').dataTable().fnDestroy();
                $('#myturk_doc_list').empty();

                $("#myturk_create_data_header").removeClass('hide_this');
                
                // initialize the table
                table = $('#myturk_doc_list').dataTable({
                    "data": data['docs'],
                    "bLengthChange": false,
                    "paging": true,
                    "info": true,
                    // "bFilter": false, //Disable search function
                    "columns": [
                        { "data": "doc_id", "width": "8%" },
                        { "data": "doc_text", "orderable": false }
                    ]
                });

			    $('#myturk_doc_list tbody').on('click', 'tr', function (){
			        $(this).toggleClass('selected');
			        selectedDocID.push($(this).attr('id'));
			    });
			 
            }
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });	
}

$('#btn_submit_turk').click(function(){

    var csrftoken = $('#csrf_token').val();
    var taskTitle = $('#myturk_task_title').val(),
    	taskDescription = $('#myturk_task_description').val(),
    	dataset = $('.selectpicker').selectpicker('val'),
    	accessKeyID = $('#myturk_accesskeyid').val(),
    	secretKey = $('#myturk_secretkey').val(),
    	taskDuration = $('#myturk_duration').val(),
    	taskMaxAssignment = $('#myturk_max_assignment').val()
    	taskReward = $('#myturk_reward').val();

    var requestJSON = {
        "task_title": taskTitle,
        "task_description": taskDescription,
        "task_dataset": dataset,
        "task_duration": taskDuration,
        "task_max_assignment": taskMaxAssignment,
        "task_reward": taskReward,
        "task_selected_docs": selectedDocID,
        "aws_access_key_id": accessKeyID,
        "aws_secret_key": secretKey
    }

    console.log(requestJSON); 

    $.ajax({
        url: window.SERVER_PATH + 'myturk/createhitsubmit/',
        type: "POST",
        data: JSON.stringify(requestJSON),
        contentType: "application/json",
        success: function(data){
            if(data['status'] == 'success') {
            	console.log('success!');
            }
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

});

$('#hit_result_fetch').click(function(){
    var csrftoken = $('#csrf_token').val();
    
    var accessKeyID = $('#myturk_accesskeyid').val();
    var secretKey = $('#myturk_secretkey').val();
    
    if(accessKeyID == ""){
        alert("Please enter accessKeyID");
        return;
    }
    
    if(secretKey == ""){
        alert("Please enter secretKey");
        return;
    }
    
    var requestJSON = {
        "myturk_accesskeyid": accessKeyID,
        "myturk_secretkey": secretKey
    }

    console.log(requestJSON); 

    $.ajax({
        url: window.SERVER_PATH + 'myturk/hitresultfetch/',
        type: "POST",
        data: JSON.stringify(requestJSON),
        contentType: "application/json",
        success: function(data){  
            var dataContainer = $('#turk_result');
            var isFirst = true;
            for(var i = 0; i < data.length; i++){
                var hitID = data[i].hitID;
                if(isFirst){
                    dataContainer.append("<p style = 'margin-left:10px'> Hit id: " + hitID + "</p>");
                    isFirst = false;
                }else{
                    dataContainer.append("<hr><p style = 'margin-left:10px'> Hit id: " + hitID + "</p>");
                }
                
                var assignments = data[i].assignments;
                var assignmentsDiv = $('<div/>').html("<div id = 'assignment_"+ hitID + "' style = 'margin-left:20px'> </div>").contents();
                                                   
                for(var j = 0; j < assignments.length; j++){                    
                    var workderID = assignments[j].workderID;
                    assignmentsDiv.append("<p> worker id: " + workderID + "</p>");
                    var answers = assignments[j].answer;
                    for(var k = 0; k < answers.length; k++){
                        assignmentsDiv.append("<p> answer : " + answers[k] + "</p>");
                    }
                }
                
                dataContainer.append(assignmentsDiv);
                
                
            }
        },
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});

// these HTTP methods do not require CSRF protection
function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


