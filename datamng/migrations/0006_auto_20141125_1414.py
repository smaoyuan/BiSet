# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0005_auto_20141125_1403'),
    ]

    operations = [
        migrations.CreateModel(
            name='Date',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date_string', models.CharField(unique=True, max_length=20)),
                ('date_count', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('location_name', models.CharField(unique=True, max_length=50)),
                ('location_count', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Mic',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('mic_string', models.CharField(unique=True, max_length=50)),
                ('mic_count', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Money',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('money_string', models.CharField(unique=True, max_length=50)),
                ('money_count', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Org',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('org_name', models.CharField(unique=True, max_length=50)),
                ('org_count', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('person_name', models.CharField(unique=True, max_length=50)),
                ('person_count', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Phone',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('phone_number', models.CharField(unique=True, max_length=20)),
                ('phone_count', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='datedoc',
            name='date_count',
        ),
        migrations.RemoveField(
            model_name='locationdoc',
            name='location_count',
        ),
        migrations.RemoveField(
            model_name='micdoc',
            name='mic_count',
        ),
        migrations.RemoveField(
            model_name='moneydoc',
            name='money_count',
        ),
        migrations.RemoveField(
            model_name='orgdoc',
            name='org_count',
        ),
        migrations.RemoveField(
            model_name='persondoc',
            name='person_count',
        ),
        migrations.RemoveField(
            model_name='phonedoc',
            name='phone_count',
        ),
        migrations.AlterField(
            model_name='datedoc',
            name='date_string',
            field=models.ForeignKey(to='datamng.Date'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='locationdoc',
            name='doc_id',
            field=models.ForeignKey(to='datamng.DocName'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='locationdoc',
            name='location_name',
            field=models.ForeignKey(to='datamng.Location'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='micdoc',
            name='mic_string',
            field=models.ForeignKey(to='datamng.Mic'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='moneydoc',
            name='doc_id',
            field=models.ForeignKey(to='datamng.DocName'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='moneydoc',
            name='money_string',
            field=models.ForeignKey(to='datamng.Money'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='orgdoc',
            name='org_name',
            field=models.ForeignKey(to='datamng.Org'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='persondoc',
            name='person_name',
            field=models.ForeignKey(to='datamng.Person'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='phonedoc',
            name='phone_number',
            field=models.ForeignKey(to='datamng.Phone'),
            preserve_default=True,
        ),
    ]
