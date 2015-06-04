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
        this.props.onChangeFilter(key, filterObj);
    },

    render: function render() {
        var _this = this;

        var propSchemas = this.props.schema.items.properties;
        return React.createElement(
            'div',
            { className: 'datascope-filter-panel' },
            React.Children.map(this.props.children, function (child) {
                var childKey = child.props.name;
                if (_.isUndefined(childKey)) throw 'children of FilterPanel must have name';

                var propsToPass = {
                    schema: propSchemas[childKey],
                    filter: _this.props.filter[childKey],
                    onChange: _this.onChangeFilterInput.bind(_this, childKey)
                };

                return React.cloneElement(child, propsToPass);
            })
        );
    }
});

module.exports = FilterPanel;