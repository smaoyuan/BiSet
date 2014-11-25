from django.shortcuts import render
from django.http import HttpResponse

import csv, json

import xml.etree.ElementTree as ET


from datamng.models import DocName, PersonDoc

# Create your views here.

def parseRawData(request):

	f = open('datamng/rawdata/crescent.jig')

	tree = ET.parse(f)
	root = tree.getroot()

	documents = root.findall('document')

	for doc in documents:

		# print doc.tag, doc.attrib  # Child of root are documents
		curDocId = doc.find('docID').text
		print(curDocId)
		curD = DocName(doc_name = curDocId)
		curD.save()

		people = doc.findall('Person')

		for person in people:

			if person.text is not None:
				print(person.text)
				perDoc = PersonDoc(person_name = person.text, doc_id=curD.pk)








	output = 'after parse Raw data'

	return HttpResponse(json.dumps(output), content_type = "application/json")

