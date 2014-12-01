from django.conf.urls import include
from django.conf.urls import patterns
from django.conf.urls import url
from viz import views

urlpatterns = patterns('',
    # ex: /polls/
    # url(r'^$', views.index, name='index'),
    url(r'^loadBisets/$', views.getVizJson, name='loadBisets'),
)

