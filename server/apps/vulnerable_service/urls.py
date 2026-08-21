from django.urls import path
from .views import BOLAView, BFLAView, MassAssignmentView, SSRFView

urlpatterns = [
    path('users/<str:user_id>/invoices', BOLAView.as_view(), name='target-bola'),
    path('admin/access-keys/revoke', BFLAView.as_view(), name='target-bfla'),
    path('users/me', MassAssignmentView.as_view(), name='target-mass-assignment'),
    path('fetch-avatar', SSRFView.as_view(), name='target-ssrf'),
]
