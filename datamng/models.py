from django.db import models

# Create your models here.


class DocName(models.Model):
	doc_name = models.CharField(max_length=30, unique= True)


class PersonDoc(models.Model):
	person_name = models.CharField(max_length=50, unique= True)
	doc_id = models.ForeignKey(DocName)
	person_count = models.IntegerField()