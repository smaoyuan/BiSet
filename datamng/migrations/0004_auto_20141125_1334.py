# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0003_persondoc'),
    ]

    operations = [
        migrations.AlterField(
            model_name='persondoc',
            name='doc_id',
            field=models.ForeignKey(to='datamng.DocName'),
            preserve_default=True,
        ),
    ]
