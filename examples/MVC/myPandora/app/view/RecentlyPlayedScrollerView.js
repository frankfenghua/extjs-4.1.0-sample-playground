Ext.define('MyExt.view.RecentlyPlayedScrollerView', {
    extend: 'Ext.view.View',
    alias: 'widget.recentlyplayedscroller',    
    store: 'RecentSongsStore',
    itemTpl: '<div>{name}</div>'
});