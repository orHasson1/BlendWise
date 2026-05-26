from django.core.management.base import BaseCommand
from api.models import NoteType, AromaFamily, Vibe, EssentialOil

NOTE_TYPES = ["top", "middle", "base"]
AROMAS = ["citrus", "floral", "herbal", "woody", "spicy", "resin", "minty"]
VIBES = ["relaxation", "uplifting", "grounding", "invigorating", "soothing", "respiratory", "sleep", "focus", "immune", "aphrodisiac"]

SAMPLE_OILS = [
    {"name": "African Sandalwood", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["relaxation", "grounding", "soothing"]},
    {"name": "Agarwood", "notes": ["base"], "aromas": ["woody", "spicy", "resin"], "vibes": ["aphrodisiac", "relaxation", "grounding"]},
    {"name": "Allspice", "notes": ["middle", "base"], "aromas": ["woody", "spicy"], "vibes": ["invigorating", "uplifting"]},
    {"name": "Aloeswood", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["aphrodisiac", "grounding"]},
    {"name": "Ambrette Seed Absolute", "notes": ["middle"], "aromas": ["floral", "woody"], "vibes": ["aphrodisiac", "grounding", "soothing"]},
    {"name": "Amyris", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["relaxation", "grounding", "soothing"]},
    {"name": "Angelica Root", "notes": ["middle", "base"], "aromas": ["herbal", "woody"], "vibes": ["relaxation", "grounding"]},
    {"name": "Anise", "notes": ["top", "middle"], "aromas": ["herbal", "spicy"], "vibes": ["invigorating", "uplifting"]},
    {"name": "Anise, Star", "notes": ["top", "middle"], "aromas": ["spicy", "resin"], "vibes": ["invigorating", "uplifting"]},
    {"name": "Anthopogon", "notes": ["middle", "base"], "aromas": ["herbal", "woody"], "vibes": ["relaxation", "grounding"]},
    {"name": "Atlas Cedarwood", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["relaxation", "grounding", "soothing"]},
    {"name": "Australian Sandalwood", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["relaxation", "grounding", "soothing"]},
    {"name": "Balsam Fir", "notes": ["middle", "base"], "aromas": ["herbal", "woody"], "vibes": ["respiratory", "relaxation", "soothing"]},
    {"name": "Balsam, Peru", "notes": ["base"], "aromas": ["spicy", "resin"], "vibes": ["immune", "soothing", "relaxation"]},
    {"name": "Basil", "notes": ["middle"], "aromas": ["herbal"], "vibes": ["focus", "uplifting"]},
    {"name": "Basil, Holy", "notes": ["middle"], "aromas": ["herbal"], "vibes": ["relaxation", "grounding"]},
    {"name": "Bay", "notes": ["middle"], "aromas": ["herbal", "spicy"], "vibes": ["respiratory", "invigorating"]},
    {"name": "Bay Laurel", "notes": ["middle"], "aromas": ["herbal", "spicy"], "vibes": ["respiratory", "invigorating"]},
    {"name": "Beeswax Absolute", "notes": ["base"], "aromas": ["spicy", "resin"], "vibes": ["soothing"]},
    {"name": "Benzoin Absolute", "notes": ["base"], "aromas": ["spicy", "resin"], "vibes": ["soothing", "sleep"]},
    {"name": "Bergamot", "notes": ["top"], "aromas": ["citrus"], "vibes": ["uplifting", "relaxation"]},
    {"name": "Bergamot Mint", "notes": ["top"], "aromas": ["minty", "herbal", "citrus"], "vibes": ["invigorating", "uplifting"]},
    {"name": "Bitter Orange", "notes": ["top"], "aromas": ["citrus"], "vibes": ["uplifting", "relaxation"]},
    {"name": "Black Pepper", "notes": ["middle"], "aromas": ["spicy"], "vibes": ["invigorating", "focus"]},
    {"name": "Black Spruce", "notes": ["middle"], "aromas": ["woody", "resin"], "vibes": ["respiratory", "grounding"]},
    {"name": "Blood Orange", "notes": ["top"], "aromas": ["citrus"], "vibes": ["uplifting", "relaxation"]},
    {"name": "Blue Cypress", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["soothing", "grounding"]},
    {"name": "Blue Spruce", "notes": ["middle"], "aromas": ["woody", "resin"], "vibes": ["respiratory", "grounding"]},
    {"name": "Blue Tansy", "notes": ["middle"], "aromas": ["herbal", "floral"], "vibes": ["soothing", "relaxation"]},
    {"name": "Bois de Rose", "notes": ["middle"], "aromas": ["floral", "woody"], "vibes": ["aphrodisiac", "uplifting"]},
    {"name": "Boronia Absolute", "notes": ["middle"], "aromas": ["citrus", "floral"], "vibes": ["uplifting", "relaxation"]},
    {"name": "Buddha Wood", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["soothing", "grounding"]},
    {"name": "Bursera Graveolens", "notes": ["middle"], "aromas": [], "vibes": ["relaxation", "grounding"]},
    {"name": "Cade", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["soothing", "grounding"]},
    {"name": "Cajeput", "notes": ["top"], "aromas": ["minty", "herbal"], "vibes": ["respiratory", "invigorating"]},
    {"name": "Camphor, White", "notes": ["middle"], "aromas": ["minty", "woody"], "vibes": ["respiratory", "invigorating"]},
    {"name": "Cananga Ylang Ylang", "notes": ["middle"], "aromas": ["floral", "spicy"], "vibes": ["aphrodisiac", "relaxation"]},
    {"name": "Cannabis", "notes": ["middle"], "aromas": ["herbal", "woody"], "vibes": ["relaxation", "grounding"]},
    {"name": "Caraway Seed", "notes": ["middle"], "aromas": ["herbal", "spicy"], "vibes": ["invigorating", "focus"]},
    {"name": "Cardamom", "notes": ["middle"], "aromas": ["citrus", "spicy"], "vibes": ["invigorating", "uplifting"]},
    {"name": "Carrot Seed", "notes": ["base"], "aromas": ["herbal", "woody"], "vibes": ["relaxation", "grounding"]},
    {"name": "Cassia", "notes": ["middle"], "aromas": ["spicy"], "vibes": ["invigorating", "uplifting"]},
    {"name": "Catnip", "notes": ["top"], "aromas": ["herbal", "floral"], "vibes": ["uplifting", "relaxation"]},
    {"name": "Cedarwood, Atlas", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["relaxation", "grounding"]},
    {"name": "Cedarwood, Virginian", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["relaxation", "grounding"]},
    {"name": "Chamomile, German", "notes": ["middle"], "aromas": ["herbal", "floral"], "vibes": ["soothing", "relaxation"]},
    {"name": "Chamomile, Roman", "notes": ["middle"], "aromas": ["herbal", "floral"], "vibes": ["soothing", "relaxation"]},
    {"name": "Champaca White", "notes": ["middle"], "aromas": ["floral", "spicy"], "vibes": ["aphrodisiac", "uplifting"]},
    {"name": "Cilantro", "notes": ["top"], "aromas": ["herbal", "citrus"], "vibes": ["focus", "uplifting"]},
    {"name": "Cinnamon", "notes": ["middle"], "aromas": ["spicy"], "vibes": ["invigorating", "uplifting"]},
    {"name": "Cistus Labdanum", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["soothing", "grounding"]},
    {"name": "Citronella", "notes": ["top"], "aromas": ["herbal", "citrus"], "vibes": ["respiratory", "invigorating", "uplifting"]},
    {"name": "Clary Sage", "notes": ["middle"], "aromas": ["herbal", "floral"], "vibes": ["aphrodisiac", "relaxation"]},
    {"name": "Clove Bud", "notes": ["middle"], "aromas": ["spicy", "resin"], "vibes": ["immune", "invigorating", "focus"]},
    {"name": "Coffee", "notes": ["middle"], "aromas": ["woody", "spicy"], "vibes": ["invigorating", "focus"]},
    {"name": "Combava Petitgrain", "notes": ["top"], "aromas": ["herbal", "citrus"], "vibes": ["uplifting", "relaxation"]},
    {"name": "Common Sage", "notes": ["middle"], "aromas": ["minty", "herbal"], "vibes": ["respiratory", "focus"]},
    {"name": "Copaiba Balsam", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["soothing", "grounding"]},
    {"name": "Coriander", "notes": ["middle"], "aromas": ["herbal", "spicy", "citrus"], "vibes": ["focus", "uplifting"]},
    {"name": "Cornmint", "notes": ["top"], "aromas": ["minty", "herbal"], "vibes": ["respiratory", "invigorating", "focus"]},
    {"name": "Cubeb", "notes": ["middle"], "aromas": ["woody", "spicy"], "vibes": ["invigorating", "uplifting"]},
    {"name": "Cumin", "notes": ["middle"], "aromas": ["woody", "spicy"], "vibes": ["invigorating", "focus"]},
    {"name": "Cypress", "notes": ["middle"], "aromas": ["herbal", "woody"], "vibes": ["respiratory", "grounding"]},
    {"name": "Cypress, Blue", "notes": ["middle"], "aromas": ["herbal", "citrus", "woody"], "vibes": ["respiratory", "invigorating", "grounding"]},
    {"name": "Cypress, Japanese", "notes": ["middle"], "aromas": ["herbal", "citrus", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Cypress, Taiwan (Formosan)", "notes": ["middle"], "aromas": ["herbal", "citrus", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Dalmatian Sage", "notes": ["middle"], "aromas": ["herbal", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Davana", "notes": ["middle"], "aromas": ["floral", "spicy"], "vibes": ["aphrodisiac", "soothing", "uplifting"]},
    {"name": "Desert Rosewood", "notes": ["base"], "aromas": ["woody", "spicy"], "vibes": ["relaxation", "grounding"]},
    {"name": "Dill", "notes": ["top"], "aromas": ["herbal", "spicy"], "vibes": ["invigorating", "focus"]},
    {"name": "Douglas Fir", "notes": ["middle"], "aromas": ["herbal", "citrus", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "East Indian Sandalwood", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["relaxation", "grounding", "sleep"]},
    {"name": "Elemi", "notes": ["top"], "aromas": ["citrus", "spicy", "resin"], "vibes": ["immune", "respiratory", "uplifting"]},
    {"name": "Ericifolia", "notes": ["middle"], "aromas": ["minty", "herbal", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Eucalyptus Globulus", "notes": ["top"], "aromas": ["minty", "herbal"], "vibes": ["immune", "respiratory", "invigorating"]},
    {"name": "Eucalyptus Radiata", "notes": ["top"], "aromas": ["minty", "herbal"], "vibes": ["immune", "respiratory", "invigorating"]},
    {"name": "Eucalyptus Staigeriana", "notes": ["top"], "aromas": ["minty", "citrus"], "vibes": ["respiratory", "invigorating", "uplifting"]},
    {"name": "Eucalyptus, Lemon", "notes": ["top"], "aromas": ["minty", "citrus"], "vibes": ["respiratory", "invigorating", "uplifting"]},
    {"name": "Fennel", "notes": ["middle"], "aromas": ["herbal", "citrus", "spicy"], "vibes": ["focus", "uplifting"]},
    {"name": "Fir, Balsam", "notes": ["base"], "aromas": ["herbal", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Fir, Douglas", "notes": ["middle"], "aromas": ["herbal", "citrus", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Fir, Siberian", "notes": ["middle"], "aromas": ["herbal", "citrus", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Fir, Silver", "notes": ["middle"], "aromas": ["herbal", "citrus", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Fragonia", "notes": ["middle"], "aromas": ["herbal", "citrus", "floral"], "vibes": ["soothing", "uplifting", "relaxation"]},
    {"name": "Frankincense", "notes": ["base"], "aromas": ["woody", "spicy", "resin"], "vibes": ["immune", "relaxation", "grounding"]},
    {"name": "Galbanum", "notes": ["middle"], "aromas": ["herbal", "resin"], "vibes": ["immune", "relaxation", "grounding"]},
    {"name": "Geranium", "notes": ["middle"], "aromas": ["herbal", "floral"], "vibes": ["aphrodisiac", "soothing", "uplifting"]},
    {"name": "Geranium, Rose", "notes": ["middle"], "aromas": ["herbal", "floral"], "vibes": ["aphrodisiac", "soothing", "uplifting"]},
    {"name": "German Chamomile", "notes": ["middle"], "aromas": ["herbal", "floral", "spicy"], "vibes": ["soothing", "relaxation", "sleep"]},
    {"name": "Ginger", "notes": ["middle"], "aromas": ["citrus", "spicy"], "vibes": ["invigorating", "focus", "uplifting"]},
    {"name": "Goldenrod", "notes": ["middle"], "aromas": ["herbal", "floral"], "vibes": ["immune", "soothing", "relaxation"]},
    {"name": "Grapefruit", "notes": ["top"], "aromas": ["citrus"], "vibes": ["invigorating", "focus", "uplifting"]},
    {"name": "Greenland Moss", "notes": ["base"], "aromas": ["herbal", "woody"], "vibes": ["relaxation", "grounding"]},
    {"name": "Gurjum Balsam", "notes": ["base"], "aromas": ["woody", "resin"], "vibes": ["aphrodisiac", "relaxation", "grounding"]},
    {"name": "Helichrysum Gymnocephalum", "notes": ["middle"], "aromas": ["herbal", "floral", "spicy"], "vibes": ["immune", "soothing", "relaxation"]},
    {"name": "Helichrysum Italicum", "notes": ["middle"], "aromas": ["herbal", "floral", "spicy"], "vibes": ["immune", "soothing", "relaxation"]},
    {"name": "Hemlock Spruce", "notes": ["middle"], "aromas": ["herbal", "citrus", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Hemp", "notes": ["middle"], "aromas": ["herbal", "woody"], "vibes": ["soothing", "relaxation", "grounding"]},
    {"name": "Hinoki", "notes": ["base"], "aromas": ["herbal", "woody"], "vibes": ["relaxation", "grounding"]},
    {"name": "Hinoki, Taiwan", "notes": ["base"], "aromas": ["herbal", "woody"], "vibes": ["relaxation", "grounding", "sleep"]},
    {"name": "Ho Leaf", "notes": ["middle"], "aromas": ["minty", "woody"], "vibes": ["respiratory", "relaxation", "grounding"]},
    {"name": "Ho Wood", "notes": ["middle"], "aromas": ["floral", "woody"], "vibes": ["soothing", "relaxation", "grounding"]},
    {"name": "Lavender", "notes": ["middle"], "aromas": ["floral"], "vibes": ["relaxation", "sleep", "soothing"]},
    {"name": "Lemon", "notes": ["top"], "aromas": ["citrus"], "vibes": ["uplifting", "focus"]},
    {"name": "Peppermint", "notes": ["top"], "aromas": ["minty"], "vibes": ["invigorating", "respiratory", "focus"]},
]


class Command(BaseCommand):
    help = "Seed base NoteType, AromaFamily, Vibe, and all EssentialOil entries"

    def handle(self, *args, **options):
        created_counts = {"notes": 0, "aromas": 0, "vibes": 0, "oils": 0}

        for n in NOTE_TYPES:
            _, created = NoteType.objects.get_or_create(name=n)
            if created:
                created_counts["notes"] += 1
        for a in AROMAS:
            _, created = AromaFamily.objects.get_or_create(name=a)
            if created:
                created_counts["aromas"] += 1
        for v in VIBES:
            _, created = Vibe.objects.get_or_create(name=v)
            if created:
                created_counts["vibes"] += 1

        for data in SAMPLE_OILS:
            oil, created = EssentialOil.objects.get_or_create(name=data["name"])
            if created:
                created_counts["oils"] += 1
            # Attach M2M relations
            for note in data["notes"]:
                oil.notes.add(NoteType.objects.get(name=note))
            for aroma in data["aromas"]:
                oil.aromas.add(AromaFamily.objects.get(name=aroma))
            for vibe in data["vibes"]:
                oil.vibes.add(Vibe.objects.get(name=vibe))

        self.stdout.write(self.style.SUCCESS(
            f"Seed complete: {created_counts['notes']} notes, {created_counts['aromas']} aromas, "
            f"{created_counts['vibes']} vibes, {created_counts['oils']} oils created (duplicates skipped)."
        ))
