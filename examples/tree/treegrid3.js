Ext.Loader.setConfig ({
    disableCaching:false
});


Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*'
]);

Ext.onReady(function() {
    Ext.define('Coriolis', {
    });
    Ext.define('CBehavior', {
        config:{
            name:'frank'
        },
        addConfig:function(cfg){

        }

    });

    Ext.define('CConfig', {
        config:{
            name:'frank' ,
            script:'script'
        }

    });


    var Coriolis = Ext.create('Coriolis',{});

    Coriolis.behaviors = new Object();
    Coriolis.displaytemplates = new Object();

    // ***************************************************************************************
    Ext.define('Config', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', mapping: '@id'},
            {name: 'behaviorxml_id', mapping: '@behaviorxml_id'},
            {name: 'name', mapping: '@name'},
            {name: 'script',
                convert: function(value, record){
                    if (record.raw != null) {
                        var cdata = Ext.DomQuery.selectNode('configScript', record.raw);
                        for(var i = 0, len = cdata.childNodes.length; i < len; i++){
                            var childNode = cdata.childNodes[i];
                            if(childNode.nodeType == 4){
                                return childNode.textContent || childNode.innerText || '';
                            }
                        }
                        return null;
                    }
                }
            }
        ]
    });

    Ext.define('Lstnr', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', mapping: '@id'},
            {name: 'behaviorxml_id', mapping: '@behaviorxml_id'},
            {name: 'name', mapping: '@name'},
            {name: 'script',
                convert: function(value, record){
                    if (record.raw != null) {
                        var cdata = Ext.DomQuery.selectNode('listenerScript', record.raw);
                        for(var i = 0, len = cdata.childNodes.length; i < len; i++){
                            var childNode = cdata.childNodes[i];
                            if(childNode.nodeType == 4){
                                return childNode.textContent || childNode.innerText || '';
                            }
                        }
                        return null;
                    }
                }
            }
        ]
    });

    Ext.define('ClientMethod', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', mapping: '@id'},
            {name: 'behaviorxml_id', mapping: '@behaviorxml_id'},
            {name: 'name', mapping: '@name'},
            {name: 'script',
                convert: function(value, record){
                    if (record.raw != null) {
                        var cdata = Ext.DomQuery.selectNode('clientModelScript', record.raw);
                        for(var i = 0, len = cdata.childNodes.length; i < len; i++){
                            var childNode = cdata.childNodes[i];
                            if(childNode.nodeType == 4){
                                return childNode.textContent || childNode.innerText || '';
                            }
                        }
                        return null;
                    }
                }
            }
        ]
    });

    Ext.define('BehaviorXML', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', mapping: '@id'},
            {name: 'name', mapping: '@name'},
            {name: 'javaclass', mapping: '@javaclass'}
        ],
        associations: [{
            type: 'hasMany',
            model: 'Config',
            primaryKey: 'id',
            foreignKey: 'behaviorxml_id',
            autoLoad: false,
            associationKey: 'configs',
            reader: {
                type : 'xml',
                model: 'Config',
                record: 'config'
            }
        },
            {
                type: 'hasMany',
                model: 'Lstnr',
                primaryKey: 'id',
                foreignKey: 'behaviorxml_id',
                autoLoad: false,
                associationKey: 'listeners',
                reader: {
                    type : 'xml',
                    model: 'Lstnr',
                    record: 'listener'
                }
            },
            {
                type: 'hasMany',
                model: 'ClientMethod',
                primaryKey: 'id',
                foreignKey: 'behaviorxml_id',
                autoLoad: false,
                associationKey: 'clientMethods',
                reader: {
                    type : 'xml',
                    model: 'ClientMethod',
                    record: 'clientMethod'
                }
            }
        ]
    });


    var behaviorStore = Ext.create('Ext.data.TreeStore', {
        model: 'BehaviorXML',
        autoLoad:true,//fh
        storeId:'mytreestore',
        proxy: {
            type: 'ajax',
            url: 'work.xml',
            reader:{
                type:'xml',
                root:'dataset',
                record:'row'
            }
        },
//        //fh
//        root:{
//            text:'frank',
//            name:'frank task',
//            expanded:true
//        },
        listeners:{
            'append':function(thisNode, newChildNode, index, eOpts ){


                if( !newChildNode.isRoot() ) {
                    if (newChildNode.raw != null) {
                        if(newChildNode.raw.hasChildNodes()){
                            newChildNode.set('leaf', false);
                        }else{
                            newChildNode.set('leaf', true);
                        }
                    }
//
//                    newChildNode.set('text', newChildNode.get('label'));
//                    if(newChildNode.hasChildNodes()){
//                        newChildNode.set('leaf', false);
//                    }else{
//                        newChildNode.set('leaf', true);
//                    }
                }
            }
        },
        //end fh
//        folderSort: true
        folderSort: false
    });


    behaviorStore.load({
        callback: function() {
            var i = 0;
            for (i = 0;i<this.getCount();i++) {
                var behavior = this.getAt(i);

                var o = new CBehavior({});
                o.setName(behavior.get('name'));

                behavior.configs().each(function(config) {
                    var c = new CConfig({});
                    c.setName(config.get('name'));
                    c.setScript(config.get('script'));

                    o.addConfig(c);
                });
                Coriolis.behaviors[o.getName()] = o;
            }
        }
    });

    var tree = Ext.create('Ext.tree.Panel', {
        title: 'Core Team Projects',
        width: 400,
        height: 300,
        collapsible: true,
        useArrows: false,
        rootVisible: true,
        store: behaviorStore,
        multiSelect: true,
        singleExpand: false,
        //the 'columns' property is now 'headers'
        columns: [{
            xtype: 'treecolumn', //this is so we know which column will show the tree
            text: 'name',
            flex: 2,
            sortable: true,
//            dataIndex: 'task'
            dataIndex: 'name'
        },
            {
//                xtype: 'treecolumn', //this is so we know which column will show the tree
                text: 'javaclass',
                flex: 2,
                sortable: true,
                dataIndex: 'javaclass'

            },
            {
//                xtype: 'treecolumn', //this is so we know which column will show the tree
                text: 'id',
                flex: 2,
                sortable: true,
                dataIndex: 'id'

            }
        ]
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
//    behaviorStore.load();
    win.show();

});
