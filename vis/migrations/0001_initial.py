# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Vis',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('personIn', models.BooleanField(default=0)),
                ('locationIn', models.BooleanField(default=0)),
                ('phoneIn', models.BooleanField(default=0)),
                ('dateIn', models.BooleanField(default=0)),
                ('orgIn', models.BooleanField(default=0)),
                ('miscIn', models.BooleanField(default=0)),
                ('project', models.ForeignKey(to='projects.Project')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='VisNodes',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('nodeType', models.CharField(max_length=50)),
                ('nodeId', models.IntegerField()),
                ('vis', models.ForeignKey(to='vis.Vis')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
