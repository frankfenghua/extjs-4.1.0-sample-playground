Ext.Loader.setConfig ({
    disableCaching:false
});


Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*'
]);

Ext.onReady(function() {
    //we want to setup a model and store instead of using dataUrl
    Ext.define('Task', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'label',     type: 'string',convert: function(v, rec) {
                return  unescape(v);
            }},
            {name: 'type',     type: 'string'},
            {name: 'subtype', type: 'string'}
        ]
    });

    var store = Ext.create('Ext.data.TreeStore', {
        model: 'Task',
        autoLoad:false,//fh
        storeId:'mytreestore',
        proxy: {
            type: 'ajax',
            url: 'gus_qa001.json',
            reader:{
                type:'json',
                root:'explorer',
                record:'node'
            }
        },
        //fh
        root:{
            text:'frank',
            label:'frank task',
            expanded:false
        }
        ,
        listeners:{
//            'append':function(thisNode, newChildNode, index, eOpts ){
//
//                if( !newChildNode.isRoot() ) {
//                    newChildNode.set('text', newChildNode.get('label'));
//                    if(newChildNode.hasChildNodes()){
//                        newChildNode.set('leaf', false);
//                    }else{
//                        newChildNode.set('leaf', true);
//                    }
//                }
//            },
            'load':function( thisStore, node,records, successful, eOpts ){
                if(node.isRoot()){
                    return;
                }
            }
        },
        //end fh
//        folderSort: true
        folderSort: false
    });

    //Ext.ux.tree.TreeGrid is no longer a Ux. You can simply use a tree.TreePanel
    var tree = Ext.create('Ext.tree.Panel', {
        title: 'Core Team Projects',
        width: 400,
        height: 300,
//        renderTo: Ext.getBody(),
        collapsible: true,
//        useArrows: true,
        useArrows: false,
//        rootVisible: false,
        rootVisible: true,
        store: store,
        multiSelect: true,
//        singleExpand: true,
        singleExpand: false,
        //the 'columns' property is now 'headers'
        columns: [{
            xtype: 'treecolumn', //this is so we know which column will show the tree
            text: 'Task',
            flex: 2,
            sortable: true,
//            dataIndex: 'task'
            dataIndex: 'label'
        },{
            //we must use the templateheader component so we can use a custom tpl
//            xtype: 'templatecolumn',
            text: 'type',
            flex: 1,
            sortable: true,
            dataIndex: 'type',
            align: 'center'
        },{
            text: 'subtype',
            flex: 1,
            dataIndex: 'subtype',
            sortable: true
        }]
        ,
        listeners:{
            'beforeitemappend':function(thisnode, childNode, eopts){
                return;
                if(thisnode.isRoot()){
                    return;
                }
                if (thisnode == null || Ext.isEmpty(thisnode.data['Node_Nr'])
                    && childNode.get('Node_Parent') == 0) {

                    return true;
                }

                if ( thisnode ) {
                    var parent = thisnode.data['Node_Nr'];
                    var childNodeParent = childNode.get('Node_Parent');
                    var leaf1 = thisnode.data['BDO_Nr'];

                    if ( parent == childNodeParent && leaf1 == 0 ) {
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
        }

    });

    var win = Ext.create('Ext.window.Window', {
        title: 'Hello',
        height: 400,
        width: 400,
        layout: 'fit',
        items: [
            tree
        ]
    });

    store.load();
    win.show();

//    var grid = Ext.create('Ext.grid.Panel', {
//        width: 700,
//        height: 500,
//        title: 'USGS - M2.5+',
//        store: store,
//        loadMask: true,
//        disableSelection: true,
//        invalidateScrollerOnRefresh: false,
//        viewConfig: {
//            trackOver: false
//        },
//        // grid columns
//        columns:[{
//            xtype: 'rownumberer',
//            width: 50,
//            sortable: false
//        },{
//            id: 'title',
//            text: "Title",
//            dataIndex: 'title',
//            flex: 1,
//            renderer: renderTitle,
//            sortable: false
//        },{
//            id: 'pubDate',
//            text: "Published Date",
//            dataIndex: 'pubDate',
//            width: 130,
//            renderer: Ext.util.Format.dateRenderer('n/j/Y g:i A'),
//            sortable: true
//        }],
//
//        listeners:{
//            'beforeitemappend':function(thisnode, childNode, eopts){
//                if (thisnode == null || Ext.isEmpty(thisnode.data['Node_Nr'])
//                    && childNode.get('Node_Parent') == 0) {
//
//                    return true;
//                }
//
//                if ( thisnode ) {
//                    var parent = thisnode.data['Node_Nr'];
//                    var childNodeParent = childNode.get('Node_Parent');
//                    var leaf1 = thisnode.data['BDO_Nr'];
//
//                    if ( parent == childNodeParent && leaf1 == 0 ) {
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
//            }
//        },
//        renderTo: Ext.getBody()
//    });

// trigger the data store load
//    store.load();
});

