var _ = require('lodash'),
    React = require('react/addons');

const { PropTypes } = React;

var RadioGroup = React.createClass({
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

var FilterInputRadio = React.createClass({
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
        values: PropTypes.array.isRequired,

        // if true, clicking on a selected radio button will deselect it (unlike standard browser behavior)
        shouldDeselect: PropTypes.bool
    },
    getDefaultProps: function() {
        return { shouldDeselect: true }
    },
    componentWillMount() { this._validateProps() },
    componentWillReceiveProps() { this._validateProps() },

    _validateProps() {
        if(_.isNull(this._getName())) throw "FilterInputRadio requires schema or `name` prop";
        if(_.isNull(this._getValues())) throw "FilterInputRadio requires schema or `values` prop";
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
            schema && schema.constraints && _.isArray(schema.constraints.oneOf) ?
                schema.constraints.oneOf : null; // values are schema.constraints.oneOf
    },
    _getSelectedValue() {
        return _.isObject(this.props.filter) && _.has(this.props.filter, 'eq') ?
            this.props.filter.eq : null;
    },

    onClickRadio(value, e) {
        const newFilter = this.props.shouldDeselect && value === this._getSelectedValue() ?
            {} : {eq: value};
        this.props.onChange(this._getName(), newFilter);
    },

    render() {
        const name = this._getName();
        const value = this._getSelectedValue();

        return <div>
            <div>{this._getLabel()}</div>

            <RadioGroup ref='group' name={this._getName()} value={value} onChange={this.onClickRadio}>
                {this._getValues().map(value => {
                    var label = (_.has(value, 'label') ? value.label : value) + '';
                    value = (_.has(value, 'value') ? value.value : value);
                    return (
                        <input
                            type="radio"
                            value={value}
                        >
                            {label}
                        </input>
                    )
                })}
            </RadioGroup>

        </div>
    }
});

module.exports = FilterInputRadio;