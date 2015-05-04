var _ = require('lodash'),
    React = require('react/addons'),
    InterfaceMixin = require('../InterfaceMixin');

var SearchBar = React.createClass({
    mixins: [InterfaceMixin('DatascopeSearch')],
    propTypes: {
        onChangeSearch: React.PropTypes.func, // required
        id: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
        fields: React.PropTypes.array,
        value: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            id: 'searchbar' // pass unique id to have multiple independent search bars within one Datascope
        }
    },


    onChangeSearch(e) {
        this.props.onChangeSearch(this.props.id, e.target.value, this.props.fields);
    },

    render() {
        const propsToPass = _.omit(this.props, ['id', 'fields', 'value', 'onChangeSearch']);
        return <div>
            <input
                type="text"
                value={this.props.value}
                onChange={this.onChangeSearch}
                {...propsToPass}
            />
        </div>
    }
});

module.exports = SearchBar;