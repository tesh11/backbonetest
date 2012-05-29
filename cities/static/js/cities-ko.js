function State(data) {
    this.id = ko.observable(data ? data.id : null);
    this.abbreviation = ko.observable(data ? data.abbreviation : '');
    this.source_state_id = ko.observable(data ? data.source_state_id : '');
}

function City(data) {
    this.id = ko.observable(data.id);
    this.name = ko.observable(data.name);
    this.state = ko.observable(data.state);
    this.source_place_id = ko.observable(data.source_place_id);
    this.latitude = ko.observable(data.latitude);
    this.longitude = ko.observable(data.longitude);
}

function StateCityListViewModel() {
    // Data
    var self = this;
    // TODO: handle sorting
    self.states = ko.observableArray([]);
    self.stateIndexById = {};
    self.selectedState = ko.observable(null);

    self.cities = ko.observableArray([]);
    self.cityListMeta = null;

    self.isLoading = false;
    self.pageSize = 100;
    self.page = 0;

    // Operations
    self.loadStateList = function(callback) {
        $.getJSON("/api/v1/state/?limit=60", function(results) {
            var mappedStates = [];
            $.each(results.objects, function(index, result) {
                var state = new State(result);
                mappedStates.push(state);
                self.stateIndexById[state.id()] = index;
            });
            self.states(mappedStates);

            if (callback) {
                callback();
            }
        });
    };

    self.loadCityList = function(append, callback) {
        if (!append) {
            self.page = 0;
        }

        var url = useTastypie
            ? '/api/v1/city/?state=' + this.selectedState().id() + '&limit=' + this.pageSize + '&offset=' + (this.page * this.pageSize)
            : '/api/v1/city/state/' + this.selectedState().id() + '/?limit=' + this.pageSize + '&page=' + (this.page + 1);

        $.getJSON(url, function(results) {
            var mappedCities = $.map(results.objects, function(item) { return new City(item); });
            if (append) {
                ko.utils.arrayPushAll(self.cities, mappedCities);
            } else {
                self.cities(mappedCities);
            }
            self.cityListMeta = results.meta;

            if (callback) {
                callback();
            }
        });
    };

    self.loadState = function(state) {
        location.hash = state.id();
    };

    self.newState = function(state) {
        location.hash = "new";
    };

    self.setSelectedState = function(stateId) {
        var stateIndexById = self.stateIndexById[stateId];
        self.selectedState(self.states()[stateIndexById]);
        self.loadCityList(false);
    };

    self.saveState = function() {
        var newState = self.selectedState().id() === null;
        var url = "/api/v1/state/" + (newState ? "" : (self.selectedState().id() + "/"));
        var type = newState ? "post" : "put";
        $.ajax(url, {
            data: ko.toJSON(self.selectedState),
            type: type,
            contentType: "application/json",
            success: function(result) {
                self.selectedState(new State(result));
                self.states.push(self.selectedState());
                self.reindexStateArray();
                location.hash = self.selectedState().id();
            }
        });
    };

    self.reindexStateArray = function() {
        self.stateIndexById = {};
        $.each(self.states(), function(index, state) {
            self.stateIndexById[state.id()] = index;
        });
    };

    self.deleteState = function() {
        var stateIndexById = self.stateIndexById[self.selectedState().id()];
        self.states.splice(stateIndexById, 1);

        self.reindexStateArray();

        $.ajax("/api/v1/state/" + self.selectedState().id() + "/", {
            type: "delete",
            contentType: "application/json",
            success: function(result) {
                alert('State deleted successfully');
                window.history.back();
            }
        });
    };

    self.checkScroll = function(viewModel, event) {
        // if we've reached the end of the list, don't load more
        if (self.cityListMeta !== null && self.cityListMeta.next !== null) {
            // load more when we're 100px from the bottom
            var threshold = 100;
            var el = $(event.target);
            if (!self.isLoading && el.length !== 0 && (el[0].scrollTop + el[0].clientHeight + threshold) > el[0].scrollHeight) {
                self.page += 1;
                self.isLoading = true;

                self.loadCityList(true, function() {
                    self.isLoading = false;
                });
            }
        }
    };

    self.app = Sammy(function() {
        this.get('#new', function() {
            this.app.runRoute('get', '');
            self.selectedState(new State());
            self.cities.removeAll();
            self.cityListMeta = null;
        });

        this.get('#:state', function() {
            if (self.states().length > 0) {
                self.setSelectedState(this.params.state);
            } else {
                var stateId = this.params.state;
                self.loadStateList(function() {
                    self.setSelectedState(stateId);
                });
            }
        });

        this.get('', function() {
            if (self.states().length === 0) {
                self.loadStateList();
            }
        })
    }).run();
}

ko.applyBindings(new StateCityListViewModel());
