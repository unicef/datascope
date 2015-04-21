var _ = require('lodash'),
    React = require('react/addons'),
    InterfaceMixin = require('../InterfaceMixin');

var SearchBar = React.createClass({
    mixins: [InterfaceMixin('DatascopeSearch')],
    propTypes: {
        onChangeSearch: React.PropTypes.func.isRequired,
        id: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
        value: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            id: 'searchbar' // pass unique id to have multiple independent search bars within one Datascope
        }
    },


    onChangeSearch(e) {
        this.props.onChangeSearch(this.props.id, e.target.value);
    },

    render() {
        return <div>
            Search
            <input type="text" value={this.props.value} onChange={this.onChangeSearch}/>
        </div>
    }
});

module.exports = SearchBar;