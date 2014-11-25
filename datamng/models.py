from django.db import models


# Create your models here.


class DocName(models.Model):
	doc_name = models.CharField(max_length=30, unique= True)


class Person(models.Model):
	person_name = models.CharField(max_length=50, unique= True)
	person_count = models.IntegerField(default=0)

class PersonDoc(models.Model):
	person_name = models.ForeignKey(Person)
	doc_id = models.ForeignKey(DocName)

####

class Location(models.Model):
	location_name = models.CharField(max_length=50, unique=True)
	location_count = models.IntegerField(default=0)

class LocationDoc(models.Model):
	location_name = models.ForeignKey(Location)
	doc_id = models.ForeignKey(DocName)

####

class Phone(models.Model):
	phone_number = models.CharField(max_length = 20, unique = True)
	phone_count = models.IntegerField(default=0)

class PhoneDoc(models.Model):
	phone_number = models.ForeignKey(Phone)
	doc_id = models.ForeignKey(DocName)

####

class Date(models.Model):
	date_string = models.CharField(max_length = 20, unique = True)
	date_count = models.IntegerField(default=0)

class DateDoc(models.Model):
	date_string = models.ForeignKey(Date)
	doc_id = models.ForeignKey(DocName)


####

class Org(models.Model):
	org_name = models.CharField(max_length = 50, unique = True)
	org_count = models.IntegerField(default=0)

class OrgDoc(models.Model):
	org_name = models.ForeignKey(Org)
	doc_id = models.ForeignKey(DocName)

####

class Mic(models.Model):
	mic_string = models.CharField(max_length = 50, unique = True)
	mic_count = models.IntegerField(default=0)

class MicDoc(models.Model):
	mic_string = models.ForeignKey(Mic)
	doc_id = models.ForeignKey(DocName)

####


class Money(models.Model):
	money_string = models.CharField(max_length = 50, unique = True)
	money_count = models.IntegerField(default=0)

class MoneyDoc(models.Model):
	money_string = models.ForeignKey(Money)
	doc_id = models.ForeignKey(DocName)

####