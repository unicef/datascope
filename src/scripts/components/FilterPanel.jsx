var _ = require('lodash'),
    React = require('react/addons'),
    InterfaceMixin = require('../InterfaceMixin');



var FilterInputRadio = React.createClass({
    propTypes: {
        // unique name for this collection of radio buttons (for name attribute)
        name: React.PropTypes.string,
        // human-readable label for this collection of radio buttons
        label: React.PropTypes.string,
        // list of possible values for the radio buttons, in one of two formats:
        // ['val1', 'val2', 'val3', ...] // OR...
        // [{label: "Value 1", value: 'val1'}, {label: "Value 2", value: 'val2'}, ...]
        // if the former, array values will be used for both labels and input values
        values: React.PropTypes.array.isRequired,
        // if true, clicking on a selected radio button will deselect it (unlike standard browser behavior)
        shouldDeselect: React.PropTypes.bool
    },
    onClickRadio(value, e) {
        console.log('radio change', value, e.currentTarget);
        this.props.onChange(this.props.name, {eq: value});
    },
    render() {
        return <div>
            <div>{this.props.name}</div>
            {this.props.values.map(value => {
                var label = (_.has(value, 'label') ? value.label : value) + '';
                value = (_.has(value, 'value') ? value.value : value);

                return <input
                    onChange={this.onClickRadio.bind(null, value)}
                    type="radio"
                    name={this.props.name || 'radio-input'}
                    value={value}
                >
                    {label}
                </input>
            })}
        </div>
    }
});


var FilterPanel = React.createClass({
    mixins: [InterfaceMixin('DatascopeFilter')],
    propTypes: {
        filter: React.PropTypes.objectOf(React.PropTypes.object),
        fields: React.PropTypes.array,
        schema: React.PropTypes.object
    },

    onChangeFilterInput(key, filterObj) {
        console.log('changed FilterPanel input', key, filterObj);
        this.props.onChangeFilter(key, filterObj)
    },

    render() {
        return (
            <div className="datascope-filter-panel">
                I'm a little filter panel
                {this.props.fields.map(fieldKey => {
                    console.log(fieldKey);
                    var fieldSchema = _.find(this.props.schema.fields, fieldSchema => fieldSchema.name == fieldKey);

                    //return fieldSchema.type;
                    return fieldSchema.type == 'boolean' ?
                        <FilterInputRadio
                            name={fieldKey}
                            values={[true, false]}
                            onChange={this.onChangeFilterInput} />
                        : 'not';
                })}
            </div>
        );
    },
    renderChildren() {

    },
    renderBooleanInput() {
        return <div>

        </div>
    }
});




module.exports = FilterPanel;