from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, BrandViewSet,
    FinancingPlanListView, FinancingApplicationViewSet,
    EnterpriseBundleViewSet, EnterpriseOrderViewSet,
    EducationBoardViewSet, ClassroomPackageViewSet, DonationAmountListView,
    FundraiserViewSet, EducationTabletViewSet, TabletSoftwareListView,
    SchoolTabletOrderViewSet,
    CartView, CartItemView, OrderViewSet,
    HeroSlideListView, TradeInRequestView, EmployerListView, BankListView, SchoolListView, PolicyDetailView
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'brands', BrandViewSet)

# MSME Financing
router.register(r'financing/applications', FinancingApplicationViewSet, basename='financing-application')

# Enterprise
router.register(r'enterprise/bundles', EnterpriseBundleViewSet)
router.register(r'enterprise/orders', EnterpriseOrderViewSet, basename='enterprise-order')

# Education
router.register(r'education/boards', EducationBoardViewSet)
router.register(r'education/packages', ClassroomPackageViewSet)
router.register(r'education/fundraisers', FundraiserViewSet, basename='fundraiser')
router.register(r'education/tablets', EducationTabletViewSet)
router.register(r'education/tablet-orders', SchoolTabletOrderViewSet, basename='tablet-order')

# Orders
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    
    # Hero Slides
    path('hero-slides/', HeroSlideListView.as_view(), name='hero-slides'),
    
    # Employers (for salaried employee financing)
    path('employers/', EmployerListView.as_view(), name='employers'),
    
    # Banks (for financing applications)
    path('banks/', BankListView.as_view(), name='banks'),
    
    # Schools (for fundraiser dropdown)
    path('schools/', SchoolListView.as_view(), name='schools'),
    
    # MSME Financing
    path('financing/plans/', FinancingPlanListView.as_view(), name='financing-plans'),
    
    # Education
    path('education/donation-amounts/', DonationAmountListView.as_view(), name='donation-amounts'),
    path('education/tablet-software/', TabletSoftwareListView.as_view(), name='tablet-software'),
    
    # Cart
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/<int:item_id>/', CartItemView.as_view(), name='cart-item'),
    
    # Trade-In
    path('trade-in-requests/', TradeInRequestView.as_view(), name='trade-in-requests'),
    
    # Policies
    path('policies/<str:policy_type>/', PolicyDetailView.as_view(), name='policy-detail'),
]
