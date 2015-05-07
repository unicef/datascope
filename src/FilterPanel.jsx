var _ = require('lodash'),
    React = require('react/addons'),
    InterfaceMixin = require('./InterfaceMixin'),
    FilterInputRadio = require('./FilterInputRadio');

const PropTypes = React.PropTypes;

var FilterPanel = React.createClass({
    mixins: [InterfaceMixin('DatascopeFilter')],
    propTypes: {
        filter: React.PropTypes.objectOf(React.PropTypes.object),
        fields: React.PropTypes.array,
        schema: React.PropTypes.object
    },
    getDefaultProps: function() {
        return {
            filter: {},
            schema: {}
        }
    },

    onChangeFilterInput(key, filterObj) {
        console.log('changed FilterPanel input', key, filterObj);
        this.props.onChangeFilter(key, filterObj)
    },

    render() {
        const fieldSchemasByName = _.indexBy(this.props.schema.fields, 'name');
        return (
            <div className="datascope-filter-panel">
                {React.Children.map(this.props.children, child => {
                    const childKey = child.props.field;
                    var propsToPass = {
                        onChange: this.onChangeFilterInput,
                        filter: this.props.filter[childKey],
                        schema: fieldSchemasByName[childKey]
                    };
                    console.log('passing to filter input', propsToPass);

                    return React.cloneElement(child, propsToPass);
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