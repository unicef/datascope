import _ from 'lodash';
import React from 'react/addons';
const { PropTypes } = React;

const RadioGroup = React.createClass({
    render: function() {
        return (
            <div {..._.omit(this.props, 'onChange')}>
                {React.Children.map(this.props.children, child => {
                    var propsToPass = _.pick(this.props, 'name');
                    propsToPass.checked = (this.props.value !== null) && (this.props.value === child.props.value);
                    propsToPass.onClick = this.props.onChange.bind(null, child.props.value);
                    return React.cloneElement(child, propsToPass)
                })}
            </div>
        );
    }
});

const FilterInputRadio = React.createClass({
    propTypes: {
        // schema describing the field
        schemaold: PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            title: PropTypes.string,
            type: PropTypes.string,
            constraints: PropTypes.shape({
                oneOf: PropTypes.array
            })
        }),

        schema: PropTypes.object,

        filter: PropTypes.object,

        // provide name, label, values optionally to override the schema
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
    getDefaultProps: function() {
        return { shouldDeselect: true }
    },
    componentWillMount() { this._validateProps() },
    componentWillReceiveProps() { this._validateProps() },

    _validateProps() {
        if(!this.props.name) throw "FilterInputRadio requires a `name` prop";
        if(_.isNull(this._getValues())) throw "FilterInputRadio requires valid schema or `values` prop";
    },
    _getTitle() {
        // todo if neither exist, use schema key (pass from parent as another prop?)
        return _.isString(this.props.title) ? this.props.title :
            _.isObject(this.props.schema) && _.has(this.props.schema, 'title') ?
                this.props.schema.title : this.props.name;
    },
    _getValues() {
        const schema = this.props.schema;
        return _.isArray(this.props.values) ? this.props.values : // use values if passed
            schema && schema.type === 'boolean' ? [true, false] : // if type boolean, values are true/false
            schema && schema.enum ? schema.type.enum : // enumerated values
            schema && schema.oneOf && // another way of enumerating values, which puts the labels in the schema instead
                _.every(schema.oneOf, s => _.has(s, 'enum') && s.enum.length == 1) ?
                schema.oneOf.map(aSchema => aSchema.enum[0]) : // todo: deal with labels for this type
            null;
    },
    _getSelectedValue() {
        return _.isObject(this.props.filter) && _.has(this.props.filter, 'eq') ?
            this.props.filter.eq : null;
    },

    onClickRadio(value, e) {
        const newFilter = this.props.shouldDeselect && value === this._getSelectedValue() ?
            {} : {eq: value};
        this.props.onChange(newFilter);
    },

    render() {
        const value = this._getSelectedValue();

        return <div className="ds-radio-filter">
            <div className="ds-radio-filter-title">
                {this._getTitle()}
            </div>

            <RadioGroup
                className="ds-radio-group"
                ref='group'
                name={this.props.name}
                value={value}
                onChange={this.onClickRadio}
                >
                {this._getValues().map(value => {
                    var label = (_.has(value, 'label') ? value.label : value) + '';
                    value = (_.has(value, 'value') ? value.value : value);
                    return (
                            <input
                                className="ds-radio-input"
                                type="radio"
                                value={value}
                                >
                                <span className="ds-radio-input-label">
                                    {label}
                                </span>
                            </input>
                    )
                })}
            </RadioGroup>

        </div>
    }
});

export default FilterInputRadio;