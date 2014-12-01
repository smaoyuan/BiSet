from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'testDjango.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('registration.backends.simple.urls')),
    url(r'^profile/', include('userprofile.urls',namespace="userprofile")),
    url(r'^$', include('home.urls', namespace="home")),
    url(r'^projects/', include('projects.urls', namespace="projects")),
    url(r'^datasets/', include('dataset.urls', namespace="datasets")),
    url(r'^myturk/', include('myturk.urls', namespace="myturk")),
    url(r'^wiki/', include('wiki.urls', namespace="wiki")),
    url(r'^datamng/', include('datamng.urls', namespace="datamng")),
    url(r'^vis/', include('vis.urls', namespace="vis")),
    url(r'^home/', include('home.urls', namespace="home")),
	
) + staticfiles_urlpatterns()