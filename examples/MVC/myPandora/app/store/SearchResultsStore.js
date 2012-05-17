Ext.define('MyExt.store.SearchResultsStore', {
    extend: 'Ext.data.Store',
    requires: 'MyExt.model.StationModel',
    model: 'MyExt.model.StationModel',

    autoLoad: true,
    
    // Overriding the model's default proxy
    proxy: {
        noCache:false,
        type: 'ajax',
        url: 'data/searchresults.json',
        reader: {
            type: 'json',
            root: 'results'
        }
    }
});