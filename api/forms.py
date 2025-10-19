from django import forms
from django.core.exceptions import ValidationError
from .models import EssentialOil

class EssentialOilAdminForm(forms.ModelForm):
    def clean_name(self):
        name = self.cleaned_data.get('name')
        # The RegexValidator on the model will raise ValidationError if invalid, but we can add a friendlier message here if needed
        import re
        pattern = r'^[A-Z][a-z]*( [A-Za-z]+)*(, [A-Za-z]+)?( \([A-Za-z ]+\))?$'
        if name and not re.match(pattern, name):
            raise ValidationError(
                'Name must start with a capitalized word, subsequent words (including after a comma) can start with uppercase or lowercase letters, and may optionally end with a parenthetical (no nested parentheses).'
            )
        return name
    class Meta:
        model = EssentialOil
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        notes = cleaned_data.get('notes')
        aromas = cleaned_data.get('aromas')
        vibes = cleaned_data.get('vibes')
        if not notes or notes.count() == 0:
            raise ValidationError({'notes': 'At least one note is required.'})
        if not aromas or aromas.count() == 0:
            raise ValidationError({'aromas': 'At least one aroma is required.'})
        if not vibes or vibes.count() == 0:
            raise ValidationError({'vibes': 'At least one vibe is required.'})
        return cleaned_data
