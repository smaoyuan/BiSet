# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('vis', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='vis',
            name='create_time',
            field=models.DateTimeField(default=datetime.date(2014, 12, 1), verbose_name=b'date published'),
            preserve_default=False,
        ),
    ]
