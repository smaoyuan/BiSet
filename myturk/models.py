from django.db import models

# Create your models here.
class Questions(models.Model):
	text = models.TextField()

class Results(models.Model):
	question = models.ForeignKey(Questions)
	result = models.TextField()


