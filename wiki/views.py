from django.shortcuts import render

from django.http import HttpResponse

import csv, json
import wikipedia

# import wikisettings


# Create your views here.
wikipedia.set_lang("en")


def orgsum(request):

	org = "cia"

	try:
		orginfo = wikipedia.summary(org)
	except wikipedia.exceptions.DisambiguationError as e:
		options = e.options
		return HttpResponse(options) 


	orginfo = wikipedia.summary(org)

	return HttpResponse(orginfo) 

def orgimage(request):
	org = "FBI"

	try:
		orgpage = wikipedia.page(org)
	except wikipedia.exceptions.DisambiguationError as e:
		options = e.options

		return HttpResponse(options) 


	orgimg = orgpage.images[1]

	return HttpResponse(orgimg) 




def wikilocation(request):

		
	try:
		mercury = wikipedia.summary("blacksburg")
	except wikipedia.exceptions.DisambiguationError as e:
		options = e.options

		return HttpResponse(options) 


	result = []
	result.append (wikipedia.summary("blacksburg"))

	return HttpResponse(result) 

