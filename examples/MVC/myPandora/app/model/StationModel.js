Ext.define('MyExt.model.StationModel', {
    extend: 'Ext.data.Model',
    fields: ['id', 'name'],
    
    proxy: {
        noCache:false,
        type: 'ajax',
        url: 'data/stations.json',
        reader: {
            type: 'json',
            root: 'results'
        }
    }
});