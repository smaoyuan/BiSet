# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DataSet',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('create_time', models.DateTimeField(verbose_name=b'date published')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Doc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('people', models.CharField(max_length=200)),
                ('location', models.CharField(max_length=200)),
                ('phone', models.CharField(max_length=200)),
                ('organization', models.CharField(max_length=200)),
                ('misc', models.CharField(max_length=200)),
                ('text', models.TextField()),
                ('dataset', models.ForeignKey(to='dataset.DataSet')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
