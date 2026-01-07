from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'get_user_type']
    
    def get_user_type(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.user_type
        return '-'
    get_user_type.short_description = 'User Type'


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_type', 'phone', 'company_name', 'school_name']
    list_filter = ['user_type']
    search_fields = ['user__username', 'user__email', 'company_name', 'school_name']
