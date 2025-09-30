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
                regex=r'^[A-Z][a-z]*( [A-Z][a-z]*)*$',
                message='Name must contain only capitalized English words separated by single spaces.'
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

    def __str__(self):
        return self.name

class BlendIngredient(models.Model):
    class Meta:
        unique_together = ('blend', 'oil') 

    blend = models.ForeignKey(Blend, on_delete=models.CASCADE)
    oil = models.ForeignKey(EssentialOil, on_delete=models.CASCADE)
    drops = models.PositiveIntegerField(default=1)


# OPTIONAL NEXT STEP: calculate the top aromas and vibes for a Blend based on its blend ingredients.