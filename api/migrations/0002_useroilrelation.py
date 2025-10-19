from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserOilRelation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('list_type', models.CharField(choices=[('wishlist', 'Wishlist'), ('owned', 'Owned')], max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('oil', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_relations', to='api.essentialoil')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='oil_relations', to=settings.AUTH_USER_MODEL)),
            ],
            options={'unique_together': {('user', 'oil', 'list_type')}},
        ),
        migrations.AddIndex(
            model_name='useroilrelation',
            index=models.Index(fields=['user', 'list_type'], name='api_useroil_user_id__5afb66_idx'),
        ),
    ]
