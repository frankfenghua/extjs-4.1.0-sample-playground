Ext.define('MyExt.controller.StationControl', {
    extend: 'Ext.app.Controller',

    refs: [{
        ref: 'stationsList',
        selector: 'stationslist'
    }],

    stores: ['StationsStore', 'SearchResultsStore'],
    
    init: function() {
        // Start listening for events on views
        this.control({
            'stationslist': {
                selectionchange: this.onStationSelect
            },
            'newstation': {
                select: this.onNewStationSelect
            }
        });
    },
    
    onLaunch: function() {
        var stationsStore = this.getStationsStoreStore();
        stationsStore.load({
            callback: this.onStationsLoad,
            scope: this
        });
    },

    onStationsLoad: function() {
        var stationsList = this.getStationsList();
        stationsList.getSelectionModel().select(0);
    },

    onStationSelect: function(selModel, selection) {
        // Fire an application wide event
        this.application.fireEvent('stationstart', selection[0]);
    },
    
    onNewStationSelect: function(field, selection) {
        var selected = selection[0],
            store = this.getStationsStoreStore(),
            list = this.getStationsList();
            
        if (selected && !store.getById(selected.get('id'))) {
            store.add(selected);
        }
        list.getSelectionModel().select(selected);
    }
});
