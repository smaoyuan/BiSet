# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vis', '0004_visnodes_modifyby'),
    ]

    operations = [
        migrations.AddField(
            model_name='vis',
            name='name',
            field=models.CharField(default='test', max_length=50),
            preserve_default=False,
        ),
    ]
