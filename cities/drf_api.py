from django.conf.urls import patterns, url
from djangorestframework.mixins import PaginatorMixin
from djangorestframework.resources import ModelResource
from djangorestframework.views import ListOrCreateModelView, InstanceModelView
from cities.models import State, City

class StateResource(ModelResource):
    model = State
    exclude = ('pk', )

class CityResource(ModelResource):
    model = City
    exclude = ('pk', )

class ListOrCreatePaginatedModelView(PaginatorMixin, ListOrCreateModelView):
    _suffix = "List"
    limit = 100

urls = patterns('',
    url(r'^state/$', ListOrCreatePaginatedModelView.as_view(resource=StateResource)),
    url(r'^state/(?P<pk>[0-9]+)$', InstanceModelView.as_view(resource=StateResource)),
    url(r'^city/state/(?P<state>[0-9]+)/$', ListOrCreatePaginatedModelView.as_view(resource=CityResource)),
)