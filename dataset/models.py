from django.db import models

# Create your models here.
class DataSet(models.Model):
    name = models.CharField(max_length=100)
    create_time = models.DateTimeField('date published')
    
    def __unicode__(self):
        return self.name
        

class Doc(models.Model):
    dataset = models.ForeignKey(DataSet)
    people = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    phone = models.CharField(max_length=200)
    organization = models.CharField(max_length=200)
    misc = models.CharField(max_length=200)
    text = models.TextField()        