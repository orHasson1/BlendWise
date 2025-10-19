from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

class NoteType(models.Model):
    NOTE_CHOICES = (
        ("top", "Top"),
        ("middle", "Middle"),
        ("base", "Base"),
    )
    name = models.CharField(max_length=20, choices=NOTE_CHOICES, unique=True)

    def __str__(self):
        return self.get_name_display()
    
class AromaFamily(models.Model):
    AROMA_CHOICES = (
        ("citrus", "Citrus/Fresh"),
        ("floral", "Floral"),
        ("herbal", "Herbal/Green"),
        ("woody", "Woody/Earthy"),
        ("spicy", "Spicy/Warm"),
        ("resin", "Resin/Balsamic"),
        ("minty", "Camphoraceous/Minty"),
    )
    name = models.CharField(max_length=50, choices=AROMA_CHOICES, unique=True)

    def __str__(self):
        return dict(self.AROMA_CHOICES)[self.name]
    
class Vibe(models.Model):
    VIBES_CHOICES = (
        ("relaxation", "Relaxation / Calming / Stress Relief"),
        ("uplifting", "Uplifting / Energizing / Mood Boost"),
        ("grounding", "Grounding / Centering / Meditative"),
        ("invigorating", "Invigorating / Stimulating / Refreshing"),
        ("soothing", "Soothing / Comforting / Emotional Support"),
        ("respiratory", "Respiratory / Clearing / Sinus Support"),
        ("sleep", "Sleep / Sedative"),
        ("focus", "Focus / Concentration / Mental Clarity"),
        ("immune", "Immune Support / Cleansing / Antimicrobial"),
        ("aphrodisiac", "Aphrodisiac / Sensual / Romantic"),
    )
    name = models.CharField(max_length=50, choices= VIBES_CHOICES, unique=True)

    def __str__(self):
        return self.get_name_display()

class EssentialOil(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        validators=[
            RegexValidator(
                regex=(
                    r'^[A-Z][a-z]*'
                    r'( [A-Za-z]+)*'
                    r'(, [A-Za-z]+)?'
                    r'( \([A-Za-z ]+\))?$'
                ),
                message=(
                    'Name must start with a capitalized word, subsequent words '
                    '(including after a comma) can start with uppercase or lowercase letters, '
                    'and may optionally end with a parenthetical (no nested parentheses).'
                )
            )
        ]
    )
    notes = models.ManyToManyField(NoteType, blank=True)
    aromas = models.ManyToManyField(AromaFamily, blank=True)
    vibes = models.ManyToManyField(Vibe, blank=True)

    def __str__(self):
        return self.name

class Blend(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    oils = models.ManyToManyField(EssentialOil, through="BlendIngredient")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blends")
    is_public = models.BooleanField(default=True, help_text="If false, only the creator can see this blend.")

    def __str__(self):
        return self.name

class BlendIngredient(models.Model):
    class Meta:
        unique_together = ('blend', 'oil') 

    blend = models.ForeignKey(Blend, on_delete=models.CASCADE)
    oil = models.ForeignKey(EssentialOil, on_delete=models.CASCADE)
    drops = models.PositiveIntegerField(default=1)


# OPTIONAL NEXT STEP: calculate the top aromas and vibes for a Blend based on its blend ingredients.

class UserOilRelation(models.Model):
    """Stores per-user classification of an oil as wishlist or owned.

    A single oil cannot be simultaneously in both lists for the same user; we enforce this
    at save time by deleting the opposite relation if it exists.
    """
    LIST_TYPES = (
        ("wishlist", "Wishlist"),
        ("owned", "Owned"),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="oil_relations")
    oil = models.ForeignKey(EssentialOil, on_delete=models.CASCADE, related_name="user_relations")
    list_type = models.CharField(max_length=10, choices=LIST_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "oil", "list_type")
        indexes = [
            models.Index(fields=["user", "list_type"]),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Remove opposite list type if it exists to keep mutual exclusivity
        opposite = "owned" if self.list_type == "wishlist" else "wishlist"
        UserOilRelation.objects.filter(user=self.user, oil=self.oil, list_type=opposite).delete()

    def __str__(self):
        return f"{self.user.username} -> {self.oil.name} ({self.list_type})"