from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password


class Command(BaseCommand):
    help = "Create or update a development user (username=dev, password=devpass)."

    def handle(self, *args, **options):
        User = get_user_model()
        user, created = User.objects.get_or_create(username='dev', defaults={'password': make_password('devpass')})
        if not created:
            user.password = make_password('devpass')
            user.save()
        self.stdout.write(self.style.SUCCESS(f"Dev user ready. username=dev password=devpass (created={created})."))