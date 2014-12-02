from django.shortcuts import render
from django.shortcuts import render, get_object_or_404, redirect
from django.template.response import TemplateResponse
from django.http import HttpResponseNotAllowed, HttpResponseForbidden, Http404
from django.conf import settings
from itertools import chain
from django.views.decorators.csrf import csrf_protect
from django.http import HttpResponse
from django.utils import timezone
from django.contrib.auth.models import User
from projects.models import DataSet
from dataset.models import Doc
import json
from home.utils import * 



def createhit(request):
    '''
    This is create hit page.
    @param request: Django http request
    '''
    datasets = DataSet.objects.all()   
    context = { 'active_tag': 'myturk', 'BASE_URL':settings.BASE_URL, 'datasets':datasets}  
    return TemplateResponse(request, 'myturk/createhit.html', context)
    
    
def createhitsubmit(request):
    '''
    Submitting mkturk to amazon web service.
    @param request: Django http request containing keys and other task arguments.
    '''
    from boto.mturk.connection import MTurkConnection
    from boto.mturk.question import QuestionContent,Question,QuestionForm,Overview,AnswerSpecification,SelectionAnswer,FormattedContent,FreeTextAnswer
    print 'Ok'
    # Get request data from the front-end
    requestJson = json.loads(request.body)    
    
    user_aws_secret_key = requestJson['aws_secret_key']    
    user_aws_access_key_id = requestJson['aws_access_key_id']
    task_selected_docs = requestJson['task_selected_docs'] #id
    task_title = requestJson['task_title']
    #task_dataset = requestJson['task_dataset'] # id   
    task_description = requestJson['task_description']
    task_duration = requestJson['task_duration']
    task_max_assignment = requestJson['task_max_assignment']
    task_reward = requestJson['task_reward']
        
    # adjust host setting, depending on whether HIT is live (production) or in testing mode (sandbox)
    mode = "sandbox"
    #mode ="production"

    if mode=="production":
        HOST='mechanicalturk.amazonaws.com'
    else:
        HOST='mechanicalturk.sandbox.amazonaws.com'

    mtc = MTurkConnection(aws_access_key_id= user_aws_access_key_id,
                      aws_secret_access_key= user_aws_secret_key,
                      host=HOST)
                      
    overview = Overview()
    overview.append_field('Title', task_title)
    overview.append(FormattedContent('<b>' + task_description + '</b><p></p>'))
       
    tableStr = '<ul>'
    for docID in task_selected_docs:
        docText = Doc.objects.get(pk = docID)
        tableStr += '<li>' + docText.text + '</li>'
    tableStr += '</ul>' 
    overview.append(FormattedContent(tableStr))
    
    qc2 = QuestionContent()
    qc2.append_field('Title','What do you find?')
     
    fta2 = FreeTextAnswer()
     
    q2 = Question(identifier="comments",
                  content=qc2,
                  answer_spec=AnswerSpecification(fta2))
     
    #--------------- BUILD THE QUESTION FORM -------------------
     
    question_form = QuestionForm()
    question_form.append(overview)
    question_form.append(q2)
    print 'Before create hit'
    #--------------- CREATE THE HIT -------------------
    
    try:
        creathitReturnValue = mtc.create_hit(questions=question_form,
                                                           max_assignments= task_max_assignment,
                                                           title=task_title,
                                                           description=task_description,
                                                           keywords='SomeKeywords',
                                                           duration = task_duration,
                                                           reward= task_reward)
    except Exception as e:
        print e

    print 'after crate hit'
    
    return HttpResponse(json.dumps({'data' : mtc.get_account_balance()}), content_type = "application/json")

    # return TemplateResponse(request, 'myturk/createhit.html', context)


def hitresult(request):
    '''
    This is hit result page.
    @param request: Django http request
    '''
    context = { 'active_tag': 'myturk', 'BASE_URL':settings.BASE_URL}  
    return TemplateResponse(request, 'myturk/hitResult.html', context)


def hitresultfetch(request):
    '''
    Request data from amazon web service.
    @param request: Django http request containing mkturk keys
    '''
    from boto.mturk.connection import MTurkConnection
    from boto.mturk.question import QuestionContent,Question,QuestionForm,Overview,AnswerSpecification,SelectionAnswer,FormattedContent,FreeTextAnswer
  
    import mturk_getallreviewablehits as getAllHits

    requestJson = json.loads(request.body)    
    
    user_aws_secret_key = requestJson['myturk_secretkey']    
    user_aws_access_key_id = requestJson['myturk_accesskeyid']

    # adjust host setting, depending on whether HIT is live (production) or in testing mode (sandbox)
    mode = "sandbox"
    # mode ="production"

    if mode=="production":
        HOST='mechanicalturk.amazonaws.com'
    else:
        HOST='mechanicalturk.sandbox.amazonaws.com'

    mtc = MTurkConnection(aws_access_key_id= user_aws_access_key_id,
                      aws_secret_access_key= user_aws_secret_key,
                      host=HOST)




    try:
        allHits = getAllHits.get_all_reviewable_hits(mtc)
        
        hitResultArr = []
        print('how many hits in allHits')
        hitNumber = len(allHits)
        print(hitNumber)

        ## todo get hit content
        print('------before looping through allHits')
        
        for hit in allHits:
            assignments=mtc.get_assignments(hit.HITId)        
            
            print(hit.HIT)
            print(hit.HITId)
            print dir(hit.HIT)

            print('assignments in a hit:')

            # print(assignments.Request)
            # print(assignments.Assignment)
            # print(assignments.HIT)
            
            theAssignments = [] 
            for assignment in assignments:
                print("Answers of the worker %s" % assignment.WorkerId)
                
                         
                
                theAnswer = []
                for question_form_answer in assignment.answers[0]:
                    # for key, value in question_form_answer.fields:
                        # print "%s: %s" % (key,value)
                        # print(value)
                    for value in question_form_answer.fields:
                        theAnswer.append(value)
                        # print(value)
                theAssignments.append({'workderID':assignment.WorkerId, 'answer':theAnswer})

                print ("--------------------")
                
            hitResultArr.append({'hitID':hit.HITId, 'assignments':theAssignments})
        
        print('------after looping through allHits')
    except Exception as e:
        print e

    return HttpResponse(json.dumps(hitResultArr), content_type = "application/json")


