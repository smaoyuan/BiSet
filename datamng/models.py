from django.db import models

# Create your models here.


class docName(models.Model):
	docName = models.CharField(max_length=30, unique= True)


class PersonDoc(models.Model):
	person_name = models.CharField(max_length=50, unique= True)
	doc_id = models.ForeignKey(docName)
	person_count = models.IntegerField()