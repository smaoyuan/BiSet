
import connectMturk as mtconnection

import mturk_getallreviewablehits as getAllHits

mtc = mtconnection.mtc

allHits = getAllHits.get_all_reviewable_hits(mtc)

print('how many hits in allHits')
print(len(allHits))

## todo get hit content
print('------before looping through allHits')
for hit in allHits:
    assignments=mtc.get_assignments(hit.HITId)
    print(hit)
    print(hit.HITId)

    print('assignments in a hit:')
    print(assignments)

    dir(assignments)

    # print(assignments.Request)
    # print(assignments.Assignment)
    # print(assignments.HIT)


    for assignment in assignments:
        print("Answers of the worker %s" % assignment.WorkerId)
        for question_form_answer in assignment.answers[0]:
            # for key, value in question_form_answer.fields:
            #     print "%s: %s" % (key,value)
            #     print(value)
            for value in question_form_answer.fields:
                print(value)


        print ("--------------------")
print('------after looping through allHits')

