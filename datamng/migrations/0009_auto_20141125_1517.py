# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0008_auto_20141125_1425'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locationdoc',
            name='doc_id',
            field=models.ForeignKey(to='datamng.DocName'),
            preserve_default=True,
        ),
    ]
