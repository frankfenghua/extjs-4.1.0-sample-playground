Ext.define('MyExt.view.NewStationView', {
    extend: 'Ext.form.field.ComboBox',
    emptyText: 'Search station',
    alias: 'widget.newstation',
    store: 'SearchResultsStore',
    queryMode: 'local',
    displayField: 'name',
    valueField: 'id'
});