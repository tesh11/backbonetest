from django.conf import settings

def use_tastypie(request):
    """
    Adds the use_tastypie context variables to the context.

    """
    return {'USE_TASTYPIE': settings.USE_TASTYPIE}
