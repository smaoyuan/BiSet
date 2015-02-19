from django.db import models
from dataset.models import Doc, DataSet


# Create your models here.


class DocName(models.Model):
    doc_name = models.CharField(max_length=30, unique= True)
    doc_content = models.TextField(default="")
    dataset = models.ForeignKey(DataSet)

class Person(models.Model):
	person_name = models.CharField(max_length=50, unique= True)
	person_count = models.IntegerField(default=0)

class PersonDoc(models.Model):
	person = models.ForeignKey(Person)
	doc = models.ForeignKey(DocName)

####

class Location(models.Model):
	location_name = models.CharField(max_length=50, unique=True)
	location_count = models.IntegerField(default=0)

class LocationDoc(models.Model):
	location = models.ForeignKey(Location)
	doc = models.ForeignKey(DocName)

####

class Phone(models.Model):
	phone_number = models.CharField(max_length = 20, unique = True)
	phone_count = models.IntegerField(default=0)

class PhoneDoc(models.Model):
	phone = models.ForeignKey(Phone)
	doc = models.ForeignKey(DocName)

####

class Date(models.Model):
	date_string = models.CharField(max_length = 20, unique = True)
	date_count = models.IntegerField(default=0)

class DateDoc(models.Model):
	date = models.ForeignKey(Date)
	doc = models.ForeignKey(DocName)


####

class Org(models.Model):
	org_name = models.CharField(max_length = 50, unique = True)
	org_count = models.IntegerField(default=0)

class OrgDoc(models.Model):
	org = models.ForeignKey(Org)
	doc = models.ForeignKey(DocName)

####

class Misc(models.Model):
	misc_string = models.CharField(max_length = 50, unique = True)
	misc_count = models.IntegerField(default=0)

class MiscDoc(models.Model):
	misc = models.ForeignKey(Misc)
	doc = models.ForeignKey(DocName)

####


class Money(models.Model):
	money_string = models.CharField(max_length = 50, unique = True)
	money_count = models.IntegerField(default=0)

class MoneyDoc(models.Model):
	money = models.ForeignKey(Money)
	doc = models.ForeignKey(DocName)

####

class Cluster(models.Model):
    field1 = models.CharField(max_length = 50)
    field2 = models.CharField(max_length = 50)
    
class ClusterRow(models.Model):
    cluster = models.ForeignKey(Cluster)
    rid = models.IntegerField(default=0)
    
class ClusterCol(models.Model):
    cluster = models.ForeignKey(Cluster)
    cid = models.IntegerField(default=0)    