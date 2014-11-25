from django.conf.urls import patterns, url
from home import views

urlpatterns = patterns('',
    # ex: /polls/
    url(r'^$', views.index, name='index'),
    url(r'^test$', views.test, name = 'test')
)