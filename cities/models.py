from django.db import models

class State(models.Model):
    abbreviation = models.CharField(max_length=2, unique=True)
    source_state_id = models.CharField(max_length=2)

    def __unicode__(self):
        return self.abbreviation

    class Meta:
        ordering = ['abbreviation']

class City(models.Model):
    name = models.CharField(max_length=255)
    state = models.ForeignKey(State)
    source_place_id = models.CharField(max_length=5)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __unicode__(self):
        return self.name