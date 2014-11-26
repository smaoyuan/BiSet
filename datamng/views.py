from django.shortcuts import render
from django.http import HttpResponse
from django.core.files import File
from django.conf import settings
import os, subprocess, sys, csv, json

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
    

def genLcmInput(request):
    '''
    Generate People_Location matrix input
    '''    
    file_name = "datamng/lcmdata/Input_Person_Location.txt"
    genOneLcmInput(file_name, "person_name", "location_name", "datamng_persondoc", "datamng_locationdoc");
    
    file_name = "datamng/lcmdata/Input_Person_Date.txt"
    genOneLcmInput(file_name, "person_name", "date_string", "datamng_persondoc", "datamng_datedoc");
    
    file_name = "datamng/lcmdata/Input_Person_Phone.txt"
    genOneLcmInput(file_name, "person_name", "phone_number", "datamng_persondoc", "datamng_phonedoc");
    
    file_name = "datamng/lcmdata/Input_Person_Org.txt"
    genOneLcmInput(file_name, "person_name", "org_name", "datamng_persondoc", "datamng_orgdoc");
    
    file_name = "datamng/lcmdata/Input_Person_Misc.txt"
    genOneLcmInput(file_name, "person_name", "misc_string", "datamng_persondoc", "datamng_miscdoc");
    
    
    
    file_name = "datamng/lcmdata/Input_Date_Location.txt"
    genOneLcmInput(file_name, "date_string", "location_name", "datamng_datedoc", "datamng_locationdoc");    
    
    file_name = "datamng/lcmdata/Input_Date_Phone.txt"
    genOneLcmInput(file_name, "date_string", "phone_number", "datamng_datedoc", "datamng_phonedoc");
    
    file_name = "datamng/lcmdata/Input_Date_Org.txt"
    genOneLcmInput(file_name, "date_string", "org_name", "datamng_datedoc", "datamng_orgdoc");
    
    file_name = "datamng/lcmdata/Input_Date_Misc.txt"
    genOneLcmInput(file_name, "date_string", "misc_string", "datamng_datedoc", "datamng_miscdoc");
    
    
    file_name = "datamng/lcmdata/Input_Phone_Location.txt"
    genOneLcmInput(file_name, "phone_number", "location_name", "datamng_phonedoc", "datamng_locationdoc");    
        
    file_name = "datamng/lcmdata/Input_Phone_Org.txt"
    genOneLcmInput(file_name, "phone_number", "org_name", "datamng_phonedoc", "datamng_orgdoc");
    
    file_name = "datamng/lcmdata/Input_Phone_Misc.txt"
    genOneLcmInput(file_name, "phone_number", "misc_string", "datamng_phonedoc", "datamng_miscdoc");
    
    
    file_name = "datamng/lcmdata/Input_Org_Location.txt"
    genOneLcmInput(file_name, "org_name", "location_name", "datamng_orgdoc", "datamng_locationdoc");    
    
    file_name = "datamng/lcmdata/Input_Org_Misc.txt"
    genOneLcmInput(file_name, "org_name", "misc_string", "datamng_orgdoc", "datamng_miscdoc");  
    
    file_name = "datamng/lcmdata/Input_Misc_Location.txt"
    genOneLcmInput(file_name, "misc_string", "location_name", "datamng_miscdoc", "datamng_locationdoc");   
    
    return HttpResponse("Done")
    
def genOneLcmInput(fileName, field1, field2, table1, table2):
    cursor = connection.cursor()
    sql_str = "SELECT A." + field1 + "_id, B."+ field2 + "_id FROM " + table1 + " as A, "+ table2 + \
        " as B WHERE A.doc_id_id = B.doc_id_id order by A." + field1 +"_id"
    
    cursor.execute(sql_str)
    rows = cursor.fetchall()     
    
    # Create a Python file object using open() and the with statement
    with open(fileName, 'w') as f:
        myfile = File(f)
        lastRow = rows[0][0]
        currLine = ""
        for row in rows:
            #print row
            if row[0] == lastRow:
                currLine += str(row[1]) + " "
            else:
                lastRow = row[0]
                myfile.write(currLine + "\n")
                currLine = str(row[1])                
        myfile.write(currLine + "\n")
        myfile.closed
        f.closed
    
    
    
    
# Generate the output based on the input
def genLcmOutput(request):
    lcmFilePath = "datamng/lcmdata/lcm.exe"
    
    inputFileName = "datamng/lcmdata/Input_Person_Location.txt"
    outputFileName = "datamng/lcmdata/Output_People_Location.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Person_Date.txt"
    outputFileName = "datamng/lcmdata/Output_Person_Date.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Person_Phone.txt"
    outputFileName = "datamng/lcmdata/Output_Person_Phone.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Person_Org.txt"
    outputFileName = "datamng/lcmdata/Output_Person_Org.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Person_Misc.txt"
    outputFileName = "datamng/lcmdata/Output_Person_Misc.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    
    inputFileName = "datamng/lcmdata/Input_Date_Location.txt"
    outputFileName = "datamng/lcmdata/Output_Date_Location.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Date_Phone.txt"
    outputFileName = "datamng/lcmdata/Output_Date_Phone.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Date_Org.txt"
    outputFileName = "datamng/lcmdata/Output_Date_Org.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Date_Misc.txt"
    outputFileName = "datamng/lcmdata/Output_Date_Misc.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)    
    
    inputFileName = "datamng/lcmdata/Input_Phone_Location.txt"
    outputFileName = "datamng/lcmdata/Output_Phone_Location.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Phone_Org.txt"
    outputFileName = "datamng/lcmdata/Output_Phone_Org.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Phone_Misc.txt"
    outputFileName = "datamng/lcmdata/Output_Phone_Misc.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    
    inputFileName = "datamng/lcmdata/Input_Org_Location.txt"
    outputFileName = "datamng/lcmdata/Output_Org_Location.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    inputFileName = "datamng/lcmdata/Input_Org_Misc.txt"
    outputFileName = "datamng/lcmdata/Output_Org_Misc.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    
    inputFileName = "datamng/lcmdata/Input_Misc_Location.txt"
    outputFileName = "datamng/lcmdata/Output_Misc_Location.txt"    
    genOneLcmOutput(inputFileName, outputFileName, lcmFilePath)
    
    return HttpResponse("good")

def genOneLcmOutput(inputFileName, outputFileName, lcmFilePath):
    proc = subprocess.Popen([lcmFilePath, 'MqI', inputFileName, '3', outputFileName])
    '''proc = subprocess.Popen([lcmFilePath, 'MqI', inputFileName, '2', outputFileName], stdout=subprocess.PIPE, universal_newlines = True)
    proc.wait()
    output = proc.communicate()
    allLines = output[0].splitlines()
    #allLines = proc.stdout
    res = ''
    for line in allLines:
        thisLine = line.split(' ')
        for word in thisLine:
            res += word + 'WORD'
        res +=  'SEP'    
    print res'''
    