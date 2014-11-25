from django.shortcuts import render
from django.http import HttpResponse

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
		if not DocName.objects.get(doc_name = curDocId):
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


		location = doc.findall('Location')
		for location in people:

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




		phone = doc.findall('Phone')

		for phone in people:

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


		date = doc.findall('Date')
		for date in people:

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



		org = doc.findall('Organization')
		for org in people:

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



		misc = doc.findall('Misc')
		for misc in people:

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




		money = doc.findall('Money')
		for money in people:

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

