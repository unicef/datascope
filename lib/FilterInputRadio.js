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

var FilterInputRadio = React.createClass({
    displayName: 'FilterInputRadio',

    propTypes: {
        // schema describing the field
        schema: PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            type: PropTypes.string,
            constraints: PropTypes.shape({
                oneOf: PropTypes.array
            })
        }),
        filter: PropTypes.object,

        // provide name, label, values to override the schema
        // unique name for this collection of radio buttons (for name attribute)
        name: PropTypes.string,
        // human-readable label for this collection of radio buttons
        label: PropTypes.string,
        // list of possible values for the radio buttons, in one of two formats:
        // ['val1', 'val2', 'val3', ...] // OR...
        // [{label: "Value 1", value: 'val1'}, {label: "Value 2", value: 'val2'}, ...]
        // if the former, array values will be used for both labels and input values
        values: PropTypes.array,

        // if true, clicking on a selected radio button will deselect it (unlike standard browser behavior)
        shouldDeselect: PropTypes.bool
    },
    getDefaultProps: function getDefaultProps() {
        return { shouldDeselect: true };
    },
    componentWillMount: function componentWillMount() {
        this._validateProps();
    },
    componentWillReceiveProps: function componentWillReceiveProps() {
        this._validateProps();
    },

    _validateProps: function _validateProps() {
        if (_.isNull(this._getName())) throw 'FilterInputRadio requires schema or `name` prop';
        if (_.isNull(this._getValues())) throw 'FilterInputRadio requires schema or `values` prop';
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
        schema && schema.type === 'boolean' ? [true, false] : // if type boolean, values are true/false
        schema && schema.constraints && _.isArray(schema.constraints.oneOf) ? schema.constraints.oneOf : null; // values are schema.constraints.oneOf
    },
    _getSelectedValue: function _getSelectedValue() {
        return _.isObject(this.props.filter) && _.has(this.props.filter, 'eq') ? this.props.filter.eq : null;
    },

    onClickRadio: function onClickRadio(value, e) {
        var newFilter = this.props.shouldDeselect && value === this._getSelectedValue() ? {} : { eq: value };
        this.props.onChange(this._getName(), newFilter);
    },

    render: function render() {
        var name = this._getName();
        var value = this._getSelectedValue();

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                null,
                this._getLabel()
            ),
            React.createElement(
                RadioGroup,
                { ref: 'group', name: this._getName(), value: value, onChange: this.onClickRadio },
                this._getValues().map(function (value) {
                    var label = (_.has(value, 'label') ? value.label : value) + '';
                    value = _.has(value, 'value') ? value.value : value;
                    return React.createElement(
                        'input',
                        {
                            type: 'radio',
                            value: value
                        },
                        label
                    );
                })
            )
        );
    }
});

module.exports = FilterInputRadio;