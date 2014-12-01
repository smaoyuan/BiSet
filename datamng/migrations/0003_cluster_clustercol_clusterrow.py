# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0002_auto_20141125_1559'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cluster',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('field1', models.CharField(max_length=50)),
                ('field2', models.CharField(max_length=50)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ClusterCol',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('cid', models.IntegerField(default=0)),
                ('cluster', models.ForeignKey(to='datamng.Cluster')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ClusterRow',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('rid', models.IntegerField(default=0)),
                ('cluster', models.ForeignKey(to='datamng.Cluster')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
