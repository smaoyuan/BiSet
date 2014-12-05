# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dataset', '0001_initial'),
        ('datamng', '0003_cluster_clustercol_clusterrow'),
    ]

    operations = [
        migrations.AddField(
            model_name='docname',
            name='dataset',
            field=models.ForeignKey(default=1, to='dataset.DataSet'),
            preserve_default=False,
        ),
    ]
