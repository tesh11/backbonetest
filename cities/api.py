from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.constants import ALL_WITH_RELATIONS
from tastypie.resources import ModelResource
from cities.models import State, City

class StateResource(ModelResource):
    class Meta:
        queryset = State.objects.all()
        resource_name = 'state'
        authorization = Authorization()
        always_return_data = True

class CityResource(ModelResource):
    state = fields.ForeignKey(StateResource, "state")

    def dehydrate_state(self, bundle):
        return bundle.obj.state.id

    class Meta:
        queryset = City.objects.all()
        resource_name = 'city'
        authorization = Authorization()
        always_return_data = True
        filtering = {
            "state": ALL_WITH_RELATIONS,
        }