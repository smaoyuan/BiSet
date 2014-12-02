from django.shortcuts import render, get_object_or_404, redirect
from django.template.response import TemplateResponse
from django.http import HttpResponseNotAllowed, HttpResponseForbidden, Http404, HttpResponseRedirect
from django.conf import settings
from projects.models import Project, Comment, DataSet, Collaborationship
from itertools import chain
from django.views.decorators.csrf import csrf_protect
from django.http import HttpResponse
from django.utils import timezone
from django.contrib.auth.models import User
import json
from home.utils import * 
    
from django.contrib.auth.decorators import login_required 

@login_required   
def index(request):
    '''
    This is the backend dashbord page.
    @param request: Django http request containing logged in user.
    '''
    theUser = request.user
        
    # Load the total number of projects for the user
    collaborationShip = Collaborationship.objects.filter(user = theUser, is_deleted = '0')
    my_projects_queryset = Project.objects.filter(user = theUser, is_deleted = '0')
    public_projects_queryset = Project.objects.filter(is_private = 0, is_deleted = '0')
    
    # Calculate the number of projects for the user
    project_set = set()
    shared_projects = []
    public_projects = []
    count = 0 
    
    try:
        for item in my_projects_queryset:
            if not item.id in project_set:
                project_set.add(item.id)
                count += 1
        
        for item in collaborationShip:
            if not item.project.id  in project_set:
                if not item.project.is_deleted:
                    project_set.add(item.project.id)
                    shared_projects.append(item.project)
                    count += 1
                
        for item in public_projects_queryset:
            if not item.id in project_set:
                project_set.add(str(item.id))
                public_projects.append(item)
                count += 1
                
    except Exception as e:
        return HttpResponse(e)
        print e
    
    # rendering the template
    context = { 'active_tag': 'home', 'BASE_URL':settings.BASE_URL, 'count': count}
    return TemplateResponse(request, 'projects/index.html', context)

@login_required    
def add(request):
    '''
    Loading the project adding view for "GET" request.
    Creating a new project for "POST" request
    @param request: Django http request
    '''
    if request.method == 'GET':
        dataset = DataSet.objects.all()
        context = { 'active_tag': 'projects', 'BASE_URL':settings.BASE_URL, 'dataset': dataset}
        return TemplateResponse(request, 'projects/add.html', context)  
    elif request.method == 'POST':
        # parse from front end
        projectRaw = json.loads(request.body)
        
        # Handle the request from edit view
        if projectRaw.has_key('project_id') and projectRaw['project_id'].isdigit():
            # TO-DO validate the data
            try:
                theUser = request.user
                # Load project data from the database                
                toUpdate = Project.objects.get(pk = projectRaw['project_id'])
                
                # TO-DO check if the project is deleted
                
                # Only the project creator, super user and collaborators can edit the project
                has_permission = toUpdate.is_creator(theUser) or toUpdate.is_collaborator(theUser) or theUser.is_superuser
    
                if not has_permission:
                    return HttpResponseForbidden("You dont' have the permission to edit this project!")    
                
                toUpdate = Project.objects.get(pk = projectRaw['project_id'])
                toUpdate.dataset = DataSet.objects.get(id = projectRaw['dataset_id'])
                toUpdate.name = projectRaw['project_name']
                toUpdate.description = projectRaw['project_description']
                is_private_front_end = projectRaw['project_privacy']
                
                if is_private_front_end == '1':
                    print is_private_front_end                    
                    toUpdate.is_private = True
                else:
                    toUpdate.is_private = False
                    
                toUpdate.save()
                # Log the change
                change_msg = toUpdate.construct_change_message()
                log_change(request, toUpdate, change_msg)
                # return HttpResponse(str(change_msg))
                responseData = {'status':'success'}
            except Exception as e:
                return HttpResponse(e)
                responseData = {'status':'fail'}
        # Handle request from the add view    
        else:     
            try:
                
                if projectRaw['project_privacy'] == '1':
                    is_private_front_end = True
                else:
                    is_private_front_end = False
                    
                newProject = Project(user = request.user, dataset = DataSet.objects.get(id = projectRaw['dataset_id']), 
                    name = projectRaw['project_name'], description = projectRaw['project_description'], 
                    create_time = timezone.now(), is_private = is_private_front_end, 
                    is_deleted = 0)
            
                newProject.save()
                
                # Log project change actions
                log_addition(request, newProject)              
            
                responseData = {'status':'success'}
            except Exception as e:
                return HttpResponse(e)
                responseData = {'status':'fail'}
        # return status back to front end
        return HttpResponse(json.dumps(responseData), content_type = "application/json")
        #return HttpResponse(json.dumps(responseData))
        
@login_required
def edit(request, project_id):
    '''
    Loading the project edit view for "GET" request
    Updating a project to database for "POST" request
    @param request: Django http request
    @param project_id: the id of the project to update
    '''
    
    # Handing the "GET" request
    if request.method == 'GET':
        datasets = DataSet.objects.all()
        project = Project.objects.get(id = project_id)
        context = { 'active_tag': 'home', 'BASE_URL':settings.BASE_URL, 'datasets': datasets, 'selectedDatasetID':project.dataset.id, 'project': project}
        return TemplateResponse(request, 'projects/edit.html', context)
        
    # Handling the "POST" request    
    elif request.method == 'POST':    
        theUser = request.user
        
        # Load project data from the database
        project = Project.objects.get(id = project_id)
    
        # check user permission
        # Only the project creator, super user and collaborators can edit the project
        has_permission = project.is_creator(theUser) or project.is_collaborator(theUser) or theUser.is_superuser
    
        if not has_permission:
            return HttpResponseForbidden("You dont' have the permission to edit this project!")
            
        # Load data set list from the database    
        return HttpResponse(has_permission)
    
    else:
        return HttpResponseForbidden("Error 405. Only GET and POST allowed for this view.")        

@login_required 
def delete(request, project_id):
    '''
    Delete a project from database.
    @param request: Django http request
    @param project_id: the id of the project to delete
    '''
    theUser = request.user
    # Load project data from the database                
    toDelete = Project.objects.get(pk = project_id)
    
    # Only the project creator, super user can delete the project
    has_permission = toDelete.is_creator(theUser) or toDelete.is_collaborator(theUser) or theUser.is_superuser
    
    if not has_permission:
        return HttpResponseForbidden("You dont' have the permission to delete this project!")
    
    try:
        toDelete.is_deleted = True
        toDelete.save()
        obj_display = force_text(toDelete)
        log_deletion(request, toDelete, obj_display)
        return redirect('/projects/plist/')
    except Exception as e:
        return HttpResponse(e) 
    
    
@login_required     
def plist(request):
    '''
    This page displays all available projects for a user.
    Grouping by public projects, private projects and shared projects.
    @param request: Django http request
    '''
    if request.method == 'GET':
        # Retrieve projects list from database
        # Should use request.user.id to fix simpleLazyObject error        
        theUser = request.user
        
        # Load the total number of projects for the user
        collaborationShip = Collaborationship.objects.filter(user = theUser, is_deleted = '0')
        my_projects_queryset = Project.objects.filter(user = theUser, is_deleted = '0')
        public_projects_queryset = Project.objects.filter(is_private = 0, is_deleted = '0')
        
        # Calculate the number of projects for the user
        project_set = set()
        shared_projects = []
        public_projects = []
        count = 0 
        
        try:
            for item in my_projects_queryset:
                if not item.id in project_set:
                    project_set.add(item.id)
                    count += 1
            
            for item in collaborationShip:
                if not item.project.id  in project_set:
                    if not item.project.is_deleted:
                        project_set.add(item.project.id)
                        shared_projects.append(item.project)
                        count += 1
                    
            for item in public_projects_queryset:
                if not item.id in project_set:
                    project_set.add(str(item.id))
                    public_projects.append(item)
                    count += 1
                    
        except Exception as e:
            return HttpResponse(e)
        
        
    context = { 'active_tag': 'projects', 'user' : request.user, 'BASE_URL':settings.BASE_URL, 
        'my_projects' : my_projects_queryset, 'shared_projects' : shared_projects, 'public_projects': public_projects}
    return TemplateResponse(request, 'projects/plist.html', context)

@login_required    
def detail(request, project_id, sort_order = 'asc'):
    '''
    This is project detail page. 
    @param request: Django http request
    @param project_id: the id of the project to show
    @param sort_order: optional param for the order of the comments of the project
    '''
    theproject = Project.objects.get(id = project_id)
    
    if theproject.is_deleted:
        raise Http404
        
    collaborators = []
    # Only project creator, collaborator and super user can
    # have access to the collaborators
    # perm = 0, user will not see the collaborator view
    # perm = 1, a user will see the collaborator view, but can not edit or add
    # perm = 2, a user will be able to edit or add collaborators
    perm = 0
    theUser = request.user
    
    if theproject.is_creator(theUser) or theUser.is_superuser:
        perm = 2
    elif theproject.is_collaborator(theUser):
        perm = 1
    else:
        perm = 0
        
    # If a user is not collaborator or owner,
    # then, he/she can only view public projects.
    if perm == 0 and theproject.is_private:
        raise Http404
        
    # Load collaborators
    if not perm == 0:
        collaboratorShip = Collaborationship.objects.filter(is_deleted = 0, project = theproject)    
        
        is_theUser_collaborate = False
        for collaborator in collaboratorShip:
            if theUser == collaborator.user:
                is_theUser_collaborate = True
            else:
                collaborators.append(collaborator.user)
        
        if (not theproject.user == theUser) and is_theUser_collaborate:
            collaborators.append(theproject.user)
        
    if sort_order == 'asc':
        sort_order_str = '-create_time'
    else:
        sort_order_str = 'create_time'
    
    allComments = theproject.comment_set.all().order_by(sort_order_str);
    allComments = allComments.filter(is_deleted = False)  
    for comment in allComments:
        # check edit or delete permissions
        if comment.user == request.user:
            comment.edit_enable = True
            comment.delete_enable = True
        elif comment.project.user == request.user:        
            comment.edit_enable = False
            comment.delete_enable = True
        else:
            comment.edit_enable = False
            comment.delete_enable = False
            
    hist_actions = load_project_activity_feed(request, project_id)        
    
    context = { 'user' : request.user, 'BASE_URL':settings.BASE_URL, 
        'project' : theproject, 'comments': allComments, 
        'collaborators':collaborators, 'collaborate_permisson' : perm, 'history_actions':hist_actions}
    return TemplateResponse(request, 'projects/detail.html', context)
 
  
@login_required   
def load_project_activity_feed(request, project_id):
    '''
    Loading activity feeds for a project. 
    Returns a list of activity feed objects.
    @param request: Django http request
    @param project_id: the id of the project
    '''
    thisuser = request.user
    #theProject = Project.objects.get(id = project_id)
    # try:        
    from django.contrib.admin.models import LogEntry
    from django.contrib.contenttypes.models import ContentType

    new_logging_list = []
    # Dispay the logActions only for the project. 
    # get all logs of this project
    
    theProject = Project.objects.get(pk = project_id)    
    comments = Comment.objects.filter(project = theProject)
    
    project_logs = LogEntry.objects.filter(content_type = ContentType.objects.get(model='project'), object_id = project_id)
    
    comments_ids = []
    for item in comments:
        comments_ids.append(item.id)
        
    comment_logs = LogEntry.objects.filter(content_type = ContentType.objects.get(model='comment'), object_id__in = comments_ids)  
    
    # for item in comment_logs:
        # print item.object_id
        # print item.object_repr
    
    project_logs_list = list(project_logs)
    
    comment_logs_list = list(comment_logs)
    
    project_logs_list.extend(comment_logs_list)
    
    
    
    action_dict = { '1' : "add", '2' : 'update', '3' : 'delete'}
    
    # rebuild the logging list
    for item in project_logs_list:
        action_user = item.user
        logContentType = item.content_type 
        logAction = item.action_flag
        logObject = None
        targetObject = None
        
        try:    
            logObject = logContentType.get_object_for_this_type(pk=item.object_id)
        except Exception as e:
            logObject = None                
        
        logAction = action_dict[str(logAction)]
        
        new_logging_list.append({
            'action_user':action_user,
            'action_time':item.action_time, 
            'change_message':item.change_message, 
            'logObject':logObject, 
            'logAction' : logAction,
            'logContentType': logContentType.name})
            
    return new_logging_list 

        # profile = thisuser.userprofile
              
        # context = { "profile":profile, "this_user":thisuser, 'active_tag': 'userprofile', 
            # 'BASE_URL':settings.BASE_URL, 'history_actions': new_logging_list}
        # return TemplateResponse(request, 'userprofile/view_profile.html', context) 
    # except Exception as e:
        # return HttpResponse(e)
   
@login_required 
def load_project_comment_list(request, project_id):
    '''
    Loading all comments for a project.
    Returns a lst of comments objects.
    @param request: Django http request
    @param project_id: the id of the project of the coments.
    '''
    
    theproject = get_object_or_404(Project, pk = project_id)
    allComments =    theproject.comment_set.all().order_by('-create_time');
    allComments = allComments.filter(is_deleted = False)
    
    
    comments_list = [] 
    for comment in allComments:
        tmp = {}
        tmp = {'user':request.user.username, 'comment_user_id':comment.user.id, 'content':comment.content,
                'comment_id':comment.id, 'project_id':project_id, 'pub_date': str(comment.create_time)}
                
        # check edit or delete permissions
        if comment.user == request.user:            
            tmp['edit_enable'] = True
            tmp['delete_enable'] = True
        elif comment.project.user == request.user:
            tmp['edit_enable'] = False
            tmp['delete_enable'] = True
        else:
            tmp['edit_enable'] = False
            tmp['delete_enable'] = False
          
        comments_list.append(tmp)    
    return comments_list  
    
@login_required 
def load_project_collaborators_list(request, project_id):
    ''' 
    Helper function for loading collaborators
    Only the project owner, collaborators and
    super user can request the collaborators
    @param request: Django http request
    @param project_id: the id of the project for loading the collaborators
    '''
    try:
        theproject = get_object_or_404(Project, pk = project_id)

        # Check permission
        theUser = request.user
        if not (theproject.is_creator(theUser) or theUser.isupper or 
            theproject.is_collaborator(theUser)):
            raise Http404

            
        collaboratorShip = Collaborationship.objects.filter(is_deleted = 0, project = theproject).exclude(user = theUser)
        collaborators = []
        for collaborator in collaboratorShip:
            if collaborator.user.is_active:
                collaborators.append(collaborator.user)
                
        collaborators_list = [] 
        for collaborator in collaborators:
            collaborators_list.append({'collaborator': collaborator.username, 'email': collaborator.email
                ,'collaborator_id': collaborator.id, 'project_id':project_id})
    except Exception as e:
        print e       
        
    return collaborators_list      
 
@login_required  
def add_comment(request):
    '''
    Handing adding a new comment.
    @param request: Django http request
    '''
    if request.method == 'POST':
        # parse from front end
        projectRaw = json.loads(request.body)
        try:
            theUser = request.user
            project_id = projectRaw['project_id']      
            # Load project data from the database                
            toUpdate = Project.objects.get(pk = projectRaw['project_id'])
            
            # check if the project is delted
            if toUpdate.is_deleted:
                raise Http404
            
            # Check user permission for adding a comment
            if not toUpdate.is_private:
                has_permission = True            
            else:
                # Only the project creator, super user and collaborators can add comment to the project
                has_permission = toUpdate.is_creator(theUser) or toUpdate.is_collaborator(theUser) or theUser.is_superuser

            if not has_permission:
                responseData = {'status':'fail'}
                return HttpResponse(json.dumps(responseData), content_type = "application/json")
                #return HttpResponseForbidden("You dont' have the permission to edit this project!")  
            
            newComment = Comment(project = toUpdate, user = request.user, 
                    content = projectRaw['content'],
                    create_time = timezone.now(),
                    is_deleted = 0)
            
            newComment.save()
                
            # Log project change actions
            log_addition(request, newComment)              
            
            # Prepare the return json data           
            comments_json = load_project_comment_list(request, project_id)
            responseData = {'status':'success', 'comments': comments_json}
            return HttpResponse(json.dumps(responseData), content_type = "application/json")
        except Exception as e:
            print e
            raise Http404
                
    
@login_required     
def delete_comment(request):
    '''
    Handling request for deleting a comment from database.
    @param request: Django http request
    '''
    if request.method == 'POST':
        projectRaw = json.loads(request.body)
        try:
            project_id = projectRaw['project_id']
            comment_id = projectRaw['comment_id']
            theUser = request.user
            # Load project data from the database                
            theProject = get_object_or_404(Project, pk = project_id)
            theComment = get_object_or_404(Comment, pk = comment_id)
            
            # check if the project is delted
            if theProject.is_deleted or theComment.is_deleted:
                raise Http404
            # Only the project creator, super user and collaborators can delete comment of the project
            has_permission = theProject.is_creator(theUser) # or theProject.is_collaborator(theUser) or theUser.is_superuser or theComment.is_creator(theUser)

            if not has_permission:
                raise Http404
            theComment.is_deleted = True
            theComment.save()    
            obj_display = force_text(theComment)
            log_deletion(request, theComment, obj_display)
            
            
            # Reload the comments from the database
            comments_json = load_project_comment_list(request, project_id)
            responseData = {'status':'success', 'comments': comments_json}
            return HttpResponse(json.dumps(responseData), content_type = "application/json")
        except Exception as e:        
            raise Http404
    else:
        raise Http404
        
@login_required  
def save_comment(request):
    '''
    Updating a comment using comment id.
    @param request: Django http request containing comment id, comment content and project id.
    '''
    if request.method == 'POST':
        commentJson = json.loads(request.body)
        
        try:
            # Get the data from front end
            project_id = commentJson['project_id']
            comment_id = commentJson['comment_id']
            comment_content = commentJson['comment_content']
            theUser = request.user           
            
            theComment = Comment.objects.get(pk = comment_id)
            
            # Only the comment creator or super user can edit the comment            
            if not (theComment.user == theUser or theUser.is_superuser):
                raise Http404           
            
            theComment.content = comment_content
            theComment.save()
            
            # Reload the comments from the database
            comments_json = load_project_comment_list(request, project_id) 
            
            responseData = {'status':'success', 'comments': comments_json}
            return HttpResponse(json.dumps(responseData), content_type = "application/json")
        except Exception as e:  
            raise Http404    
    else:
        raise Http404
        
@login_required         
def sort_comment_asc(request, project_id):
    '''
    Sorting the comments in asc order for a project.
    @param request: Diango http request
    @param project_id: the id of project for sorting.
    '''
    return detail(request, project_id, sort_order = 'asc')
    
@login_required         
def sort_comment_desc(request, project_id):
    '''
    Sorting the comments in desc order for a project.
    @param request: Django http request
    @param project_id: the id of project for sorting
    '''
    return detail(request, project_id, sort_order = 'desc')
    
@login_required         
def add_collaborator(request):
    '''
    Handles request for adding a collaborator to a project.
    Request data is sent by POST.
    @param request: Django http request containing project id, and the collaborator name
    '''
    if request.method == 'POST':
        # request json data
        projectRaw = json.loads(request.body)
        try:
            # data from front end
            project_id = projectRaw['project_id']
            collaborator_name = projectRaw['collaborator_name']
            theUser = request.user
            
            # retrieve collaborator, raise 404 if the collaborator does not exist
            collaborator = get_object_or_404(User, username = collaborator_name)
            
            # Can not add the user himself to be collaborator
            if collaborator == theUser:
                raise Http404
            
            
            theProject = get_object_or_404(Project, pk = project_id)
            # check if the project is delted
            if theProject.is_deleted:
                raise Http404
            
            # Only the project creator and supper user can add collaborators of the project
            has_permission = theProject.is_creator(theUser) or theUser.is_superuser

            if not has_permission:
                raise Http404
            # Add the collaborator to the project
            sc = None
            try:
                sc = Collaborationship.objects.get(project = theProject, user = collaborator, is_deleted = True)
            except:
                pass
            if not sc == None:                
                newCollaborationship = sc
                newCollaborationship.is_deleted = False
            else:    
                newCollaborationship = Collaborationship(project = theProject, user = collaborator)
            newCollaborationship.save()
                
            # Log project change actions
            # log_addition(request, collaborator)              
            
            # Reload the collaborators from the database
            collaborators_list = load_project_collaborators_list(request, project_id)
            responseData = {'status':'success', 'collaborators': collaborators_list}
            return HttpResponse(json.dumps(responseData), content_type = "application/json")
        except Exception as e: 
            raise Http404
    else:
        raise Http404
        
@login_required         
def delete_collaborator(request):
    '''
    Deleting the collaborator from a project.
    @param request: Django http request containing project id and the collaborator's name
    '''
    if request.method == 'POST':
        collaboratorRaw = json.loads(request.body)
        try:            
            # data from the front end
            project_id = collaboratorRaw['project_id']
            collaborator_name = collaboratorRaw['collaborator_name']
            theUser = request.user
            collaborator = get_object_or_404(User, username = collaborator_name)
            
            # The collaborator can not be the logged in user.
            if theUser == collaborator:
                raise Http404
            
            theProject = get_object_or_404(Project, pk = project_id) 
            
            # check if the project is delted or if the collaborator bellongs to the project
            if theProject.is_deleted or (not theProject.is_collaborator(collaborator)):
                raise Http404    
                
            # Only the project creator, super user can delete collaborator of the project
            has_permission = theProject.is_creator(theUser) or theUser.is_superuser
            
            if not has_permission:
                raise Http404
            
            collaborationship = Collaborationship.objects.get(project = theProject, user = collaborator)
            collaborationship.is_deleted = True
            collaborationship.save()  
            obj_display = force_text(collaborationship)
            log_deletion(request, collaborationship, obj_display)
            
            # Reload the collaborators from the database
            collaborators_list = load_project_collaborators_list(request, project_id)
            responseData = {'status':'success', 'collaborators': collaborators_list}
            return HttpResponse(json.dumps(responseData), content_type = "application/json")
        except Exception as e:
            print e
            raise Http404
    else:
        raise Http404
        
@login_required        
def undo_delete(request, project_id): 
    '''
    Deleting a project by flipping a flag in database table.
    @param request: Django http request
    @param project_id: the id of project to be deleted.
    '''
    theProject = Project.objects.get(id = project_id)
    theProject.is_deleted = False
    theProject.save()
    return HttpResponseRedirect("/projects/" + project_id + "/")
 
@login_required 
def undo_comment_delete(request, comment_id):
    '''
    Deleting a comment by flipping a flag in database table.
    @param request: Django http request
    @param comment_id: the id of comment to be deleted.
    '''
    theComment = Comment.objects.get(id = comment_id)
    theComment.is_deleted = False
    theComment.save()
    
    project_id = theComment.project.id
    
    return HttpResponseRedirect("/projects/" + str(project_id) + "/")    
    