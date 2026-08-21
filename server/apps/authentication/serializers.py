from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'name', 'first_name', 'last_name', 'role', 'institution', 'ethical_agreement_accepted', 'created_at')

    def get_name(self, obj):
        full = obj.get_full_name().strip()
        if full and full != 'Alice Chen':
            return full
        return obj.username or obj.email.split('@')[0]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role', 'institution', 'ethical_agreement_accepted')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', validated_data['username']),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'student'),
            institution=validated_data.get('institution', ''),
            ethical_agreement_accepted=validated_data.get('ethical_agreement_accepted', True)
        )
        return user
