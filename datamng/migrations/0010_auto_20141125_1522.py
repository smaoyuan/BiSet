# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datamng', '0009_auto_20141125_1517'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Mic',
            new_name='Misc',
        ),
        migrations.RenameModel(
            old_name='MicDoc',
            new_name='MiscDoc',
        ),
        migrations.RenameField(
            model_name='misc',
            old_name='mic_count',
            new_name='misc_count',
        ),
        migrations.RenameField(
            model_name='misc',
            old_name='mic_string',
            new_name='misc_string',
        ),
        migrations.RenameField(
            model_name='miscdoc',
            old_name='mic_string',
            new_name='misc_string',
        ),
        migrations.AlterField(
            model_name='locationdoc',
            name='doc_id',
            field=models.ForeignKey(to='datamng.DocName'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='moneydoc',
            name='doc_id',
            field=models.ForeignKey(to='datamng.DocName'),
            preserve_default=True,
        ),
    ]
