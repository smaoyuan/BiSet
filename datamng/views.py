from django.shortcuts import render
from django.http import HttpResponse
from django.core.files import File
from django.conf import settings
import os

import csv, json

import xml.etree.ElementTree as ET


from datamng.models import DocName, Person, PersonDoc, Location, LocationDoc, Phone, PhoneDoc,Date ,DateDoc ,Org ,OrgDoc,Misc ,MiscDoc ,Money ,MoneyDoc

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
		if not DocName.objects.filter(doc_name = curDocId):
			curD = DocName(doc_name = curDocId)
			curD.save()

		people = doc.findall('Person')

		for person in people:

			if person.text is not None:
				print(person.text)
				# curPerson = Person.objects.get(person_name = person.text)

				if not Person.objects.filter(person_name = person.text):
					personObj = Person(person_name = person.text, person_count= 1)
					personObj.save()
				else:
					curPerson = Person.objects.get(person_name = person.text)
					print(curPerson.person_count)
					curPerson.person_count = curPerson.person_count + 1
					curPerson.save()

				personDocObj = PersonDoc(person_name = Person.objects.get(person_name = person.text), doc_id = DocName.objects.get(doc_name = curDocId))
				personDocObj.save()


		locations = doc.findall('Location')
		for location in locations:

			if location.text is not None:
				print(location.text)

				if not Location.objects.filter(location_name = location.text):
					locationObj = Location(location_name = location.text, location_count= 1)
					locationObj.save()
				else:
					curLocation = Location.objects.get(location_name = location.text)
					print(curLocation.location_count)
					curLocation.location_count = curLocation.location_count + 1
					curLocation.save()

				locationDocObj = LocationDoc(location_name = Location.objects.get(location_name = location.text), doc_id = DocName.objects.get(doc_name = curDocId))
				locationDocObj.save()




		phones = doc.findall('Phone')

		for phone in phones:

			if phone.text is not None:
				print(phone.text)
				# curPhone = Phone.objects.get(phone_number = phone.text)

				if not Phone.objects.filter(phone_number = phone.text):
					phoneObj = Phone(phone_number = phone.text, phone_count= 1)
					phoneObj.save()
				else:
					curPhone = Phone.objects.get(phone_number = phone.text)
					print(curPhone.phone_count)
					curPhone.phone_count = curPhone.phone_count + 1
					curPhone.save()

				phoneDocObj = PhoneDoc(phone_number = Phone.objects.get(phone_number = phone.text), doc_id = DocName.objects.get(doc_name = curDocId))
				phoneDocObj.save()


		dates = doc.findall('Date')
		for date in dates:

			if date.text is not None:
				print(date.text)

				if not Date.objects.filter(date_string = date.text):
					dateObj = Date(date_string = date.text, date_count= 1)
					dateObj.save()
				else:
					curDate = Date.objects.get(date_string = date.text)
					print(curDate.date_count)
					curDate.date_count = curDate.date_count + 1
					curDate.save()

				dateDocObj = DateDoc(date_string = Date.objects.get(date_string = date.text), doc_id = DocName.objects.get(doc_name = curDocId))
				dateDocObj.save()



		orgs = doc.findall('Organization')
		for org in orgs:

			if org.text is not None:
				print(org.text)

				if not Org.objects.filter(org_name = org.text):
					orgObj = Org(org_name = org.text, org_count= 1)
					orgObj.save()
				else:
					curOrg = Org.objects.get(org_name = org.text)
					print(curOrg.org_count)
					curOrg.org_count = curOrg.org_count + 1
					curOrg.save()

				orgDocObj = OrgDoc(org_name = Org.objects.get(org_name = org.text), doc_id = DocName.objects.get(doc_name = curDocId))
				orgDocObj.save()



		miscs = doc.findall('Misc')
		for misc in miscs:

			if misc.text is not None:
				print(misc.text)

				if not Misc.objects.filter(misc_string = misc.text):
					miscObj = Misc(misc_string = misc.text, misc_count= 1)
					miscObj.save()
				else:
					curMisc = Misc.objects.get(misc_string = misc.text)
					print(curMisc.misc_count)
					curMisc.misc_count = curMisc.misc_count + 1
					curMisc.save()

				miscDocObj = MiscDoc(misc_string = Misc.objects.get(misc_string = misc.text), doc_id = DocName.objects.get(doc_name = curDocId))
				miscDocObj.save()	




		moneys = doc.findall('Money')
		for money in moneys:

			if money.text is not None:
				print(money.text)

				if not Money.objects.filter(money_string = money.text):
					moneyObj = Money(money_string = money.text, money_count= 1)
					moneyObj.save()
				else:
					curMoney = Money.objects.get(money_string = money.text)
					print(curMoney.money_count)
					curMoney.money_count = curMoney.money_count + 1
					curMoney.save()

				moneyDocObj = MoneyDoc(money_string = Money.objects.get(money_string = money.text), doc_id = DocName.objects.get(doc_name = curDocId))
				moneyDocObj.save()






	output = 'after parse Raw data'

	return HttpResponse(json.dumps(output), content_type = "application/json")

###### Running Algorithm
from django.db import connection
    
'''
Generate People_Location matrix input
'''
def genLcmInput(request):
    cursor = connection.cursor()
    cursor.execute("SELECT A.person_name_id, B.location_name_id FROM datamng_persondoc as A, datamng_locationdoc as B WHERE A.doc_id_id = B.doc_id_id order by A.person_name_id")
    rows = cursor.fetchall()   
    
    file_dir = os.path.join(settings.CACHE_DIR, "test.txt")
    
    # Create a Python file object using open() and the with statement
    with open(file_dir, 'w') as f:
        myfile = File(f)
        lastRow = rows[0][0]
        currLine = ""
        for row in rows:
            #print row
            if row[0] == lastRow:
                currLine += str(row[1]) + " "
            else:
                lastRow = row[0]
                myfile.write(currLine + "\r\n")
                currLine = str(row[1])                
        myfile.write(currLine + "\r\n")
        myfile.closed
        f.closed        
    return HttpResponse("Done")
