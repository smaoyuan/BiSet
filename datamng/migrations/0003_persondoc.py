# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0002_auto_20141125_1313'),
    ]

    operations = [
        migrations.CreateModel(
            name='PersonDoc',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('person_name', models.CharField(unique=True, max_length=50)),
                ('person_count', models.IntegerField()),
                ('doc_id', models.ForeignKey(to='datamng.DocName')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
