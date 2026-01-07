from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source='employer.name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user_type', 'phone', 'id_number', 'kra_pin',
            'alumni_school', 'graduation_year',
            'company_name', 'company_registration', 'company_address', 'job_title',
            'school_name', 'school_type', 'school_registration', 'school_address',
            'is_salaried_employee', 'employer', 'employer_name', 'staff_number'
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(
        choices=UserProfile.USER_TYPES,
        write_only=True,
        required=False,
        default='individual'
    )
    phone = serializers.CharField(write_only=True, required=False)
    is_salaried_employee = serializers.BooleanField(write_only=True, required=False, default=False)
    
    # Corporate fields
    company_name = serializers.CharField(write_only=True, required=False)
    company_registration = serializers.CharField(write_only=True, required=False)
    
    # School fields
    school_name = serializers.CharField(write_only=True, required=False)
    school_type = serializers.CharField(write_only=True, required=False)
    
    # Alumni fields
    alumni_school = serializers.CharField(write_only=True, required=False)
    graduation_year = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2', 'first_name', 'last_name',
            'user_type', 'phone', 'is_salaried_employee', 'company_name', 'company_registration',
            'school_name', 'school_type', 'alumni_school', 'graduation_year'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        # Extract profile fields
        user_type = validated_data.pop('user_type', 'individual')
        phone = validated_data.pop('phone', '')
        is_salaried_employee = validated_data.pop('is_salaried_employee', False)
        company_name = validated_data.pop('company_name', '')
        company_registration = validated_data.pop('company_registration', '')
        school_name = validated_data.pop('school_name', '')
        school_type = validated_data.pop('school_type', '')
        alumni_school = validated_data.pop('alumni_school', '')
        graduation_year = validated_data.pop('graduation_year', None)
        
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Update profile
        profile = user.profile
        profile.user_type = user_type
        profile.phone = phone
        profile.is_salaried_employee = is_salaried_employee
        profile.company_name = company_name
        profile.company_registration = company_registration
        profile.school_name = school_name
        profile.school_type = school_type
        profile.alumni_school = alumni_school
        if graduation_year:
            profile.graduation_year = graduation_year
        profile.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value


class UpdateProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    
    class Meta:
        model = UserProfile
        fields = [
            'first_name', 'last_name', 'email',
            'user_type', 'phone', 'id_number', 'kra_pin',
            'alumni_school', 'graduation_year',
            'company_name', 'company_registration', 'company_address', 'job_title',
            'school_name', 'school_type', 'school_registration', 'school_address',
            'employer_name', 'staff_number'
        ]
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
