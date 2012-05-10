Ext.require([
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.window.MessageBox'
]);

Ext.onReady(function() {

//    "stats":[
//        {
//            "@attributes":{
//                "team":"a"
//            },
//            "player":[
//                {
//                    "@attributes":{
//                        "id":"1",
//                        "name":"player1",
//                        "shots":"100"
//                    }
//                },
//                {
//                    "@attributes":{
//                        "id":"2",
//                        "name":"player2",
//                        "shots":"103"
//                    }
//                }
//            ]
//        },
        Ext.define('stats', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'id',     type: 'string'},
                {name: 'name',     type: 'string'},
                {name: 'shots', type: 'string'}
            ]
        });

    Ext.define('player', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id',     type: 'string'},
            {name: 'name',     type: 'string'},
            {name: 'shots', type: 'string'}
        ]
    });

    var store = Ext.create('Ext.data.TreeStore', {
        model:'player',
        proxy: {
            type: 'ajax',
            url: 'check-nodes-myjson.json',
            reader:{
                type:'json',
                root:'xmlData',
                record:'stats'
            },
            root:{
                text:'test',
                expanded:true
            }
        },
        sorters: [{
            property: 'leaf',
            direction: 'ASC'
        }, {
            property: 'text',
            direction: 'ASC'
        }]
    });

    var tree = Ext.create('Ext.tree.Panel', {
        store: store,
        rootVisible: false,
        useArrows: true,
        frame: true,
        title: 'Check Tree',
        renderTo: 'tree-div',
        width: 200,
        height: 250,
        dockedItems: [{
            xtype: 'toolbar',
            items: {
                text: 'Get checked nodes',
                handler: function(){
                    var records = tree.getView().getChecked(),
                        names = [];
                    
                    Ext.Array.each(records, function(rec){
                        names.push(rec.get('text'));
                    });
                    
                    Ext.MessageBox.show({
                        title: 'Selected Nodes',
                        msg: names.join('<br />'),
                        icon: Ext.MessageBox.INFO
                    });
                }
            }
        }]
    });
});
