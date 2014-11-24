from django.contrib import admin
from projects.models import Project
from projects.models import DataSet, Comment

# Register your models here.
class ProjectAdmin(admin.ModelAdmin):
    fieldsets = [
        ('Project infomation',               {'fields': ['name', 'description', 'dataset', 'user']}),
        ('Date information', {'fields': ['create_time'], 'classes': ['collapse']}),
    ]
admin.site.register(Project)
admin.site.register(DataSet)
admin.site.register(Comment)