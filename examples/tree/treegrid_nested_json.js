/**
 * Reading Nested Data

 For the tree to read nested data, the Ext.data.reader.Reader must be configured with a
 root property, so the reader can find nested data for each node (if a root is not specified,
 it will default to 'children'). This will tell the tree to look for any nested tree nodes by
 the same keyword, i.e., 'children'. If a root is specified in the config make sure that any nested
 nodes with children have the same name. Note that setting defaultRootProperty accomplishes the same thing.
 */
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
            {name: 'name',       type: 'string'},
            {name: 'id',     type: 'string'}
        ]
    });

    var store = Ext.create('Ext.data.TreeStore', {
        id: 'store',
        model: 'UsgsList',
        proxy: {
            type: 'ajax',
            url: 'treegrid_nested_json.json',
            reader: {
                type:'json',
                root:'data'
            }
        }
        ,
        root: {
            name: 'People',
            expanded: true
        }

    });

    function renderTitle(value, p, record) {
        return Ext.String.format('<a href="{1}" target="_blank">{0}</a>',
            value,
            record.data.link
        );
    }

    var grid = Ext.create('Ext.tree.Panel', {
        width: 700,
        height: 500,
        title: 'nested_json_tree',
        store: store,
//        rootVisible	: false,
        // grid columns
        columns: [
            {   xtype: 'treecolumn',
                text:'name',
                dataIndex: 'name',
                flex: 1
            },
            {   text: 'id',
                dataIndex: 'id',
                flex: 1
            }
        ],

        listeners:{
            'beforeitemappend':function(thisnode, newnode, eopts){
//                if (thisnode == null || Ext.isEmpty(thisnode.data['Node_Nr'])
//                    && newnode.get('Node_Parent') == 0) {
//
//                    return true;
//                }
//
//                if ( thisnode ) {
//                    var parent = thisnode.data['Node_Nr'];
//                    var newNodeParent = newnode.get('Node_Parent');
//                    var leaf1 = thisnode.data['BDO_Nr'];
//
//                    if ( parent == newNodeParent && leaf1 == 0 ) {
//                        return true;
//                    } else {
//                        if (leaf1 != 0 ) {
//                            thisnode.data.leaf = true; // non-zero value of BDO_Nr is an indication that the node is a leaf node.
//                        }
//
//                        return false;
//                    }
//                } else {
//                    return false;
//                }
            }
        },
        renderTo: Ext.getBody()
    });

// trigger the data store load
//    store.load();
});

