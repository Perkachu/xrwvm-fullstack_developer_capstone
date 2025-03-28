"""djangoproj URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.conf import settings


# Define a template name constant to avoid duplication
REACT_TEMPLATE = 'index.html'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('djangoapp/', include('djangoapp.urls')),
    # React app URLs - catch all routes and let React router handle them
    path('', TemplateView.as_view(template_name=REACT_TEMPLATE)),
    path('dealers/', TemplateView.as_view(template_name=REACT_TEMPLATE)),
    path('about/', TemplateView.as_view(template_name=REACT_TEMPLATE)),
    path('contact/', TemplateView.as_view(template_name=REACT_TEMPLATE)),
    path('login/', TemplateView.as_view(template_name=REACT_TEMPLATE)),
    path('register/', TemplateView.as_view(template_name=REACT_TEMPLATE)),
    path('dealer/<int:dealer_id>',
         TemplateView.as_view(template_name=REACT_TEMPLATE)),
    path('postreview/<int:dealer_id>',
         TemplateView.as_view(template_name=REACT_TEMPLATE)),
]

# Add static URL patterns
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serve React static files
urlpatterns += [
    path('manifest.json', TemplateView.as_view(
        template_name='manifest.json',
        content_type='application/json'
    )),
    path('favicon.ico', TemplateView.as_view(
        template_name='favicon.ico',
        content_type='image/x-icon'
    )),
    path('logo192.png', TemplateView.as_view(
        template_name='logo192.png',
        content_type='image/png'
    )),
    # Serve static/static directory for React build files
    # Import redirect from django.shortcuts
    path('static/static/<path:path>',
         # Use a shorter variable for readability
         # Import django.shortcuts more concisely
         # Use a shorter import approach
         lambda request, p: __import__('django.shortcuts').shortcuts.redirect(
             f'/static/{p}')),
]
