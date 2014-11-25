# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0004_auto_20141125_1334'),
    ]

    operations = [
        migrations.CreateModel(
            name='DateDoc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date_string', models.CharField(unique=True, max_length=20)),
                ('date_count', models.IntegerField()),
                ('doc_id', models.ForeignKey(to='datamng.DocName')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='LocationDoc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('location_name', models.CharField(unique=True, max_length=50)),
                ('location_count', models.IntegerField()),
                ('doc_id', models.ForeignKey(to='datamng.DocName')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='MicDoc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('mic_string', models.CharField(unique=True, max_length=50)),
                ('mic_count', models.IntegerField()),
                ('doc_id', models.ForeignKey(to='datamng.DocName')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='MoneyDoc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('money_string', models.CharField(unique=True, max_length=50)),
                ('money_count', models.IntegerField()),
                ('doc_id', models.ForeignKey(to='datamng.DocName')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='OrgDoc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('org_name', models.CharField(unique=True, max_length=50)),
                ('org_count', models.IntegerField()),
                ('doc_id', models.ForeignKey(to='datamng.DocName')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='PhoneDoc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('phone_number', models.CharField(unique=True, max_length=20)),
                ('phone_count', models.IntegerField()),
                ('doc_id', models.ForeignKey(to='datamng.DocName')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='persondoc',
            name='doc_id',
            field=models.ForeignKey(to='datamng.DocName'),
            preserve_default=True,
        ),
    ]
