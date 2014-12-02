from django.shortcuts import render

from django.http import HttpResponse

import csv, json
import wikipedia

# import wikisettings


# Only search for english content.
wikipedia.set_lang("en")


def wikisummary(request):

	rq = json.loads(request.POST['query'])

	# searchterm = "orgimage"

	try:
		result = wikipedia.summary(rq)
	except (wikipedia.exceptions.DisambiguationError, wikipedia.exceptions.WikipediaException) as e:
		
		if type(e) is wikipedia.exceptions.DisambiguationError:
			options = e.options
			return 	HttpResponse(json.dumps(options), content_type = "application/json")
		else:
			result = "No further information"
			return HttpResponse(json.dumps(result), content_type = "application/json")

	return HttpResponse(json.dumps(result), content_type = "application/json")


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




