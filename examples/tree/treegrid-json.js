Ext.Loader.setConfig ({
    disableCaching:false
});


Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*'
]);

Ext.onReady(function() {
    Ext.define('UsgsList', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'fid',       type: 'int'},
            {name: 'title',     type: 'string'},
            {name: 'description',  type: 'string'},
            {name: 'link',      type: 'string'},
            {name: 'pubDate',    type: 'date'},
            {name: 'lat',      type: 'string'},
            {name: 'long',      type: 'string'}
        ],
        idProperty: 'fid'
    });

    var store = Ext.create('Ext.data.Store', {
        id: 'store',
        model: 'UsgsList',
        proxy: {
            type: 'jsonp',
            url: 'http://query.yahooapis.com/v1/public/yql',
            extraParams: {
                q: 'select * from rss where url="http://earthquake.usgs.gov/earthquakes/catalogs/eqs7day-M2.5.xml"',
                format: 'json'
            },
            reader: {
                root: 'query.results.item'
            }
        }
    });

    function renderTitle(value, p, record) {
        return Ext.String.format('<a href="{1}" target="_blank">{0}</a>',
            value,
            record.data.link
        );
    }

    var grid = Ext.create('Ext.grid.Panel', {
        width: 700,
        height: 500,
        title: 'USGS - M2.5+',
        store: store,
        loadMask: true,
        disableSelection: true,
        invalidateScrollerOnRefresh: false,
        viewConfig: {
            trackOver: false
        },
        // grid columns
        columns:[{
            xtype: 'rownumberer',
            width: 50,
            sortable: false
        },{
            id: 'title',
            text: "Title",
            dataIndex: 'title',
            flex: 1,
            renderer: renderTitle,
            sortable: false
        },{
            id: 'pubDate',
            text: "Published Date",
            dataIndex: 'pubDate',
            width: 130,
            renderer: Ext.util.Format.dateRenderer('n/j/Y g:i A'),
            sortable: true
        }],

        listeners:{
            'beforeitemappend':function(thisnode, newnode, eopts){
                if (thisnode == null || Ext.isEmpty(thisnode.data['Node_Nr'])
                    && newnode.get('Node_Parent') == 0) {

                    return true;
                }

                if ( thisnode ) {
                    var parent = thisnode.data['Node_Nr'];
                    var newNodeParent = newnode.get('Node_Parent');
                    var leaf1 = thisnode.data['BDO_Nr'];

                    if ( parent == newNodeParent && leaf1 == 0 ) {
                        return true;
                    } else {
                        if (leaf1 != 0 ) {
                            thisnode.data.leaf = true; // non-zero value of BDO_Nr is an indication that the node is a leaf node.
                        }

                        return false;
                    }
                } else {
                    return false;
                }
            }
        },
        renderTo: Ext.getBody()
    });

// trigger the data store load
    store.load();
});

