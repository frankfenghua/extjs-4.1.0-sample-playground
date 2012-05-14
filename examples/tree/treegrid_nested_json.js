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

    Ext.define('GusModel', {
        extend: 'Ext.data.Model',
        fields: [
            {
                convert: function(v, rec) {
                    return  unescape(v);
                },
                mapping: 'label',
                name: 'label',
                type: 'string'
            },
            {
                mapping: 'versionid',
                name: 'versionid',
                type: 'string'
            },
            {
                mapping: 'type',
                name: 'type',
                type: 'string'
            },
            {
                mapping: 'nodeid',
                name: 'nodeid',
                type: 'string'
            },
            {
                mapping: 'selected',
                name: 'selected',
                type: 'string'
            },
            {
                mapping: 'version',
                name: 'version',
                type: 'string'
            },
            {
                mapping: 'seqnum',
                name: 'seqnum',
                type: 'string'
            },
            {
                mapping: 'year',
                name: 'year',
                type: 'string'
            }
        ]
    });

    Ext.define('MyReader',{
        extend: 'Ext.data.reader.Json',
        alias : 'reader.myreader'

    });

    MyReader.override({
        getResponseData : function(response) {
            console.log("in overridden getResponseData");
            var jsonData = this.callOverridden(arguments);
//            jsonData = Ext.JSON.decode(response.responseText);

//            return jsonData.node;
            return jsonData;

        }
// ,
//                read: function(response) {
////                    var data = Util.stringToXML(response.data);
////                    var data = Util.stringToXML(response.responseText);
//                    var data;
//                    if (response && response.responseText) {
//                        data = this.getResponseData(response);
//                    }
//                    if (data) {
//                        return this.readRecords(data);
//                    } else {
//                        return this.nullResultSet;
//                    }
//                }

    });

    var store = Ext.create('Ext.data.TreeStore', {
        id: 'store',
        model: 'GusModel',
        proxy: {
            type: 'ajax',
            url: 'treegrid_nested_json.json',
            reader: {
//                type:'json'
                type:'myreader'
                ,
                root:'node'
            }
        }
//        ,
//        root: {
//            name: 'People',
//            label: 'People',
//            nodeid: 'root_nodeid',
//            expanded: true
//        }

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
//        rootVisible	: true,
        rootVisible	: false,
        // grid columns
        columns: [
            {   xtype: 'treecolumn',
                text:'name',
                dataIndex: 'label',
                flex: 1
            }
            ,
            {   text: 'nodeid',
                dataIndex: 'nodeid',
                flex: 1
            }
            ,
            {   text: 'type',
                dataIndex: 'type',
                flex: 1
            }
            ,
            {   text: 'selected',
                dataIndex: 'selected',
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

