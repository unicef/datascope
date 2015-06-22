var _ = require('lodash'),
    React = require('react/addons');

const { PropTypes } = React;

var FilterInputCheckbox = React.createClass({
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
    componentWillMount() { this._validateProps() },
    componentWillReceiveProps() { this._validateProps() },

    _validateProps() {
        if(_.isNull(this._getName())) throw "FilterInputCheckbox requires schema or `name` prop";
        if(_.isNull(this._getValues())) throw "FilterInputCheckbox requires schema or `values` prop";
    },
    _getName() {
        return _.isString(this.props.name) ? this.props.name :
            _.isObject(this.props.schema) && _.has(this.props.schema, 'name') ?
                this.props.schema.name : null;
    },
    _getLabel() {
        return _.isString(this.props.label) ? this.props.label :
            _.isObject(this.props.schema) && _.has(this.props.schema, 'label') ?
                this.props.schema.title : this._getName();
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
    _getSelectedValues() {
        return _.isObject(this.props.filter) && _.has(this.props.filter, 'intersects') ?
            this.props.filter.intersects : [];
    },

    onClickCheckbox(value, e) {
        const selectedValues = this._getSelectedValues().slice(); // copy so we don't modify props
        const valueIndex = _.indexOf(selectedValues, value);
        valueIndex > -1 ? selectedValues.splice(valueIndex, 1) : selectedValues.push(value);
        const newFilter = selectedValues.length ? {intersects: selectedValues} : null;
        this.props.onChange(newFilter);
    },

    render() {
        const name = this._getName();
        const values = this._getValues();
        const selectedValues = this._getSelectedValues();

        return <div>
            <div>{this._getLabel()}</div>
            {values.map(listValue => {
                const hasLabelValue = _.has(listValue, 'label') && _.has(listValue, 'label');
                const {label, value} = hasLabelValue ? listValue : {label: listValue, value: listValue};
                const isSelected = _.indexOf(selectedValues, value) > -1;
                return <label>
                    <input type="checkbox"
                       name={name}
                       value={value}
                       checked={isSelected}
                       onClick={this.onClickCheckbox.bind(null, value)}
                    />
                    {label}
                </label>;
                //return value.label
            })}
        </div>
    }
});

module.exports = FilterInputCheckbox;
