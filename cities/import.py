# import the set of cities and states
from cities.models import State, City

def _tofloat(s, n):
    return float("%s.%s" % (s[0:n], s[(n+1):]))

f = open('latlng.txt', 'r')

states = {}
cities = []

linenum = -1
for line in f:
    linenum += 1

    # skip the first 4 lines as they're header information
    if linenum < 4:
        continue

    cols = []
    cols.append(line[1:3])
    cols.append(line[4:9])
    cols.append(line[10:35])
    cols.append(line[36:38])
    cols.append(_tofloat(line[39:48], 3))
    cols.append(_tofloat(line[49:59], 4))

    if cols[3] not in states:
        states[cols[3]] = State(abbreviation=cols[3], source_state_id=cols[0])

    cities.append([cols[2], cols[3], cols[1], cols[4], cols[5]])

State.objects.bulk_create(states.values())
states = dict([(s.abbreviation, s) for s in State.objects.all()])

cities = map(lambda c: City(name=c[0], state=states[c[1]], source_place_id=c[2], latitude=c[3], longitude=c[4]), cities)
City.objects.bulk_create(cities)