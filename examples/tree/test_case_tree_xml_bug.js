//http://www.sencha.com/forum/showthread.php?154911
//http://www.sencha.com/forum/showthread.php?160780-Tree-Store-does-not-function-with-XML-Reader&p=688480#post688480
//http://www.sencha.com/forum/showthread.php?160412-TreeStore-w-XML-reader-Example
//http://www.sencha.com/forum/showthread.php?137126-real-xpath-selector
//http://www.sencha.com/forum/showthread.php?171556-Tree-and-or-NestedList-Not-Functioning-With-XML-Reader


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
    //for bug
    Ext.define('GusModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', type: 'int'},
            {name: 'name', type: 'string'}
        ]
    });

    // for GUS
    Ext.define('GusModel0', {
        extend: 'Ext.data.Model',
        fields: [
            {
                convert: function(v, rec) {
                    return  unescape(v);
                },
                mapping: '@label',
                name: 'label',
                type: 'string'
            },
            {
                mapping: '@versionid',
                name: 'versionid',
                type: 'string'
            },
            {
                mapping: '@type',
                name: 'type',
                type: 'string'
            },
            {
                mapping: '@nodeid',
                name: 'nodeid',
                type: 'string'
            },
            {
                mapping: '@selected',
                name: 'selected',
                type: 'string'
            },
            {
                mapping: '@version',
                name: 'version',
                type: 'string'
            },
            {
                mapping: '@seqnum',
                name: 'seqnum',
                type: 'string'
            },
            {
                mapping: '@year',
                name: 'year',
                type: 'string'
            }
        ]
    });

    Ext.define('MyReader',{
        extend: 'Ext.data.reader.Xml',
        alias : 'reader.myreader'

    });

    MyReader.override({
//*/
        getResponseData : function(response) {
            console.log("in overridden getResponseData");
            var xmlData = this.callOverridden(arguments);
//            jsonData = Ext.JSON.decode(response.responseXml);

//            return jsonData.explorer;
            return xmlData;
//            return this.callOverridden(arguments);

        },
//*/
//*/


        getRoot: function(data) {

            // console.log(data);

            var nodeName = data.nodeName,
                root     = this.root;

            if (!root || (nodeName && nodeName == root)) {
                return data;
//            } else if (Ext.DomQuery.isXml(data)) { // org version
            } else {
                return Ext.DomQuery.selectNode(root, data);
            }
        },
//*/

//*/
        extractData: function(root) {
            var me = this;
            var recordName = me.record,
                selector	= me.selector;

            if (!recordName) {
                Ext.Error.raise('Record is a required parameter');
            }

            if (recordName != root.nodeName) {
//                root = Ext.DomQuery.select(recordName, root);
                root = Ext.DomQuery.select(selector ? selector : ('.//' + recordName), root);
            } else {
                root = [root];
            }
            return this.callParent([root]);
        }
//*/
    });

    document.xpath = true; // by feng

    Ext.DomQuery.select = document.xpath ?
        function(path, root, type) {
            root = root || document;
            if (Ext.DomQuery.isXml(root)) {
                var tmpRoot = root.xpath(path);
                return tmpRoot;
            }
            return Ext.DomQuery.jsSelect.call(this, path, root, type);
        }
        : function(path, root, type) {
        return Ext.DomQuery.jsSelect.call(this, path, root, type)
    };


    Ext.define('Ext.ux.xpath',{
        singleton	: true,
        ns 			: {":": "http://www.w3.org/1999/xhtml11","xsl": "http://www.w3.org/1999/XSL/Transform", "xsi": "http://www.w3.org/2001/XMLSchema-instance", "xsd": "http://www.w3.org/2001/XMLSchema", "xf": "http://www.w3.org/2002/xforms", "ev": "http://www.w3.org/2001/xml-events", "ext": "http://www.sencha.com"}
    });
    Ext.define('Ext.ux.xpath.Xpath', {
        expression	: '.',
        ns 			: Ext.ux.xpath.ns,
        constructor: function(config){
            var me = this;
            Ext.apply(me,config);
            if(!me.expression) {me.expression = '.'};
            if(me.expression.substring(0,2) == '.[') { me.expression = 'self::node()' +me.expression.substring(1)} // bug ?? in chrome not evaluation .[@attribute]  or .[element]
            if(!me.ctx) {me.ctx = document};
            if(!me.doc) {me.doc= me instanceof Document ? me: document};
        },
        evalMapping : {
            1: 'numberValue',
            2: 'stringValue',
            3: 'booleanValue'
        },
        evaluate	: function() {
            var temp,x,me=this;
            try {
                x=me.doc.evaluate(
                    me.expression,
                    me.ctx,
                    me.ns ? function(prefix) {return me.ns[prefix ? prefix : ":"] || null}
                        : me.doc.createNSResolver ? me.doc.createNSResolver(me.ctx) : null,
                    XPathResult.ANY_TYPE
                    ,null);
            } catch (e) {
                Ext.Error.raise({
                    parseError: e,
                    xpath: me,
                    msg: "xpath expression is invalid: " + me.expression
                });
            }
            switch (x.resultType)
            {case XPathResult.NUMBER_TYPE:
                case XPathResult.STRING_TYPE:
                case XPathResult.BOOLEAN_TYPE:
                    me.value=x[me.evalMapping[x.resultType]];
                    break;

                case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
                case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
                    me.value=[];
                    while (!!(temp=x.iterateNext())) me.value.push(temp);
                    break;

                case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
                case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
                    me.value=[];
                    for (temp=0;temp<x.snapshotLength;++temp) me.value.push(x.snapshotItem(i));
                    break;

                case XPathResult.ANY_UNORDERED_NODE_TYPE:
                case XPathResult.FIRST_ORDERED_NODE_TYPE:
                    me.value=x.singleNodeValue;
                    break;}

            return me.value
        },
        evaluateIE : function() {
            var me = this;
            me.setDocIE();

            return me.value = me.ctx.selectNodes(me.expression);
        },
        setDocIE : function() {
            var x='', me = this;
            if(me.doc instanceof HTMLDocument) {
                me.doc = new ActiveXObject("Msxml2.DOMDocument").appendChild(me.doc.cloneNode(true));
                Ext.apply(me.doc, {async: false, validateOnParse : false })
            }
            me.doc.setProperty("SelectionLanguage", "XPath");
            for (var ns in me.ns) {x += "xmlns" +(ns == ":"? "'": ":'") + this.ns[ns] + "' "};
            me.doc.setProperty("SelectionNamespaces", x);
        }
    },function() {
        var Xp = this;
        if(Ext.isIE){
            Element.prototype.xpath = function(expression,ns) {
                return new Xp( {expression: expression , ns: ns || Xp.prototype.ns, ctx:this, doc:this.ownerDocument || this.elementDocument}).evaluateIE()
            }
        }
        else {
            Node.prototype.xpath = function(expression,ns) {
                return new Xp( {expression: expression , ns: ns || Xp.prototype.ns, ctx:this, doc:this.ownerDocument}).evaluate()
            }
        }
    });

    Ext.define('MyTreeStore',{
        extend: 'Ext.data.TreeStore'
        ,
        alias : 'store.myTreeStore'

    });

    MyTreeStore.override({
//*/
        fillNode: function(node, newNodes) {
            var me = this,
                ln = newNodes ? newNodes.length : 0,
                sorters = me.sorters,
                i, sortCollection,
                needsIndexSort = false,
                performLocalSort = ln && me.sortOnLoad && !me.remoteSort && sorters && sorters.items && sorters.items.length,
                node1, node2;

            // See if there are any differing index values in the new nodes. If not, then we do not have to sortByIndex
            for (i = 1; i < ln; i++) {
                node1 = newNodes[i];
                node2 = newNodes[i - 1];
                needsIndexSort = node1[node1.persistenceProperty].index != node2[node2.persistenceProperty].index;
                if (needsIndexSort) {
                    break;
                }
            }

            // If there is a set of local sorters defined.
            if (performLocalSort) {
                // If sorting by index is needed, sort by index first
                if (needsIndexSort) {
                    me.sorters.insert(0, me.indexSorter);
                }
                sortCollection = new Ext.util.MixedCollection();
                sortCollection.addAll(newNodes);
                sortCollection.sort(me.sorters.items);
                newNodes = sortCollection.items;

                // Remove the index sorter
                me.sorters.remove(me.indexSorter);
            } else if (needsIndexSort) {
                Ext.Array.sort(newNodes, me.sortByIndex);
            }

            node.set('loaded', true);
            for (i = 0; i < ln; i++) {
                if(!node.isRoot()){
                    if(node.raw.node){
                        node.appendChild(newNodes[i], undefined, true);
                        if( !newNodes[i].raw.node ){
                            newNodes[i].set('leaf',true);
                            newNodes[i].set('expaned',true);
                        }
                    }else{
                        node.set('leaf',true);
                        node.set('expaned',true);
                    }
                }else{
                    node.appendChild(newNodes[i], undefined, true);
                }
            }

            return newNodes;
        }
        ,
//*/
//*/
        onNodeAdded: function(parent, node) {

            if(!parent) {
                return;
            }

            var proxy = this.getProxy(),
                reader = proxy.getReader(),
                data = node.raw || node.data,
                dataRoot, children;

            Ext.Array.remove(this.removed, node);

            if (!node.isLeaf() && !node.isLoaded() ) {
                dataRoot = reader.getRoot(data);
                if (dataRoot) {
                    this.fillNode(node, reader.extractData(dataRoot));
                    delete data[reader.root];
                }
            }
        }
//*/
    });
    //http://stackoverflow.com/questions/6263380/extjs4-json-treestore

    /**
     *
     *
     *    {
     "Data":{
     "__type":"ListWrapperOfDepartmentTreeNodewnEzJCii:#PortalMvc.Global.Classlibrary.Model.Ui.JSONWrappers",
     "items":[{
     "ActualHeadcount":0,
     "Headcount":0,
     "Leavers":0,
     "ParentId":"~~",
     "Starters":0,
     "children":[{
     "ActualHeadcount":0,
     ....

     It expects the root to be repeated for each set of child nodes. So for "children" it's also trying to read "Data.items".
     If you can't alter the data structure, the root can also be a function, something like:
     root: function(o) {
     if (o.Data) {
     return o.Data.items;
     } else {
     return o.children;
     }
     }
     */

    /**
     * convert xml to json
     * http://localhost/extgit/test/xmltojson.html
     */
    var store = Ext.create('MyTreeStore', {
        id: 'store',
        model: 'GusModel',
        proxy: {
            type: 'ajax',
//            url: 'treegrid_nested_xml2.xml',
            url: 'test_case_tree_xml_bug.xml',
//            url: 'treegrid_nested_json2.json',
//            url: 'treegrid_nested_json3.json',
            reader: {
                type:'myreader'        ,
//                root:'explorer' ,
//                record:'node'
                root: 'categories',
                record: 'category'
//                ,
//                root: function(o) {
//                    return o;
//                    if (o.explorer) { //root
//
//                        return o.explorer.node;     // for treegrid_nested_json2.json
//                    } else {
//                        return o.node; // for    treegrid_nested_json.json
//                    }
//                }
            }
        }
        ,
        root: {
            name: 'People',
            label: 'People',
            nodeid: 'root_nodeid',
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
        title: 'nested_xml_tree_not_work',
        store: store,
        rootVisible	: true,
//        rootVisible	: false,
        // grid columns
        columns: [
            {   xtype: 'treecolumn',
                text:'name',
//                dataIndex: 'label',
                dataIndex: 'name',
                flex: 1
            }
            ,
            {   text: 'nodeid',
//                dataIndex: 'nodeid',
                dataIndex: 'id',
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

