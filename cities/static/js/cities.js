// Models
window.State = Backbone.Model.extend({
    urlRoot: "/api/v1/state/",
    defaults: {
        "id": null,
        "abbreviation": "",
        "source_state_id": ""
    }
});

window.StateCollection = Backbone.Collection.extend({
    model: State,
    url: '/api/v1/state/?limit=60',
    comparator: function(state) {
        return state.get("abbreviation");
    }
});

window.City = Backbone.Model.extend({
    urlRoot: "/api/v1/city/",
    defaults: {
        "id": null,
        "name": "",
        "state": null,
        "source_place_id": "",
        "latitude": "0.0",
        "longitude": "0.0"
    }
});

window.CityCollection = Backbone.Collection.extend({
    model: City,
    url: function() {
        if (useTastypie) {
            return '/api/v1/city/?state=' + this.state + '&limit=' + this.pageSize + '&offset=' + (this.page * this.pageSize);
        } else {
            return '/api/v1/city/state/' + this.state + '/?limit=' + this.pageSize + '&page=' + (this.page + 1);
        }
    },
    comparator: function(city) {
        return city.get('name');
    },
    state: "None",
    pageSize: 100,
    page: 0
});

// Views
window.StateListView = Backbone.View.extend({

    tagName: 'ul',

    initialize: function() {
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function(state, collection, options) {
            var newEl = new StateListItemView({model: state}).render().el;
            if (options.index == 0) {
                $(self.el).prepend(newEl);
            } else {
                $("li:nth-child(" + options.index + ")", self.el).after(newEl);
            }
        });
        this.model.bind("change", function() {
            self.model.sort();
            self.render();
        });
    },

    render: function(eventName) {
        $(this.el).empty();
        _.each(this.model.models, function(state) {
            $(this.el).append(new StateListItemView({model: state}).render().el);
        }, this);
        return this;
    }

});

window.StateListItemView = Backbone.View.extend({

    tagName: 'li',

    template: _.template($('#tpl-state-list-item').html()),

    initialize: function() {
        this.model.bind("destroy", this.close, this);
    },

    render: function(eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    close: function() {
        $(this.el).unbind();
        $(this.el).remove();
    }

});

window.StateView = Backbone.View.extend({

    template: _.template($('#tpl-state-details').html()),

    initialize: function() {
        this.model.bind("change", this.render, this);
    },

    render: function(eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change input": "change",
        "click .save": "saveState",
        "click .delete": "deleteState"
    },

    change: function(event) {

    },

    saveState: function() {
        this.model.set({
            abbreviation: $("#abbreviation").val(),
            source_state_id: $("#source-state-id").val()
        });

        if (this.model.isNew()) {
            var self = this;
            app.stateList.create(this.model, {
                success: function() {
                    app.navigate('states/' + self.model.id, false);
                }
            });
        } else {
            this.model.save();
        }

        return false;
    },

    deleteState: function() {
        this.model.destroy({
            success: function () {
                alert('State deleted successfully');
                window.history.back();
            }
        });

        this.close();

        return false;
    },

    close: function() {
        $(this.el).unbind();
        $(this.el).empty();
    }

});

window.CityListView = Backbone.View.extend({

    tagName: 'ul',

    initialize: function() {
        this.model.bind("reset", this.render, this);
        this.isLoading = false;

        // because scroll doesn't seem to work with delegate(), we need to manually
        // bind it
        var method = _.bind(this.checkScroll, this);
        var eventName = "scroll.delegateEvents" + this.cid;
        $("#cities").bind(eventName, method);

/*        var self = this;
        this.model.bind("add", function(state, collection, options) {
            var newEl = new StateListItemView({model: state}).render().el;
            if (options.index == 0) {
                $(self.el).prepend(newEl);
            } else {
                $("li:nth-child(" + options.index + ")", self.el).after(newEl);
            }
        });
        this.model.bind("change", function() {
            self.model.sort();
            self.render();
        });*/
    },

    render: function(eventName) {
        //$(this.el).empty();
        this.renderModels(this.model.models);
        return this;
    },

    renderModels: function(models) {
        _.each(models, function(city) {
            $(this.el).append(new CityListItemView({model: city}).render().el);
        }, this);
    },

    checkScroll: function() {
        // if we've reached the end of the list, don't load more
        if (this.model.meta.next !== null) {
            // load more when we're 100px from the bottom
            var threshold = 100;
            var el = $('#cities');
            if (!this.isLoading && el.length !== 0 && (el[0].scrollTop + el[0].clientHeight + threshold) > el[0].scrollHeight) {
                app.cityList.page += 1;
                this.isLoading = true;

                var self = this;
                app.cityList.fetch({
                    success: function(models) {
                        self.renderModels(models);
                        self.isLoading = false;
                    }
                });
            }
        }
    },

    close: function() {

        // remove the event we manually bound in initialize
        $("#cities").unbind("scroll.delegateEvents" + this.cid);

        $(this.el).unbind();
        $(this.el).remove();
    }
});

window.CityListItemView = Backbone.View.extend({

    tagName: 'li',

    template: _.template($('#tpl-city-list-item').html()),

    initialize: function() {
        this.model.bind("destroy", this.close, this);
    },

    render: function(eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    close: function() {
        $(this.el).unbind();
        $(this.el).remove();
    }

});

window.HeaderView = Backbone.View.extend({
    template: _.template($('#tpl-header').html()),

    initialize: function() {
        this.render();
    },

    render: function(eventName) {
        $(this.el).html(this.template());
        return this;
    },

    events: {
        "click .new": "newState"
    },

    newState: function(event) {
        app.navigate("states/new", true);
        return false;
    }
});

// Router
var AppRouter = Backbone.Router.extend({

    routes: {
        "": "list",
        "states/new": "newState",
        "states/:id": "stateDetails"
    },

    initialize: function() {
        $('header').html(new HeaderView().render().el);
    },

    list: function() {
        this.stateList = new StateCollection();

        var self = this;
        this.stateList.fetch({
            success: function() {
                self.stateListView = new StateListView({model: self.stateList});
                $('#states').html(self.stateListView.render().el);

                if (self.requestedId) {
                    self.stateDetails(self.requestedId);
                }
            }
        });
    },

    newState: function() {
        if (app.stateView) {
            app.stateView.close();
        }

        app.stateView = new StateView({model: new State()});
        $('#state-detail').html(this.stateView.render().el);

        this.list();
    },

    stateDetails: function(id) {
        if (this.stateList) {
            this.state = this.stateList.get(id);

            if (this.stateView) {
                this.stateView.close();
            }

            if (this.cityListView) {
                this.cityListView.close();
            }

            this.stateView = new StateView({model: this.state});
            $('#state-detail').html(this.stateView.render().el);

            // render the cities list
            this.cityList = new CityCollection();
            this.cityList.state = this.state.id;
            this.cityList.fetch();
            this.cityListView = new CityListView({model: this.cityList});
            $("#cities").html(this.cityListView.render().el);

        } else {
            this.requestedId = id;
            this.list();
        }
    }

});

var app = new AppRouter();
Backbone.history.start();