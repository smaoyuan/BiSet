# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vis', '0002_vis_create_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='visnodes',
            name='svgX',
            field=models.FloatField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='visnodes',
            name='svgY',
            field=models.FloatField(default=0),
            preserve_default=True,
        ),
    ]
