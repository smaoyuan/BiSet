# Django
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save


class UserProfile(models.Model):
    CAREER_CHOICES = (
        ('F', 'Falcuty'),
        ('U', 'Under Graduate'),
        ('G', 'Graduate'),
        ('O', 'Others')
    )
    user        = models.OneToOneField(User)
    location = models.CharField(max_length=100)
    career = models.CharField(max_length=1, choices = CAREER_CHOICES)
    
    def __unicode__(self):
        return self.user.username
