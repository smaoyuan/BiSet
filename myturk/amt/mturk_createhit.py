
import connectMturk as mtconnection

from boto.mturk.question import QuestionContent,Question,QuestionForm,Overview,AnswerSpecification,SelectionAnswer,FormattedContent,FreeTextAnswer
 
 
title = 'What is the plan'
description = ('Visit a website and give us your opinion about'
               ' the design and also some personal comments')
keywords = 'website, rating, opinions'
 
ratings =[('Very Bad','-2'),
         ('Bad','-1'),
         ('Not bad','0'),
         ('Good','1'),
         ('Very Good','1')]
 
#---------------  BUILD OVERVIEW -------------------
 
overview = Overview()
overview.append_field('Title', 'Give your adfadfadfadfafafafadsf')
overview.append(FormattedContent('<a target="_blank"'
                                 ' href="http://www.vt.edu">'
                                 ' The virginia tech website</a>'))
 
#---------------  BUILD QUESTION 1 -------------------
 
qc1 = QuestionContent()
qc1.append_field('Title','Whare is the time that people will take important action?')
 
fta1 = SelectionAnswer(min=1, max=1,style='dropdown',
                      selections=ratings,
                      type='text',
                      other=False)
 
q1 = Question(identifier='Time',
              content=qc1,
              answer_spec=AnswerSpecification(fta1),
              is_required=True)
 
#---------------  BUILD QUESTION 2 -------------------
 
qc2 = QuestionContent()
qc2.append_field('Title','What is the plan?')
 
fta2 = FreeTextAnswer()
 
q2 = Question(identifier="comments",
              content=qc2,
              answer_spec=AnswerSpecification(fta2))
 
#--------------- BUILD THE QUESTION FORM -------------------
 
question_form = QuestionForm()
question_form.append(overview)
question_form.append(q1)
question_form.append(q2)
 
#--------------- CREATE THE HIT -------------------
 
creathitReturnValue = mtconnection.mtc.create_hit(questions=question_form,
									               max_assignments=10,
									               title=title,
									               description=description,
									               keywords=keywords,
									               duration = 60*5,
									               reward=0.05)

print(creathitReturnValue)