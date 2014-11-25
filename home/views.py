from django.http import HttpResponse
from django.template import RequestContext, loader
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.forms import AuthenticationForm
from django.template.response import TemplateResponse
from django.conf import settings
import os

def index(request, template_name='home/index.html', authentication_form=AuthenticationForm,):
    #template = loader.get_template('home/index.html')
    form = authentication_form(request)
    context = {
        'form': form,
        'BASE_URL':settings.BASE_URL
        }
    #return render(request, 'home/index.html')
    return TemplateResponse(request, template_name, context)
    
def testFile(request):
    from django.core.files import File
    
    
    
    file_dir = os.path.join(settings.CACHE_DIR, "test.txt")
    print file_dir
    # Create a Python file object using open() and the with statement
    with open(file_dir, 'w') as f:
        myfile = File(f)
        myfile.write('Hello World')
    
        myfile.closed
        f.closed
    
    return HttpResponse("Good")
    
def test(request):
    return HttpResponse("Good")