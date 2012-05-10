Ext.Loader.setConfig ({
    disableCaching:false
});


Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*'
//    'Acme.store.TreeStore'
]);

Ext.onReady(function() {
    //====================
//   overrideXmlReader
//====================
    /*modify extract Data so as to allow an xpath selector*/
    Ext.define('CustomXmlReader',{
        requires:'Ext.data.reader.Xml'
    },function(){
        Ext.override(Ext.data.reader.Xml, {
            extractData: function(root) {
                var me = this;
                var recordName = me.record,
                    selector	= me.selector;

                if (!recordName) {
                    Ext.Error.raise('Record is a required parameter');
                }
                if (recordName != root.nodeName) {
//                    root = Ext.DomQuery.select(selector ? selector : ('.//' + recordName), root);

                     root = Ext.DomQuery.select(recordName, root);
                } else {
                    root = [root];
                }
                return this.callParent([root]);
            }
        });
    });


    Ext.DomQuery.select = document.xpath ?
        function(path, root, type) {
            root = root || document;
            if (Ext.DomQuery.isXml(root)) {
                return root.xpath(path)
            }
            return Ext.DomQuery.jsSelect.call(this, path, root, type);
        }
        : function(path, root, type) {
            return Ext.DomQuery.jsSelect.call(this, path, root, type)
        };



    Ext.define('Ext.ux.xpath',{
        singleton	: true,
        ns 			: {
            ":": "http://www.w3.org/1999/xhtml11",
            "xsl": "http://www.w3.org/1999/XSL/Transform",
            "xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsd": "http://www.w3.org/2001/XMLSchema",
            "xf": "http://www.w3.org/2002/xforms",
            "ev": "http://www.w3.org/2001/xml-events",
            "ext": "http://www.sencha.com"
        }
    });
    Ext.define('Ext.ux.xpath.Xpath', {
        expression	: '.',
        ns 			: Ext.ux.xpath.ns,

        constructor: function(config){
            var me = this;
            Ext.apply(me,config);
            if(!me.expression)
            {
                me.expression = '.'
            };
            if(me.expression.substring(0,2) == '.[')
            {
                me.expression = 'self::node()' +me.expression.substring(1)
            } // bug ?? in chrome not evaluation .[@attribute]  or .[element]

            if(!me.ctx)
            {
                me.ctx = document
            };
            if(!me.doc)
            {
                me.doc= me instanceof Document ? me: document
            };
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
                    me.ns ? function(prefix) {
                        return me.ns[prefix ? prefix : ":"] || null
                    }
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
            {
                case XPathResult.NUMBER_TYPE:
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
                    for (temp=0;temp<x.snapshotLength;++temp){
                        me.value.push(x.snapshotItem(i));
                    }
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
            for (var ns in me.ns)
            {
                x += "xmlns" +(ns == ":"? "'": ":'") + this.ns[ns] + "' "
            };
            me.doc.setProperty("SelectionNamespaces", x);
        }
    },function() {
        var Xp = this;
        if(Ext.isIE){
            Element.prototype.xpath = function(expression,ns) {return new Xp( {expression: expression , ns: ns || Xp.prototype.ns, ctx:this, doc:this.ownerDocument || this.elementDocument}).evaluateIE()}
        }
        else {
            Node.prototype.xpath = function(expression,ns)
            {
                return new Xp(
                    {
                        expression: expression ,
                        ns: ns || Xp.prototype.ns,
                        ctx:this,
                        doc:this.ownerDocument
                    }).evaluate()
            }
        }
    });

    Ext.define( 'HPO.XML.Document', {
        mixins: {
            observable: 'Ext.util.Observable'
        },

        requires: [
            'Ext.DomQuery',
            'Ext.Ajax'
        ],

        config: {
            prefixes: null,
            document: null,
            request: null,
            defaultType: XPathResult.ANY_TYPE
        },

        document_node: null,
        resolver_func: null,
        active_request: null,

        constructor: function( config ) {
            this.addEvents([
                'beforeload',
                'load',
                'change',
                'exception'
            ]);

            config = config || {};
            if ( config.documentElement ) {
                config = { document: config };
            }
            else if ( Ext.isString(config) || config.url ) {
                config = { request: config };
            }

            this.initConfig( config );
            this.mixins.observable.constructor.call(this, config);

            return this;
        },

        setPrefixes: function( ns ) {
            var me = this;

            this.prefixes = null;
            if ( Ext.isFunction(ns) ) {
                this.resolverfunc = ns;
            }
            else if ( Ext.isObject(ns) ) {
                this.prefixes = ns;
                this.resolverfunc = function( prefix ) {
                    return me.prefixes[prefix] || null;
                };
            }
            else {
                this.resolverfunc = null;
            }

            return this;
        },

        setRequest: function( request ) {
            this.request = request;
            if ( request ) {
                this.load( request );
            }
            return this;
        },

        setDocument: function( doc ) {
            var old = this.document;
            this.document = doc;
            this.document_node = doc ? doc.documentElement : null;
            if ( doc !== null || old !== null ) {
                this.fireEvent( 'change', this );
            }
            return this;
        },

        correctRequest: function( request ) {
            if ( Ext.isString(request) ) {
                request = { url: request };
            }

            return request;
        },

        load: function( request ) {
            request = this.correctRequest( request );

            Ext.apply( request, {
                scope: this,
                success: function( response, options ) {
                    this.active_request = null;
                    this.setDocument( response.responseXML );
                    this.fireEvent( 'load', this, response, options );
                },
                failure: function( response, options ) {
                    this.active_request = null;
                    this.document_node = null;
                    this.fireEvent( 'exception', this, response, options );
                }
            });

            if ( this.fireEvent( 'beforeload', request, this ) !== false ) {
                this.active_request = Ext.Ajax.request( request );
            }
        },

        isLoading: function() {
            return this.active_request ? Ext.Ajax.isLoading( this.active_request ) : false;
        },

        hasContent: function() {
            return (this.document_node != null);
        },

        getRoot: function() {
            return this.document_node;
        },

        createResolver: function( node ) {
            return this.resolverfunc ? this.resolverfunc : this.document.createNSResolver( node ? node : this.document_node );
        },

        resolveContext: function( context ) {
            return context ? context : this.document_node;
        },

        CSS: function( selector, context ) {
            return Ext.DomQuery.select( selector, this.resolveContext( context ) );
        },

        CSSNode: function( selector, context ) {
            return Ext.DomQuery.selectNode( selector, this.resolveContext( context ) );
        },

        CSSValue: function( selector, context, defvalue ) {
            return Ext.DomQuery.selectValue( selector, this.resolveContext( context ), defvalue );
        },

        CSSNumber: function( selector, context, defvalue ) {
            return Ext.DomQuery.selectNumber( selector, this.resolveContext( context ), defvalue );
        },

        _collect: function( iter, extract, idpath ) {
            var res,t;
            var xexpr, xres;

            if ( idpath ) {
                res = {};
                t = iter.iterateNext();
                if ( t ) {
                    xexpr = t.ownerDocument.createExpression( idpath, this.createResolver( t ) );
                    do {
                        xres = xexpr.evaluate( t, XPathResult.STRING_TYPE, xres );
                        res[xres.stringValue] = extract(t);
                    }
                    while ( t = iter.iterateNext() );
                }
            }
            else {
                res = [];
                while ( t = iter.iterateNext() ) {
                    res.push( extract(t) );
                }
            }
            return res;
        },

        XPath: function( selector, context, type ) {
            var c = this.resolveContext( context );

            return this.document.evaluate( selector, c, this.createResolver( c ), type || this.defaultType, null );
        },

        XPathNode: function( selector, context ) {
            var res = this.XPath( selector, context, XPathResult.FIRST_ORDERED_NODE_TYPE );
            return res.singleNodeValue;
        },

        XPathNodes: function( selector, context, idpath ) {
            return this._collect(
                this.XPath( selector, context, XPathResult.ORDERED_ITERATOR_TYPE ),
                function(node) { return node; },
                idpath
            );
        },

        XPathString: function( selector, context, defvalue ) {
            var res = this.XPath( selector, context, XPathResult.STRING_TYPE );
            return Ext.isEmpty(res.stringValue, true) ? defvalue : res.stringValue;
        },

        XPathStrings: function( selector, context, idpath ) {
            return this._collect(
                this.XPath( selector, context, XPathResult.ORDERED_ITERATOR_TYPE ),
                function(node) { return node.textContent; },
                idpath
            );
        },

        XPathNumber: function( selector, context, defvalue ) {
            var res = this.XPath( selector, context, XPathResult.NUMBER_TYPE );
            return Ext.isEmpty( res.numberValue ) ? defvalue : res.numberValue;
        },

        XPathNumbers: function( selector, context, idpath ) {
            return this._collect(
                this.XPath( selector, context, XPathResult.ORDERED_ITERATOR_TYPE ),
                function(node) { return Number(node.textContent); },
                idpath
            );
        },

        XPathBool: function( selector, context, defvalue ) {
            var res = this.XPath( selector, context, XPathResult.BOOLEAN_TYPE );
            return Ext.isEmpty( res.booleanValue ) ? defvalue : res.booleanValue;
        },

        XPathBools: function( selector, context, idpath ) {
            return this._collect(
                this.XPath( selector, context, XPathResult.ORDERED_ITERATOR_TYPE ),
                function(node) { return Boolean(node.textContent); },
                idpath
            );
        }

    });

    store2 =Ext.create("Ext.data.TreeStore", {
        fields:[
            { name: "label", type: "string"},
            { name: "leaf", type: "boolean" },
            { name: "description", type: "string"  }
        ],
        proxy: {
            url: "hack.xml",
            type: "ajax",
            reader: {
                type: "xml",
                root: "root",
                record: "items >item"
            }
        },
        root: {
            label: "root",
            text: "ACME",
            id: "text",
            expanded: true
        }
//        sorters: [{
//            property: "leaf",
//            direction: "ASC"
//        }, {
//            property: "text",
//            direction: "ASC"
//        }]
    });


    tree2 = Ext.create('Ext.tree.Panel', {
        title: 'Core Team Projects',
        width: 400,
        height: 300,
        collapsible: true,
        useArrows: false,
        rootVisible: true,
        store: store2,
        multiSelect: true,
        singleExpand: false,
        //the 'columns' property is now 'headers'
        columns: [{
            xtype: 'treecolumn', //this is so we know which column will show the tree
            text: 'label',
            flex: 2,
            sortable: true,
            dataIndex: 'label'
        },{
            //we must use the templateheader component so we can use a custom tpl
//            xtype: 'treecolumn',
            text: 'leaf',
            flex: 1,
//            sortable: true,
            dataIndex: 'leaf',
            align: 'center'
        },{
            text: 'description',
            flex: 1,
            dataIndex: 'description'
        }]
    });


    win = Ext.create('Ext.window.Window', {
        title: 'Hello',
        height: 400,
        width: 400,
        layout: 'fit',
        items: [
            tree2
        ]
    });

//    store2.load();
    win.show();
});
