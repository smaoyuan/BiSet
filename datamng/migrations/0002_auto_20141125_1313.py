# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='persondoc',
            name='doc_id',
        ),
        migrations.DeleteModel(
            name='PersonDoc',
        ),
        migrations.RenameField(
            model_name='docname',
            old_name='docName',
            new_name='doc_name',
        ),
    ]
