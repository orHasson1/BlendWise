from django.core.management.base import BaseCommand
from api.models import NoteType, AromaFamily, Vibe, EssentialOil

NOTE_TYPES = ["top", "middle", "base"]
AROMAS = ["citrus", "floral", "herbal", "woody", "spicy", "resin", "minty"]
VIBES = ["relaxation", "uplifting", "grounding", "invigorating", "soothing", "respiratory", "sleep", "focus", "immune", "aphrodisiac"]

# Minimal sample oils mapping to some attributes
SAMPLE_OILS = [
    {
        "name": "Lemon",
        "notes": ["top"],
        "aromas": ["citrus"],
        "vibes": ["uplifting", "focus"]
    },
    {
        "name": "Lavender",
        "notes": ["middle"],
        "aromas": ["floral"],
        "vibes": ["relaxation", "sleep", "soothing"]
    },
    {
        "name": "Peppermint",
        "notes": ["top"],
        "aromas": ["minty"],
        "vibes": ["invigorating", "respiratory", "focus"]
    },
    {
        "name": "Frankincense",
        "notes": ["base"],
        "aromas": ["resin"],
        "vibes": ["grounding", "immune"]
    },
]

class Command(BaseCommand):
    help = "Seed base NoteType, AromaFamily, Vibe, and sample EssentialOil entries"

    def handle(self, *args, **options):
        created_counts = {"notes":0, "aromas":0, "vibes":0, "oils":0}

        for n in NOTE_TYPES:
            _, created = NoteType.objects.get_or_create(name=n)
            if created: created_counts["notes"] += 1
        for a in AROMAS:
            _, created = AromaFamily.objects.get_or_create(name=a)
            if created: created_counts["aromas"] += 1
        for v in VIBES:
            _, created = Vibe.objects.get_or_create(name=v)
            if created: created_counts["vibes"] += 1

        for data in SAMPLE_OILS:
            oil, created = EssentialOil.objects.get_or_create(name=data["name"])
            if created: created_counts["oils"] += 1
            # Attach M2M relations
            for note in data["notes"]:
                oil.notes.add(NoteType.objects.get(name=note))
            for aroma in data["aromas"]:
                oil.aromas.add(AromaFamily.objects.get(name=aroma))
            for vibe in data["vibes"]:
                oil.vibes.add(Vibe.objects.get(name=vibe))

        self.stdout.write(self.style.SUCCESS(
            f"Seed complete: {created_counts['notes']} notes, {created_counts['aromas']} aromas, {created_counts['vibes']} vibes, {created_counts['oils']} oils created (duplicates skipped)."
        ))
