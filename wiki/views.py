from django.shortcuts import render

from django.http import HttpResponse

import csv, json
import wikipedia

# import wikisettings


# Only search for english content.
wikipedia.set_lang("en")


def wikisummary(request):

	rq = json.loads(request.body)

	searchterm = rq['query']
	# searchterm = "orgimage"

	resultDict = {"sumtxt":'',"option":'', "empty":''}

	try:
		resultDict["sumtxt"] = wikipedia.summary(searchterm)
		return HttpResponse(json.dumps(resultDict), content_type = "application/json")

	except (wikipedia.exceptions.DisambiguationError, wikipedia.exceptions.WikipediaException) as e:
		


		if type(e) is wikipedia.exceptions.DisambiguationError:

			resultDict["option"] = e.options
			# print(resultDict)
			# print(type(resultDict["option"] ))

			return 	HttpResponse(json.dumps(resultDict), content_type = "application/json")

		else:

			resultDict["empty"] = "No further information"
			return HttpResponse(json.dumps(resultDict), content_type = "application/json")




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




