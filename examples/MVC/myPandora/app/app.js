Ext.Loader.setConfig({
    enabled: true,
    //disable cache for debug
    disableCaching:false
//    ,
//    paths: {
//        'Ext': 'ext-4.0.7/src'
//    }
});


Ext.application({
    name: 'MyExt',
    
    autoCreateViewport: true,
    
    models: ['StationModel', 'SongModel'],
    stores: ['StationsStore', 'RecentSongsStore', 'SearchResultsStore'],
    controllers: ['StationControl', 'SongControl']
});