from rest_framework import serializers
from django.contrib.auth.models import User
from .models import EssentialOil, Blend, BlendIngredient, NoteType, AromaFamily, Vibe, UserOilRelation, UserBlendFavorite

class NoteTypeSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField(read_only=True)

    def get_label(self, obj):
        return obj.get_name_display()
    class Meta:
        model = NoteType
        fields = ["id", "name", "label"]

class AromaFamilySerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField(read_only=True)

    def get_label(self, obj):
        # get_name_display returns the human-friendly choice label
        return obj.get_name_display()
    class Meta:
        model = AromaFamily
        fields = ["id", "name", "label"]

class VibeSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField(read_only=True)

    def get_label(self, obj):
        return obj.get_name_display()
    class Meta:
        model = Vibe
        fields = ["id", "name", "label"]

class EssentialOilSerializer(serializers.ModelSerializer):
    notes = serializers.PrimaryKeyRelatedField(queryset=NoteType.objects.all(), many=True)
    aromas = serializers.PrimaryKeyRelatedField(queryset=AromaFamily.objects.all(), many=True)
    vibes = serializers.PrimaryKeyRelatedField(queryset=Vibe.objects.all(), many=True)

    class Meta:
        model = EssentialOil
        fields = ["id", "name", "notes", "aromas", "vibes"]

    def validate(self, data):
        if not data.get('notes') or len(data['notes']) == 0:
            raise serializers.ValidationError({'notes': 'At least one note is required.'})
        if not data.get('aromas') or len(data['aromas']) == 0:
            raise serializers.ValidationError({'aromas': 'At least one aroma is required.'})
        if not data.get('vibes') or len(data['vibes']) == 0:
            raise serializers.ValidationError({'vibes': 'At least one vibe is required.'})
        return data

    def create(self, validated_data):
        notes = validated_data.pop('notes')
        aromas = validated_data.pop('aromas')
        vibes = validated_data.pop('vibes')
        oil = EssentialOil.objects.create(**validated_data)
        oil.notes.set(notes)
        oil.aromas.set(aromas)
        oil.vibes.set(vibes)
        return oil

    def update(self, instance, validated_data):
        notes = validated_data.pop('notes', None)
        aromas = validated_data.pop('aromas', None)
        vibes = validated_data.pop('vibes', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if notes is not None:
            instance.notes.set(notes)
        if aromas is not None:
            instance.aromas.set(aromas)
        if vibes is not None:
            instance.vibes.set(vibes)
        return instance

class BlendIngredientSerializer(serializers.ModelSerializer):
    oil = EssentialOilSerializer(read_only=True)
    note = NoteTypeSerializer(read_only=True)
    oil_id = serializers.PrimaryKeyRelatedField(queryset=EssentialOil.objects.all(), source='oil', write_only=True)
    note_id = serializers.PrimaryKeyRelatedField(queryset=NoteType.objects.all(), source='note', write_only=True)

    class Meta:
        model = BlendIngredient
        fields = ["id", "oil", "oil_id", "drops", "note", "note_id"]
        read_only_fields = ["id", "oil", "note"]

    def validate_drops(self, value):
        if value < 1:
            raise serializers.ValidationError("Drops must be at least 1")
        return value

    def validate(self, data):
        # Ensure note provided (will be in data via note_id mapping to note)
        if 'note' not in data or data['note'] is None:
            raise serializers.ValidationError({'note_id': 'A note (top/middle/base) is required for each ingredient.'})
        return data

class BlendSerializer(serializers.ModelSerializer):
    oils = EssentialOilSerializer(many=True, read_only=True)
    created_by = serializers.ReadOnlyField(source="created_by.username")
    is_public = serializers.BooleanField(required=False)
    # Writable list of ingredient objects for creation/update
    ingredients = BlendIngredientSerializer(many=True, write_only=True, required=True)
    # Read-only expanded ingredients list
    ingredients_detail = BlendIngredientSerializer(source='blendingredient_set', many=True, read_only=True)

    class Meta:
        model = Blend
        fields = ["id", "name", "description", "oils", "ingredients", "ingredients_detail", "created_by", "is_public"]
        read_only_fields = ["id", "oils", "ingredients_detail", "created_by"]

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients')
        # 'created_by' is injected via serializer.save(created_by=...) in the view's perform_create,
        # so it is already present in validated_data. Passing it again would cause a duplicate kw error.
        blend = Blend.objects.create(**validated_data)
        for ing in ingredients_data:
            BlendIngredient.objects.create(blend=blend, **ing)
        return blend

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if ingredients_data is not None:
            # Replace existing ingredients; could be optimized later
            instance.blendingredient_set.all().delete()
            for ing in ingredients_data:
                BlendIngredient.objects.create(blend=instance, **ing)
        return instance


class UserOilRelationSerializer(serializers.ModelSerializer):
    oil = EssentialOilSerializer(read_only=True)
    oil_id = serializers.PrimaryKeyRelatedField(queryset=EssentialOil.objects.all(), source="oil", write_only=True)

    class Meta:
        model = UserOilRelation
        fields = ["id", "oil", "oil_id", "list_type", "created_at"]
        read_only_fields = ["id", "created_at", "oil"]

    def create(self, validated_data):
        user = self.context['request'].user
        rel = UserOilRelation.objects.create(user=user, **validated_data)
        return rel

class UserBlendFavoriteSerializer(serializers.ModelSerializer):
    blend = BlendSerializer(read_only=True)
    blend_id = serializers.PrimaryKeyRelatedField(queryset=Blend.objects.all(), source='blend', write_only=True)

    class Meta:
        model = UserBlendFavorite
        fields = ["id", "blend", "blend_id", "created_at"]
        read_only_fields = ["id", "created_at", "blend"]

    def create(self, validated_data):
        user = self.context['request'].user
        fav = UserBlendFavorite.objects.create(user=user, **validated_data)
        return fav


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)   # password will not be returned
    email = serializers.EmailField(required=True)       # email is required
    username = serializers.CharField(required=True)     # username is required

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # create_user hashes the password automatically
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

class BlendSummarySerializer(serializers.ModelSerializer):
    note_distribution = serializers.SerializerMethodField()
    total_drops = serializers.SerializerMethodField()
    oil_count = serializers.SerializerMethodField()
    favorites_count = serializers.SerializerMethodField()
    creator_username = serializers.ReadOnlyField(source='created_by.username')
    user_has_favorited = serializers.SerializerMethodField()
    top_vibes = serializers.SerializerMethodField()

    class Meta:
        model = Blend
        fields = [
            'id', 'name', 'note_distribution', 'total_drops', 'oil_count',
            'favorites_count', 'is_public', 'creator_username', 'user_has_favorited', 'top_vibes'
        ]

    def get_note_distribution(self, obj):
        total = 0
        buckets = {'top': 0, 'middle': 0, 'base': 0}
        # Assumes note.name holds 'top'|'middle'|'base'
        for ing in obj.blendingredient_set.all():
            if ing.note and ing.note.name in buckets:
                buckets[ing.note.name] += ing.drops
                total += ing.drops
        if total == 0:
            return {'top_pct': 0, 'middle_pct': 0, 'base_pct': 0}
        return {
            'top_pct': round(buckets['top'] / total * 100),
            'middle_pct': round(buckets['middle'] / total * 100),
            'base_pct': round(buckets['base'] / total * 100)
        }

    def get_total_drops(self, obj):
        return sum(ing.drops for ing in obj.blendingredient_set.all())

    def get_oil_count(self, obj):
        return obj.blendingredient_set.count()

    def get_favorites_count(self, obj):
        return obj.favorited_by.count()

    def get_user_has_favorited(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False
        return obj.favorited_by.filter(user=user).exists()

    def get_top_vibes(self, obj):
        # Aggregate vibes from each ingredient's oil weighted by drops
        vibe_weights = {}
        for ing in obj.blendingredient_set.select_related('oil').all():
            oil = ing.oil
            # oil.vibes is a m2m (prefetched not guaranteed here). For performance, could prefetch in view.
            for vibe in oil.vibes.all():
                vibe_weights[vibe.id] = vibe_weights.get(vibe.id, 0) + ing.drops
        if not vibe_weights:
            return []
        # Sort by total drops descending; take top 3
        top_ids = sorted(vibe_weights.items(), key=lambda kv: kv[1], reverse=True)[:3]
        # Map to label (display name) using DB query (small set) or existing cache
        vibes = Vibe.objects.filter(id__in=[vid for vid, _ in top_ids])
        label_map = {v.id: v.get_name_display() for v in vibes}
        result = []
        for vid, weight in top_ids:
            total_weight = sum(vibe_weights.values())
            pct = round(weight / total_weight * 100) if total_weight else 0
            result.append({'id': vid, 'label': label_map.get(vid, str(vid)), 'weight': weight, 'pct': pct})
        return result

