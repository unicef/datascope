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
        this.props.onChangeFilter(key, filterObj)
    },

    render() {
        const propSchemas = this.props.schema.items.properties;
        return (
            <div className="datascope-filter-panel">
                {this.recursiveCloneChildren(this.props.children)}
            </div>
        );
    },
    recursiveCloneChildren(children) {
        return React.Children.map(children, child => {
            if(!_.isObject(child)) return child;

            let childProps = {};
            const isFilter = child.props && child.props.name;
            if(isFilter) {
                const childKey = child.props.name;
                const propSchemas = this.props.schema.items.properties;
                childProps = {
                    schema: propSchemas[childKey],
                    filter: this.props.filter[childKey],
                    onChange: this.onChangeFilterInput.bind(this, childKey)
                };
            }

            if(child.props.children)
                childProps.children = this.recursiveCloneChildren(child.props.children);

            return React.cloneElement(child, childProps);
        })
    }
});


module.exports = FilterPanel;