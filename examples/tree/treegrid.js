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
    Ext.define('Task_org', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'task',     type: 'string'},
            {name: 'user',     type: 'string'},
            {name: 'duration', type: 'string'}
        ]
    });
    Ext.define('Task', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'label',     type: 'string'},
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
            //the store will get the content from the .json file
//            url: 'treegrid.json',
            url: 'gus_qa001.json',
//            url: 'treegrid_fh.xml',
            reader:{
//                root: 'roots',
//                type:'xml',
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
        },
        listeners:{
            'append':function(thisNode, newChildNode, index, eOpts ){

                if( !newChildNode.isRoot() ) {
                    newChildNode.set('text', newChildNode.get('label'));
                    if(newChildNode.hasChildNodes()){
                        newChildNode.set('leaf', false);
                    }else{
                        newChildNode.set('leaf', true);
                    }
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
            xtype: 'templatecolumn',
            text: 'Duration',
            flex: 1,
            sortable: true,
            dataIndex: 'duration',
            align: 'center',
            //add in the custom tpl for the rows
            tpl: Ext.create('Ext.XTemplate', '{duration:this.formatHours}', {
                formatHours: function(v) {
                    if (v < 1) {
                        return Math.round(v * 60) + ' mins';
                    } else if (Math.floor(v) !== v) {
                        var min = v - Math.floor(v);
                        return Math.floor(v) + 'h ' + Math.round(min * 60) + 'm';
                    } else {
                        return v + ' hour' + (v === 1 ? '' : 's');
                    }
                }
            })
        },{
            text: 'Assigned To',
            flex: 1,
            dataIndex: 'user',
            sortable: true
        }]
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
});
