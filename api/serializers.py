from rest_framework import serializers
from django.contrib.auth.models import User
from .models import EssentialOil, Blend, BlendIngredient, NoteType, AromaFamily, Vibe, UserOilRelation

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

    class Meta:
        model = BlendIngredient
        fields = ["id", "oil", "drops"]

class BlendSerializer(serializers.ModelSerializer):
    oils = EssentialOilSerializer(many=True, read_only=True)
    created_by = serializers.ReadOnlyField(source="created_by.username")
    is_public = serializers.BooleanField(required=False)

    class Meta:
        model = Blend
        fields = ["id", "name", "description", "oils", "created_by", "is_public"]


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
    
    