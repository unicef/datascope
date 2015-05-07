'use strict';

var _ = require('lodash'),
    React = require('react/addons');

var PropTypes = React.PropTypes;

var RadioGroup = React.createClass({
    displayName: 'RadioGroup',

    render: function render() {
        var _this = this;

        return React.createElement(
            'div',
            _.omit(this.props, 'onChange'),
            React.Children.map(this.props.children, function (child) {
                var propsToPass = _.pick(_this.props, 'name');
                propsToPass.checked = _this.props.value !== null && _this.props.value === child.props.value;
                propsToPass.onClick = _this.props.onChange.bind(null, child.props.value);
                return React.cloneElement(child, propsToPass);
            })
        );
    }
});

var FilterInputCheckbox = React.createClass({
    displayName: 'FilterInputCheckbox',

    propTypes: {
        // schema describing the field
        schema: PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            type: PropTypes.string,
            constraints: PropTypes.shape({
                oneOf: PropTypes.array,
                items: PropTypes.shape({
                    oneOf: PropTypes.array
                })
            })
        }),
        filter: PropTypes.object,

        // provide name, label, values to override the schema
        // unique name for this collection of checkboxes (for name attribute)
        name: PropTypes.string,
        // human-readable label for this collection of checkboxes
        label: PropTypes.string,
        // list of possible values for the checkboxes, in one of two formats:
        // ['val1', 'val2', 'val3', ...] // OR...
        // [{label: "Value 1", value: 'val1'}, {label: "Value 2", value: 'val2'}, ...]
        // if the former, array values will be used for both labels and input values
        values: PropTypes.array
    },
    componentWillMount: function componentWillMount() {
        this._validateProps();
    },
    componentWillReceiveProps: function componentWillReceiveProps() {
        this._validateProps();
    },

    _validateProps: function _validateProps() {
        if (_.isNull(this._getName())) throw 'FilterInputCheckbox requires schema or `name` prop';
        if (_.isNull(this._getValues())) throw 'FilterInputCheckbox requires schema or `values` prop';
    },
    _getName: function _getName() {
        return _.isString(this.props.name) ? this.props.name : _.isObject(this.props.schema) && _.has(this.props.schema, 'name') ? this.props.schema.name : null;
    },
    _getLabel: function _getLabel() {
        return _.isString(this.props.label) ? this.props.label : _.isObject(this.props.schema) && _.has(this.props.schema, 'label') ? this.props.schema.title : this._getName();
    },
    _getValues: function _getValues() {
        var schema = this.props.schema;
        return _.isArray(this.props.values) ? this.props.values : // use values if passed
        schema && schema.constraints && schema.constraints.items && _.isArray(schema.constraints.items.oneOf) ? schema.constraints.items.oneOf : null; // othewise values specified in schema.constraints.items.oneOf
    },
    _getSelectedValues: function _getSelectedValues() {
        return _.isObject(this.props.filter) && _.has(this.props.filter, 'intersects') ? this.props.filter.intersects : [];
    },

    onClickCheckbox: function onClickCheckbox(value, e) {
        var selectedValues = this._getSelectedValues().slice(); // copy so we don't modify props
        var valueIndex = _.indexOf(selectedValues, value);
        valueIndex > -1 ? selectedValues.splice(valueIndex, 1) : selectedValues.push(value);
        var newFilter = selectedValues.length ? { intersects: selectedValues } : null;
        this.props.onChange(this._getName(), newFilter);
    },

    render: function render() {
        var _this2 = this;

        var name = this._getName();
        var values = this._getValues();
        var selectedValues = this._getSelectedValues();

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                null,
                this._getLabel()
            ),
            values.map(function (value) {
                var label = (_.has(value, 'label') ? value.label : value) + '';
                value = _.has(value, 'value') ? value.value : value;
                var isSelected = _.indexOf(selectedValues, value) > -1;
                return React.createElement(
                    'label',
                    null,
                    React.createElement('input', { type: 'checkbox',
                        name: name,
                        value: value,
                        checked: isSelected,
                        onClick: _this2.onClickCheckbox.bind(null, value)
                    }),
                    label
                );
            })
        );
    }
});

module.exports = FilterInputCheckbox;
//return value.label