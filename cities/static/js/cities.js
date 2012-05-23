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

            this.stateView = new StateView({model: this.state});
            $('#state-detail').html(this.stateView.render().el);
        } else {
            this.requestedId = id;
            this.list();
        }
    }

});

var app = new AppRouter();
Backbone.history.start();