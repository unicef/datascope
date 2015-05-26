'use strict';

var _ = require('lodash'),
    React = require('react/addons'),
    InterfaceMixin = require('./../InterfaceMixin'),
    FilterInputRadio = require('./FilterInputRadio');

var PropTypes = React.PropTypes;

var FilterPanel = React.createClass({
    displayName: 'FilterPanel',

    mixins: [InterfaceMixin('Datascope', 'DatascopeFilter')],
    propTypes: {
        filter: React.PropTypes.objectOf(React.PropTypes.object),
        fields: React.PropTypes.array,
        schema: React.PropTypes.object
    },
    getDefaultProps: function getDefaultProps() {
        return {
            filter: {},
            schema: {},
            testing: 4
        };
    },

    onChangeFilterInput: function onChangeFilterInput(key, filterObj) {
        console.log('changed FilterPanel input', key, filterObj);
        this.props.onChangeFilter(key, filterObj);
    },

    render: function render() {
        var _this = this;

        var fieldSchemasByName = _.indexBy(this.props.schema.fields, 'name');
        return React.createElement(
            'div',
            { className: 'datascope-filter-panel' },
            React.Children.map(this.props.children, function (child) {
                var childKey = child.props.field;

                console.log('FilterInput props', _this.props);
                var propsToPass = {
                    onChange: _this.onChangeFilterInput,
                    filter: _this.props.filter[childKey],
                    schema: fieldSchemasByName[childKey]
                };

                console.log('passing to filter input', propsToPass);

                return React.cloneElement(child, propsToPass);
            })
        );
    },
    renderChildren: function renderChildren() {},
    renderBooleanInput: function renderBooleanInput() {
        return React.createElement('div', null);
    }
});

module.exports = FilterPanel;