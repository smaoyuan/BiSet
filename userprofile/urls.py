from django.conf.urls import include
from django.conf.urls import patterns
from django.conf.urls import url
from userprofile import views

urlpatterns = patterns('',
    # ex: /polls/
    url(r'^(?P<user_id>\d+)/$', views.view_profile, name='view_profile'),
    url(r'^edit/$', views.edit_profile, name='edit_profile'),
    url(r'^change_password/$', views.change_password, name='change_password'),
)