# Django
from django.http import HttpResponse, Http404
from django.shortcuts import render_to_response #render
from django.template.context import RequestContext
from django.contrib.auth.decorators import login_required
from userprofile.models import UserProfile
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.conf import settings
from django.template.response import TemplateResponse
from home.utils import * 
from types import *
import json
from django.contrib.auth.hashers import check_password, make_password

@login_required
def view_profile(request, user_id):
    '''
    Display a user's profile. If user_id if provided, then the user 
    will be the user of the user id. Otherwise, the user will be the
    login user.
    @param request: Django http request
    @param user_id: the id of a user
    '''
    
    thisuser = User.objects.get(pk = user_id)
    
    if thisuser == request.user:
        perm = True
    else:
        perm = False
    
    try:        
        from django.contrib.admin.models import LogEntry
        
        new_logging_list = []
        # Dispay the logActions only when "this user" is the loggin user. 
        if thisuser == request.user:
            hist_actions = LogEntry.objects.filter(user = request.user)
            actions_list = list(hist_actions)           
            action_dict = { '1' : "add", '2' : 'update', '3' : 'delete'}
            
            # rebuild the logging list
            for item in actions_list:
                logContentType = item.content_type 
                logAction = item.action_flag
                logObject = None
                targetObject = None
                
                try:    
                    logObject = logContentType.get_object_for_this_type(pk=item.object_id)
                except Exception as e:
                    logObject = None                
                
                logAction = action_dict[str(logAction)]
                
                new_logging_list.append({'action_time':item.action_time, 
                    'change_message':item.change_message, 
                    'logObject':logObject, 
                    'logAction' : logAction,
                    'logContentType': logContentType.name})

        profile = thisuser.userprofile
        
                
        context = { "profile":profile, "this_user":thisuser, 'active_tag': 'userprofile', 
            'BASE_URL':settings.BASE_URL, 'history_actions': new_logging_list, 'perm':perm}
        return TemplateResponse(request, 'userprofile/view_profile.html', context) 
    except Exception as e:
        return HttpResponse(e)

@login_required
def edit_profile(request):
    '''
    Updating user profile.
    @param request: Django http request
    '''
    if request.method == 'POST':
        try:
            requestJson = json.loads(request.body)
            # print requestJson
            uid = requestJson['user_id']
            
            profile_user = User.objects.get(pk = uid);
            if not profile_user == request.user:
                raise Http404
            
            theProfile = UserProfile.objects.get(user = uid)
            theUser = theProfile.user
            
            theUser.first_name = requestJson['first_name']
            theUser.last_name = requestJson['last_name']
            theUser.email = requestJson['email']
            theUser.save()
            
            theProfile.location = requestJson['location']            
            theProfile.career = requestJson['career']
            theProfile.save()
            
            return HttpResponse(json.dumps({'status':'success'}), content_type = "application/json")
            
        except Exception as e:
            print e
    else:
        raise Http404
        
@login_required
def change_password(request):
    '''
    Handing password change request.
    @param request: Django http request
    '''
    if request.method == 'GET':
        context = { 'active_tag': 'profile', 'BASE_URL':settings.BASE_URL}
        return TemplateResponse(request, 'userprofile/change_pass.html', context)
    elif request.method == 'POST':
        requestJson = json.loads(request.body)
        theUser = request.user
        current_password = requestJson['current_password']
        new_password = requestJson['new_password']
        repeat_password = requestJson['repeat_password']
        
        if not check_password(current_password, theUser.password): 
            return HttpResponse(json.dumps({'status':'password_incorrect'}), content_type = "application/json")
           
        if not new_password == repeat_password:
            return HttpResponse(json.dumps({'status':'repeat_password_incorrect'}), content_type = "application/json")

         
        theUser.password = make_password(new_password)
        theUser.save()
        
        return HttpResponse(json.dumps({'status':'success'}), content_type = "application/json")        
    else:
        raise Http404   