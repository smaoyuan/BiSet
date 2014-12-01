from django.shortcuts import render
from django.http import HttpResponse
from django.template.response import TemplateResponse
from sets import Set
import json
from django.db import connection
from django.conf import settings


def analytics(request):
    context = { 'active_tag': 'home', 'BASE_URL':settings.BASE_URL}
    return TemplateResponse(request, 'vis/index.html', context)
    

# Create your views here.
PAIRS = Set(['person_location', 'person_phone', 'person_date', 'person_org', 'person_misc', 
    'location_phone', 'location_date', 'location_org', 'location_misc', 
    'phone_date', 'phone_org', 'phone_misc', 
    'date_org', 'date_misc', 
    'org_misc'])
    
def getVisJson(request, table1 = "person", table2 = "location", table3 = "org", table4 = "EMPTY", table5 = "EMPTY", table6 = "EMPTY"):
    tableList = []
    tableList.append(table1)
    tableList.append(table2)
    tableList.append(table3)
    
    length = len(tableList)
    biclusDict = {}
    entryLists = []
    preCols = None
    
    
    for i in range(0, length):
        print i
        if i == 0:
            theList, preCols = getListDict(None, tableList[i], tableList[i+1], preCols, biclusDict)
            entryLists.append({"listID": i + 1, "leftType": "", "listType": tableList[i], "rightType": tableList[i+1], "entities": theList})
        elif i == length - 1:
            theList, preCols = getListDict(tableList[i-1], tableList[i], None, preCols, biclusDict)
            entryLists.append({"listID": i + 1, "leftType": tableList[i-1], "listType": tableList[i], "rightType": "","entities": theList})
        else:           
            theList, preCols = getListDict(tableList[i-1], tableList[i], tableList[i+1], preCols, biclusDict)
            entryLists.append({"listID": i + 1, "leftType": tableList[i-1], "listType": tableList[i], "rightType": tableList[i+1], "entities": theList})
        
    removedKeyList = []
    for key, val in biclusDict.iteritems():
        removedKeyList.append(val)    
        
    #print entryLists    
    return HttpResponse(json.dumps({"lists":entryLists, "bics":removedKeyList}))
    #return HttpResponse("Done!")
    
'''
Generate list items and clusters based on two neighbors
'''    
def getListDict(tableLeft, table, tableRight, leftClusCols, biclusDict):
    # retrieve data for field1
    if not table == "EMPTY":
        cursor = connection.cursor()
        sql_str = "SELECT * FROM datamng_" + table
        cursor.execute(sql_str)
        table1_rows = cursor.fetchall()
        
        table1_item_dict = {}
        for row in table1_rows:
            if not row[0] in table1_item_dict:
                table1_item_dict[row[0]] = {}
                table1_item_dict[row[0]]['entityID'] = row[0]
                table1_item_dict[row[0]]['entValue'] = row[1]
                table1_item_dict[row[0]]['entFreq'] = row[2]
                table1_item_dict[row[0]]['bicSetsLeft'] = []
                table1_item_dict[row[0]]['bicSetsRight'] = []
                table1_item_dict[row[0]]['entSelected'] = 0
    else:
        return None, None

    if not (tableRight == "EMPTY" or tableRight == None):        
        isInOrder = True
        cursor = connection.cursor()
        sql_str = "SELECT * FROM datamng_" + table + " order by id"
        
        cursor.execute(sql_str)
        list1 = cursor.fetchall()
        
        if table + "_" + tableRight in PAIRS:
            isInOrder = True            
        
            # retrieve data from cluster row for field1
            sql_str = "SELECT * FROM datamng_clusterrow as A, datamng_cluster as B where A.cluster_id = B.id and B.field1 = '" + table + "' and B.field2 = '" + tableRight + "' order by B.id"
            cursor.execute(sql_str)
            t1_t2_ClusRows = cursor.fetchall()
            #and A.rid = C.id
            sql_str = "SELECT * FROM datamng_clustercol as A, datamng_cluster as B where A.cluster_id = B.id and B.field1 = '" + table + "' and B.field2 = '" + tableRight + "' order by B.id"
            cursor.execute(sql_str)
            t1_t2_ClusCols = cursor.fetchall()
            
            
            for row in t1_t2_ClusRows:
                if not row[2] in biclusDict:
                    biclusDict[row[2]] = {}
                    newRow = []
                    newRow.append(row[1])
                    biclusDict[row[2]]['row'] = newRow
                    biclusDict[row[2]]['rowField'] = table
                    biclusDict[row[2]]['colField'] = tableRight
                    biclusDict[row[2]]['bicID'] = row[2]
                    biclusDict[row[2]]['bicSelected'] = 0
                else:
                    biclusDict[row[2]]['row'].append(row[1]);
                    
            for col in t1_t2_ClusCols:
                if not col[2] in biclusDict:
                    # Should not go here
                    print col[2], col[1]
                else:
                    if not 'col' in biclusDict[col[2]]:
                        newCol = []
                        newCol.append(col[1])                   
                        biclusDict[col[2]]['col'] = newCol
                    else:
                        biclusDict[col[2]]['col'].append(col[1]);
            
            for row in t1_t2_ClusRows:
                if not row[1] in table1_item_dict:
                    print "Bug here, at line 454"
                else:
                    table1_item_dict[row[1]]['bicSetsRight'].append(row[2]);
            
            if not tableLeft == None and not leftClusCols == None:
                for col in leftClusCols:
                    if not col[1] in table1_item_dict:
                        print "Bug here, at line 454"
                    else:
                        table1_item_dict[col[1]]['bicSetsLeft'].append(col[2]);
            
            #print table1_item_dict
            removedKeyList = []
            for key, val in table1_item_dict.iteritems():
                removedKeyList.append(val)
                #print key, val
            return removedKeyList, t1_t2_ClusCols
    else:   
        for col in leftClusCols:
                if not col[1] in table1_item_dict:
                    print "Bug here, at line 454"
                else:
                    table1_item_dict[col[1]]['bicSetsLeft'].append(col[2]);
        
        #print table1_item_dict
        removedKeyList = []
        for key, val in table1_item_dict.iteritems():
            removedKeyList.append(val)
        return removedKeyList, None 
        
    return None, None