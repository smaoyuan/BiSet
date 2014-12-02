from django.conf.urls import include
from django.conf.urls import patterns
from django.conf.urls import url
from wiki import views

urlpatterns = patterns('',
						# url(r'^$', views.index, name='index'),
                        url(r'^wikisummary/$', views.wikisummary, name='wikisummary'),						
                        # url(r'^wikilocation/$', views.wikilocation, name='wikilocation'),
                        url(r'^orgsum/$', views.orgsum, name='orgsum'),
                        url(r'^orgimage/$', views.orgimage, name='orgimage'),
                        )