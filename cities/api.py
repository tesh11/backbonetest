from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource
from cities.models import State, City

class StateResource(ModelResource):
    class Meta:
        queryset = State.objects.all()
        resource_name = 'state'
        authorization = Authorization()
        always_return_data = True
        #excludes = ['source_state_id']

class CityResource(ModelResource):
    state = fields.ForeignKey(StateResource, "state")

    class Meta:
        queryset = City.objects.all()
        resource_name = 'city'
        authorization = Authorization()
        always_return_data = True
        #excludes = ['source_place_id']