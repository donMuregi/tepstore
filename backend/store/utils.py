"""
Security utilities for the store app.
Includes custom exception handling, input validation, and throttling.
"""

import re
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import SimpleRateThrottle
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from django.db import IntegrityError

logger = logging.getLogger(__name__)
security_logger = logging.getLogger('django.security')


# ============ CUSTOM EXCEPTION HANDLER ============

def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses
    and logs security-relevant events.
    """
    # Get the standard error response
    response = exception_handler(exc, context)
    
    # Get request info for logging
    request = context.get('request')
    view = context.get('view')
    view_name = view.__class__.__name__ if view else 'Unknown'
    
    # Log the exception
    if request:
        user = getattr(request, 'user', None)
        user_info = f"User: {user}" if user and user.is_authenticated else "Anonymous"
        ip = get_client_ip(request)
        logger.warning(
            f"API Exception in {view_name}: {exc.__class__.__name__} - {str(exc)} | "
            f"IP: {ip} | {user_info}"
        )
    
    if response is not None:
        # Standardize error response format
        response.data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': get_error_message(response.data),
                'details': response.data if isinstance(response.data, dict) else {'detail': response.data}
            }
        }
        return response
    
    # Handle Django validation errors
    if isinstance(exc, DjangoValidationError):
        return Response({
            'success': False,
            'error': {
                'code': status.HTTP_400_BAD_REQUEST,
                'message': 'Validation error',
                'details': {'validation_errors': exc.messages if hasattr(exc, 'messages') else [str(exc)]}
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle database integrity errors
    if isinstance(exc, IntegrityError):
        security_logger.warning(f"Database integrity error: {exc}")
        return Response({
            'success': False,
            'error': {
                'code': status.HTTP_400_BAD_REQUEST,
                'message': 'Data integrity error. Please check your input.',
                'details': {}
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle 404
    if isinstance(exc, Http404):
        return Response({
            'success': False,
            'error': {
                'code': status.HTTP_404_NOT_FOUND,
                'message': 'Resource not found',
                'details': {}
            }
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Log unhandled exceptions
    logger.error(f"Unhandled exception: {exc.__class__.__name__} - {str(exc)}")
    
    # Return generic error for unhandled exceptions (don't expose internal details)
    return Response({
        'success': False,
        'error': {
            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': 'An unexpected error occurred. Please try again later.',
            'details': {}
        }
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_error_message(data):
    """Extract a readable error message from response data."""
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        if 'non_field_errors' in data:
            return str(data['non_field_errors'][0]) if data['non_field_errors'] else 'Validation error'
        # Get first error message from any field
        for key, value in data.items():
            if isinstance(value, list) and value:
                return f"{key}: {value[0]}"
            elif isinstance(value, str):
                return f"{key}: {value}"
    elif isinstance(data, list) and data:
        return str(data[0])
    return 'An error occurred'


def get_client_ip(request):
    """Get client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', 'unknown')
    return ip


# ============ CUSTOM THROTTLE CLASSES ============

class LoginRateThrottle(SimpleRateThrottle):
    """Rate limiting for login attempts."""
    scope = 'login'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return None  # Don't throttle authenticated users
        
        # Throttle by IP for anonymous users
        ident = get_client_ip(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class RegistrationRateThrottle(SimpleRateThrottle):
    """Rate limiting for registration attempts."""
    scope = 'register'
    
    def get_cache_key(self, request, view):
        ident = get_client_ip(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class SensitiveOperationThrottle(SimpleRateThrottle):
    """Rate limiting for sensitive operations like password reset, financing applications."""
    scope = 'sensitive'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = get_client_ip(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


# ============ INPUT VALIDATION ============

class InputValidator:
    """
    Input validation utilities to prevent injection attacks.
    Note: Django ORM already protects against SQL injection, but these
    provide additional sanitization for edge cases and logging.
    """
    
    # Patterns that might indicate SQL injection attempts
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)",
        r"(--|#|/\*|\*/)",  # SQL comments
        r"(\bOR\b\s+\d+\s*=\s*\d+)",  # OR 1=1 type patterns
        r"(\bAND\b\s+\d+\s*=\s*\d+)",
        r"(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))",  # Stacked queries
        r"(\bEXEC\b|\bEXECUTE\b)",
        r"(xp_|sp_)",  # SQL Server procedures
    ]
    
    # Patterns for XSS attempts
    XSS_PATTERNS = [
        r"<script[^>]*>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>",
    ]
    
    @classmethod
    def check_sql_injection(cls, value: str, field_name: str = 'input') -> bool:
        """
        Check if a string contains potential SQL injection patterns.
        Returns True if suspicious, False if clean.
        """
        if not isinstance(value, str):
            return False
        
        value_upper = value.upper()
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_upper, re.IGNORECASE):
                security_logger.warning(
                    f"Potential SQL injection attempt detected in {field_name}: {value[:100]}"
                )
                return True
        return False
    
    @classmethod
    def check_xss(cls, value: str, field_name: str = 'input') -> bool:
        """
        Check if a string contains potential XSS patterns.
        Returns True if suspicious, False if clean.
        """
        if not isinstance(value, str):
            return False
        
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                security_logger.warning(
                    f"Potential XSS attempt detected in {field_name}: {value[:100]}"
                )
                return True
        return False
    
    @classmethod
    def sanitize_string(cls, value: str, max_length: int = 1000) -> str:
        """
        Sanitize a string input.
        - Strips whitespace
        - Limits length
        - Removes null bytes
        """
        if not isinstance(value, str):
            return str(value)[:max_length] if value else ''
        
        # Remove null bytes
        value = value.replace('\x00', '')
        # Strip and limit length
        return value.strip()[:max_length]
    
    @classmethod
    def validate_id(cls, value) -> int:
        """Validate that a value is a positive integer ID."""
        try:
            id_val = int(value)
            if id_val <= 0:
                raise ValueError("ID must be positive")
            return id_val
        except (TypeError, ValueError):
            raise ValueError("Invalid ID format")
    
    @classmethod
    def validate_email(cls, email: str) -> str:
        """Basic email validation."""
        email = cls.sanitize_string(email, 254)
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValueError("Invalid email format")
        return email.lower()
    
    @classmethod
    def validate_phone(cls, phone: str) -> str:
        """Validate and normalize phone number."""
        phone = cls.sanitize_string(phone, 20)
        # Remove common formatting characters
        phone = re.sub(r'[\s\-\(\)\.]', '', phone)
        # Check for valid phone pattern
        if not re.match(r'^\+?[0-9]{10,15}$', phone):
            raise ValueError("Invalid phone number format")
        return phone


# ============ SECURITY MIXINS ============

class SecurityLoggingMixin:
    """Mixin to add security logging to views."""
    
    def dispatch(self, request, *args, **kwargs):
        # Log sensitive operations
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            security_logger.info(
                f"Sensitive operation: {request.method} {request.path} | "
                f"IP: {get_client_ip(request)} | "
                f"User: {request.user if request.user.is_authenticated else 'Anonymous'}"
            )
        return super().dispatch(request, *args, **kwargs)


class InputValidationMixin:
    """Mixin to add input validation to serializers."""
    
    def validate(self, attrs):
        """Run security checks on all string inputs."""
        for field_name, value in attrs.items():
            if isinstance(value, str):
                # Check for injection attempts
                if InputValidator.check_sql_injection(value, field_name):
                    raise DjangoValidationError(
                        f"Invalid characters detected in {field_name}"
                    )
                if InputValidator.check_xss(value, field_name):
                    raise DjangoValidationError(
                        f"Invalid content detected in {field_name}"
                    )
        return super().validate(attrs)
