from django.conf.urls import include
from django.conf.urls import patterns
from django.conf.urls import url
from projects import views

urlpatterns = patterns('',
    # ex: /polls/
    url(r'^$', views.index, name='index'),
    url(r'^(?P<project_id>\d+)/$', views.detail, name='detail'),
    url(r'^add/$', views.add, name='add'),
    url(r'^plist/$', views.plist, name='plist'),
    url(r'^edit/(?P<project_id>\d+)/$', views.edit, name='edit'),
    url(r'^delete/(?P<project_id>\d+)/$', views.delete, name='delete'),
    url(r'^undo_delete/(?P<project_id>\d+)/$', views.undo_delete, name='undo_delete'),
    url(r'^undo_project_delete/(?P<project_id>\d+)/(?P<log_id>\d+)/$', views.undo_project_delete, name='undo_project_delete'),
    url(r'^comment/add/$', views.add_comment, name='add_comment'),
    #url(r'^(?P<project_id>\d+)/comment/$', views.comment, name='comment'),
    url(r'^comment/delete/$', views.delete_comment, name='delete_comment'), 
    url(r'^undo_comment_delete/(?P<comment_id>\d+)/(?P<log_id>\d+)/$', views.undo_comment_delete, name='undo_comment_delete'),
    url(r'^comment/save/$', views.save_comment, name='save_comment'),  
    url(r'^sort_comment_asc/(?P<project_id>\d+)/$', views.sort_comment_asc, name='sort_comment_asc'), 
    url(r'^sort_comment_desc/(?P<project_id>\d+)/$', views.sort_comment_desc, name='sort_comment_desc'), 
    url(r'^collaborator/add/$', views.add_collaborator, name='add_collaborator'), 
    url(r'^collaborator/delete/$', views.delete_collaborator, name='delete_collaborator'), 
    url(r'^test/$', views.load_project_activity_feed, name='test'),   
    url(r'^userlist/$', views.get_user_list, name='userlist'),   
)