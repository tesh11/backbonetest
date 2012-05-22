from django.conf.urls import patterns, include, url
from django.conf import settings

from django.contrib import admin
from tastypie.api import Api
from cities.api import StateResource, CityResource
from cities.views import IndexView

admin.autodiscover()

# API resources
v1_api = Api(api_name='v1')
v1_api.register(StateResource())
v1_api.register(CityResource())

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),

    # Used for serving static content via gunicorn (not for production)
    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),

    (r'^api/', include(v1_api.urls)),
    (r'^$', IndexView.as_view()),
)
