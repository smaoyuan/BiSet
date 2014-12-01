from django.conf.urls import include
from django.conf.urls import patterns
from django.conf.urls import url
from vis import views

urlpatterns = patterns('',
    # ex: /polls/
    # url(r'^$', views.index, name='index'),
    url(r'^loadbisets/$', views.getVisJson, name='loadBisets'),
    url(r'^analytics/$', views.analytics, name='analytics'),
)

