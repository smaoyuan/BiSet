from django.conf.urls import include
from django.conf.urls import patterns
from django.conf.urls import url
from datamng import views

urlpatterns = patterns('',
    # ex: /polls/
    # url(r'^$', views.index, name='index'),
    url(r'^parseRawData/$', views.parseRawData, name='parseRawData'),
)

