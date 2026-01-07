from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Extended user profile"""
    USER_TYPES = [
        ('individual', 'Individual'),
        ('alumni', 'Alumni'),
        ('corporate', 'Corporate'),
        ('school', 'School'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='individual')
    phone = models.CharField(max_length=20, blank=True)
    
    # Individual/Alumni fields
    id_number = models.CharField(max_length=50, blank=True)
    kra_pin = models.CharField(max_length=50, blank=True)
    
    # Alumni specific
    alumni_school = models.CharField(max_length=200, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    
    # Corporate fields
    company_name = models.CharField(max_length=200, blank=True)
    company_registration = models.CharField(max_length=100, blank=True)
    company_address = models.TextField(blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    
    # School fields
    school_name = models.CharField(max_length=200, blank=True)
    school_type = models.CharField(max_length=50, blank=True)  # Primary, Secondary, etc.
    school_registration = models.CharField(max_length=100, blank=True)
    school_address = models.TextField(blank=True)
    
    # Salaried worker fields
    is_salaried_employee = models.BooleanField(default=False)
    employer = models.ForeignKey('store.Employer', on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    employer_name = models.CharField(max_length=200, blank=True)
    staff_number = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.user_type}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a UserProfile when a new User is created"""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the UserProfile when the User is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()

