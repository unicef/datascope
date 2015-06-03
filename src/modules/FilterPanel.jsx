var _ = require('lodash'),
    React = require('react/addons'),
    InterfaceMixin = require('./../InterfaceMixin'),
    FilterInputRadio = require('./FilterInputRadio');

const PropTypes = React.PropTypes;

var FilterPanel = React.createClass({
    mixins: [InterfaceMixin('Datascope', 'DatascopeFilter')],
    propTypes: {
        filter: React.PropTypes.objectOf(React.PropTypes.object),
        fields: React.PropTypes.array,
        schema: React.PropTypes.object
    },
    getDefaultProps: function() {
        return {
            filter: {},
            schema: {},
            testing: 4
        }
    },

    onChangeFilterInput(key, filterObj) {
        console.log('changed FilterPanel input', key, filterObj);
        this.props.onChangeFilter(key, filterObj)
    },

    render() {
        //const fieldSchemasByName = _.indexBy(this.props.schema.items.properties, 'name');
        const propSchemas = this.props.schema.items.properties;
        return (
            <div className="datascope-filter-panel">
                {React.Children.map(this.props.children, child => {
                    const childKey = child.props.name;

                    console.log('FilterInput props', this.props);
                    var propsToPass = {
                        //name: childKey,
                        schema: propSchemas[childKey],
                        filter: this.props.filter[childKey],
                        onChange: this.onChangeFilterInput.bind(this, childKey)
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