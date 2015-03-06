from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, Http404
from django.template.response import TemplateResponse
from sets import Set
import json
from django.db import connection
from django.conf import settings
from vis.models import Vis, VisNodes
from projects.models import Project, Collaborationship
from django.contrib.auth.decorators import login_required
from django.utils import timezone

@login_required 
def analytics(request):
    '''
    This is visualization page. 
    @param request: the Django HttpRequest object
    '''
    theUser = request.user
    previousVisList = []
    pid = 0
    if 'selected_project_id' in request.session:
        pid =  request.session['selected_project_id']
        # Load visList
        previousVisList = getVisListFromDB(pid)
    
    '''
    myProjects =  Project.objects.filter(user = theUser)
    
    privateProjects = []
    pCount = 0
    for item in myProjects:
        thisProject = {}
        thisProject['id'] = item.id
        thisProject['name'] = item.name
        thisProject['dataset'] = item.dataset        
        privateProjects.append(item)
        pCount += 1
    '''
        
    # Load the total number of projects for the user
    collaborationShip = Collaborationship.objects.filter(user = theUser, is_deleted = '0')
    my_projects_queryset = Project.objects.filter(user = theUser, is_deleted = '0')
    
    # Calculate the number of projects for the user
    project_set = set()
    shared_projects = []
    count = 0 
    
    try:
        for item in my_projects_queryset:
            if not item.id in project_set:
                project_set.add(item.id)
                count += 1
        
        for item in collaborationShip:
            if not item.project.id  in project_set:
                if not item.project.is_deleted:
                    project_set.add(item.project.id)
                    shared_projects.append(item.project)
                    count += 1
                
    except Exception as e:
        return HttpResponse(e)
    print previousVisList
    context = {'active_tag': 'analytics', 'BASE_URL':settings.BASE_URL, 'projects':my_projects_queryset,'shareProjects':shared_projects, 'pCount': count ,'prePid':pid ,'preVisList':previousVisList}
    #return TemplateResponse(request, 'vis/index.html', context)
    return render(request, 'vis/index.html', context)

@login_required
def loadVisList(request):
    '''
    Loading private projects. Returns the private projects for the loggin user.
    @param request: Django http request
    '''        
    
    theUser = request.user    
    requestJson = json.loads(request.body)
    project_id = requestJson['project_id']
    # Remember user's selection
    request.session['selected_project_id'] = project_id
    return HttpResponse(json.dumps(getVisListFromDB(project_id)))
 
def getVisListFromDB(project_id):  
    
    theVisList =  Vis.objects.filter(project = project_id).order_by('create_time')
    
    visList = []
    for item in theVisList:
        thisVis = {}
        thisVis['id'] = item.id        
        thisVis['vis_name'] = item.name
        thisVis['create_time'] = str(item.create_time)     
        visList.append(thisVis)
    return visList
    
 
@login_required     
def addVisConfig(request):
    '''
    Creating a visualization for "POST" request.
    Returning list and bisets json.
    @param request: Django http request
    '''
    try:
        # Loading front end data
        requestJson = json.loads(request.body)
        
        theUser = request.user
        project_id = requestJson['project_id']
        visconfigName = requestJson['vis_name']
        theProject = get_object_or_404(Project, pk = project_id)
        
        
        # Only the project creator, super user can delete the project
        has_permission = theProject.is_creator(theUser) or theProject.is_collaborator(theUser) or theUser.is_superuser
        
        if not has_permission:
            raise Http404

        
        personField = 0
        locationField = 0
        phoneField = 0
        dateField = 0
        orgField = 0
        miscField = 0
        
        listNames = []
        if 'person' in requestJson:
            personField = 1
            listNames.append("person")
        if 'location' in requestJson:
            locationField = 1
            listNames.append("location")
        if 'phone' in requestJson:
            phoneField = 1       
            listNames.append("phone")            
        if 'date' in requestJson:
            dateField = 1
            listNames.append("date")
        if 'org' in requestJson:
            orgField = 1
            listNames.append("org")
        if 'misc' in requestJson:
            miscField = 1
            listNames.append("misc")
            
        lstsBisetsJson = getLstsBisets(listNames)
        
        newVis = Vis(user = theUser, project = theProject, name = visconfigName, personIn = personField, locationIn = locationField, phoneIn = phoneField, dateIn = dateField, orgIn = orgField, miscIn = miscField, create_time = timezone.now())
            
        newVis.save()
        
        thisVis = {}
        thisVis['id'] = newVis.id        
        thisVis['vis_name'] = newVis.name
        thisVis['create_time'] = str(newVis.create_time)
        
        lstsBisetsJson['vis'] = thisVis
        
        responseJson = {"status": "success"}
    except Exception as e:
        responseJson = {"status": "error"}    
        
    return HttpResponse(json.dumps(lstsBisetsJson))
    
@login_required 
def saveVis(request):
    '''
    Handling vis saving request to save a vis to database.
    @param request: the Django HttpRequest object
    '''
    # Loading front end data
    requestJson = json.loads(request.body)
    
    theUser = request.user
    project_id = requestJson['project_id']
    theProject = get_object_or_404(Project, pk = project_id)
    
    # Only the project creator, super user can delete the project
    has_permission = theProject.is_creator(theUser) or theProject.is_collaborator(theUser) or theUser.is_superuser
    
    if not has_permission:
        raise Http404
    
    visID = requestJson['vis_id']
    
    rawNodes = requestJson['highlight_ent']
    
    toUpdate = []
    for item in rawNodes:
        nodeArr = item.split('_')
        tmp = {}
        tmp['nodeType'] = nodeArr[0]
        tmp['nodeId'] = nodeArr[1]
        toUpdate.append(tmp)
        
   
        
    # get the lists names of the vis
    listNames = []
    theVis = Vis.objects.get(id = visID)
    
    oldSelectedNodes = VisNodes.objects.filter(vis = theVis)
    
    # Checking which records should be added and removed
    for oldItem in oldSelectedNodes:
        
        isExist = False
        for newItem in toUpdate:
            if oldItem.nodeType == newItem['nodeType'] and oldItem.nodeId == newItem['nodeId'] and oldItem.modifyBy == theUser:
                newItem['nodeType'] = "exist"
                isExist = True
                break;
        # delete the record from database if the node was unhighlighted
        if not isExist:
            oldItem.delete();
    
    # Adding new highlighted nodes
    for newItem in toUpdate:
        if not newItem['nodeType'] == "exist":
            newVisNode = VisNodes(vis = theVis, nodeType = newItem['nodeType'], nodeId = newItem['nodeId'], modifyBy = theUser)
            newVisNode.save()
    
    responseJson = {"status": "success"}
    
    return HttpResponse(json.dumps(responseJson))
    
@login_required 
def deleteVis(request):
    '''
    Deleting a visualization
    @param request: Django http request
    '''
    try:
        # Loading front end data
        requestJson = json.loads(request.body)
        
        theUser = request.user
        project_id = requestJson['project_id']
        theProject = get_object_or_404(Project, pk = project_id)
        
        
        
        # Only the project creator, super user can delete the project
        has_permission = theProject.is_creator(theUser) or theProject.is_collaborator(theUser) or theUser.is_superuser
        
        if not has_permission:
            raise Http404
            
        visID = requestJson['vis_id']
        
        # Deleting all highlighted nodes
        nodesToDelete = VisNodes.objects.filter(vis = visID)
        
        for toDelete in nodesToDelete:
            toDelete.delete()
            
        # Deleting record from vis table
        theVis = Vis.objects.get(id = visID)
        theVis.delete()
        
        responseJson = {"status": "success"}
        
    except Exception as e:
        responseJson = {"status": "error"}
    
    return HttpResponse(json.dumps(responseJson))
    
@login_required    
def loadVis(request):
    '''
    Loading a saved vis. Returning a json object.
    @param request: the Django HttpRequest object
    '''
    # Loading front end data
    requestJson = json.loads(request.body)
    
    theUser = request.user
    project_id = requestJson['project_id']
   
    theProject = get_object_or_404(Project, pk = project_id)
    
    
    
    # Only the project creator, super user can delete the project
    has_permission = theProject.is_creator(theUser) or theProject.is_collaborator(theUser) or theUser.is_superuser
    
    if not has_permission:
        raise Http404
    # get the lists names of the vis    
    visID = requestJson['vis_id']
    listNames = []
    theVis = Vis.objects.get(id = visID)
    if theVis.personIn:
        listNames.append("person")
    if theVis.locationIn:
        listNames.append("location")
    if theVis.phoneIn:
        listNames.append("phone")
    if theVis.dateIn:
        listNames.append("date")
    if theVis.orgIn:
        listNames.append("org")
    if theVis.miscIn:
        listNames.append("misc")
    
    
    lstsBisetsJson = getLstsBisets(listNames)  
    
    selectedNodes = VisNodes.objects.filter(vis = visID)
    
    lstsBisetsJson["highlight_ent"] = {}
    
    for item in selectedNodes:
        identity = str(item.nodeType) + "_" + str(item.nodeId)
        lstsBisetsJson["highlight_ent"][identity] = \
            {"nodeType": item.nodeType, "nodeID": item.nodeId}   
    
    # connections between entities and bics
    lstsBisetsJson["relNetwork"] = {}
    # relevant docs for entities and bics
    lstsBisetsJson["relatedDocs"] = {}
    # all links
    lstsBisetsJson["links"] = {}
    # all docs
    lstsBisetsJson["docs"] = {}
    # all origial relations in the dataset
    lstsBisetsJson["oriRelations"] = getLstsRelations(listNames)


    networkData = lstsBisetsJson["relNetwork"]
    relDocs = lstsBisetsJson["relatedDocs"]
    links = lstsBisetsJson["links"]
    docs = lstsBisetsJson["docs"]

    relations = lstsBisetsJson["oriRelations"]

    oriRelDict = {}
    for rel in relations:
        if not rel["oriLinkID"] in oriRelDict:
            tmpLinkDocList = []
            tmpLinkDocList.append(rel["docID"])
            oriRelDict[rel["oriLinkID"]] = tmpLinkDocList
        else:
            oriRelDict[rel["oriLinkID"]].append(rel["docID"])

    linkName = Set()


    bics = lstsBisetsJson["bics"]
    lists = lstsBisetsJson["lists"]

    # add all bic with its entities in the dictionary
    for bic in bics:
        tmpArray = []
        rowType = bics[bic]["rowField"]
        colType = bics[bic]["colField"]
        rows = bics[bic]["row"]
        cols = bics[bic]["col"]

        bicID = rowType + "_" + colType + "_bic_" + str(bics[bic]["bicID"])

        # get all row id
        for row in rows:
            rowID = str(rowType) + "_" + str(row)
            tmpArray.append(rowID)
            if rowID > bicID:
                tmpLinkName = rowID + "__" + bicID
            else:
                tmpLinkName = bicID + "__" + rowID
            linkName.add(tmpLinkName)

        for col in cols:
            colID = str(colType) + "_" + str(col)
            tmpArray.append(colID)
            if colID > bicID:
                tmpLinkName = colID + "__" + bicID
            else:
                tmpLinkName = bicID + "__" + colID
            linkName.add(tmpLinkName)

        for row in rows:
            rowID = str(rowType) + "_" + str(row)
            for col in cols:
                colID = str(colType) + "_" + str(col)
                if (rowID > colID):
                    tmpID = rowID + "__" + colID
                else:
                    tmpID = colID + "__" + rowID
                if tmpID in oriRelDict:
                    bics[bic]['docs'] = list(oriRelDict[tmpID])

        networkData[bicID] = tmpArray

    # all all entities with their bics in the dictionary
    for lst in lists:
        listType = lst["listType"]
        entities = lst["entities"]
        rType = lst["rightType"]
        lType = lst["leftType"]
        for ent in entities:
            entityID = str(listType) + "_" + str(ent["entityID"])
            leftBics = ent["bicSetsLeft"]
            rightBics = ent["bicSetsRight"]
            tmpArray = []
            if len(leftBics) != 0:
                for lbic in leftBics:
                    thisbicID = lType + "_" + listType + "_bic_" + str(lbic)
                    tmpArray.append(thisbicID)
                    if entityID > thisbicID:
                        tmpLinkName = entityID + "__" + thisbicID
                    else:
                        tmpLinkName = thisbicID + "__" + entityID
                    linkName.add(tmpLinkName)

            if len(rightBics) != 0:
                for rbic in rightBics:
                    thisbicID = listType + "_" + rType + "_bic_" + str(rbic)
                    tmpArray.append(thisbicID)
                    if entityID > thisbicID:
                        tmpLinkName = entityID + "__" + thisbicID
                    else:
                        tmpLinkName = thisbicID + "__" + entityID
                    linkName.add(tmpLinkName)

            if len(tmpArray) != 0:
                networkData[entityID] = tmpArray

    # get data from doc table
    cursor = connection.cursor()
    sql_str = "SELECT * FROM datamng_docname"       
    cursor.execute(sql_str)
    doc_table_rows = cursor.fetchall()
    # generate objects for doc
    for row in doc_table_rows:
        docs[row[0]] = {}
        docs[row[0]]["docID"] = "Doc_" + str(row[0])
        docs[row[0]]["docName"] = row[1]
        docs[row[0]]["docContent"] = row[3]

    for lk in linkName:
        links[lk] = { "linkID": lk, "linkNumCoSelected": 0 }

    return HttpResponse(json.dumps(lstsBisetsJson))
    

# All available pairs
PAIRS = Set(['person_location', 'person_phone', 'person_date', 'person_org', 'person_misc', 
    'location_phone', 'location_date', 'location_org', 'location_misc', 
    'phone_date', 'phone_org', 'phone_misc', 
    'date_org', 'date_misc',
    'org_misc'])
    
@login_required 
def getVisJson(request, table1 = "person", table2 = "location", table3 = "org", table4 = "EMPTY", table5 = "EMPTY", table6 = "EMPTY"):
    '''
    Returns a json object for visualization. 
    The json contains lists and bicsets objects.
    @param request: the Django HttpRequest object
    '''
    tableList = []
    tableList.append(table1)
    tableList.append(table2)
    tableList.append(table3)    
    return HttpResponse(json.dumps(getLstsBisets(tableList)))
    
  
def getLstsBisets(lstNames):
    '''
    Returns a json object for visualization. 
    The json contains lists and bicsets objects.
    @param lstNames: the names of lists
    '''
    length = len(lstNames)
    biclusDict = {}
    entryLists = []
    preCols = None    
    
    for i in range(0, length):
        if i == 0:
            theList, preCols = getListDict(None, lstNames[i], lstNames[i+1], preCols, biclusDict)
            entryLists.append({"listID": i + 1, "leftType": "", "listType": lstNames[i], "rightType": lstNames[i+1], "entities": theList})
        elif i == length - 1:
            theList, preCols = getListDict(lstNames[i-1], lstNames[i], None, preCols, biclusDict)
            entryLists.append({"listID": i + 1, "leftType": lstNames[i-1], "listType": lstNames[i], "rightType": "","entities": theList})
        else:           
            theList, preCols = getListDict(lstNames[i-1], lstNames[i], lstNames[i+1], preCols, biclusDict)
            entryLists.append({"listID": i + 1, "leftType": lstNames[i-1], "listType": lstNames[i], "rightType": lstNames[i+1], "entities": theList})
   
    return {"lists":entryLists, "bics":biclusDict}


def getLstsRelations(lstNames):
    '''
    Returns a json object for visualization. 
    The json contains relations between lists.
    @param lstNames: the names of lists
    '''
    length = len(lstNames)
    lstRelations = []

    for i in range(0, length - 1):
        lstName1 = lstNames[i]
        lstName2 = lstNames[i + 1]

        # get data from doc table
        cursor = connection.cursor()
        sql_str = "SELECT A." + lstName1 + "_id, B." + lstName2 + "_id, A.doc_id FROM datamng_" + lstName1 + "doc as A, datamng_" + lstName2 + "doc as B where A.doc_id = B.doc_id order by A."+ lstName1 + "_id"
        cursor.execute(sql_str)
        relation_table_rows = cursor.fetchall()

        for row in relation_table_rows:
            obj1ID = lstName1 + "_" + str(row[0])
            obj2ID = lstName2 + "_" + str(row[1])

            if (obj1ID > obj2ID):
                lnk = obj1ID + "__" + obj2ID
            else:
                lnk = obj2ID + "__" + obj1ID
            lstRelations.append({"oriLinkID": lnk, "obj1": obj1ID, "obj2": obj2ID, "docID": "Doc_" + str(row[2])})
    
    return lstRelations

    
def getListDict(tableLeft, table, tableRight, leftClusCols, biclusDict):
    '''
    Generate list items and clusters based on list name, the name of left list, 
    and the name of right list
    @param tableLeft: left list name
    @param table: the current list name
    @param tableRight: right list name
    ''' 
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
                table1_item_dict[row[0]]['entVisualOrder'] = 0
                table1_item_dict[row[0]]['entSortedBy'] = "alph"
                table1_item_dict[row[0]]['bicSetsLeft'] = []
                table1_item_dict[row[0]]['bicSetsRight'] = []
                table1_item_dict[row[0]]['numGroupsSelected'] = 0    # entSelected
                table1_item_dict[row[0]]['numCoSelected'] = 0
                table1_item_dict[row[0]]['selected'] = False
                table1_item_dict[row[0]]['mouseovered'] = False
                table1_item_dict[row[0]]['entType'] = table
                table1_item_dict[row[0]]['entityIDCmp'] = str(table) + "_" + str(row[0])
                table1_item_dict[row[0]]['xPos'] = 0
                table1_item_dict[row[0]]['yPos'] = 0
    else:
        return None, None
    
    #retrieve biset list
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
            # retrieve data from cluster col for field1
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
                    biclusDict[row[2]]['bicIDCmp'] = str(table) + "_" + str(tableRight) + "_bic_" + str(row[2])
                    biclusDict[row[2]]['bicID'] = row[2]
                    biclusDict[row[2]]['docs'] = []
                    biclusDict[row[2]]['bicSelected'] = False
                    biclusDict[row[2]]['bicMouseOvered'] = False
                    biclusDict[row[2]]['bicNumCoSelected'] = 0
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
            
            # removing id from the list item dictionary
            removedKeyList = []
            for key, val in table1_item_dict.iteritems():
                removedKeyList.append(val)
                
            
            newlist = sorted(removedKeyList, key=lambda k: k['entFreq'], reverse=True)
            
            index = 0
            for item in newlist:
                #print index, item
                item['index'] = index
                index += 1
            return newlist, t1_t2_ClusCols
    else:
        # adding col list to list items.
        for col in leftClusCols:
                if not col[1] in table1_item_dict:
                    print "Bug here, at line 454"
                else:
                    table1_item_dict[col[1]]['bicSetsLeft'].append(col[2]);
        
        # removing id from the list item dictionary
        removedKeyList = []
        for key, val in table1_item_dict.iteritems():
            removedKeyList.append(val)
            
        newlist = sorted(removedKeyList, key=lambda k: k['entFreq'], reverse=True)
            
        index = 0
        for item in newlist:
            #print index, item
            item['index'] = index
            index += 1    
        return newlist, None 
        
    return None, None