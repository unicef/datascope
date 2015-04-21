var _ = require('lodash'),
    React = require('react/addons');

var LocalDatascope = React.createClass({
    propTypes: {
        data: React.PropTypes.array.isRequired,
        schema: React.PropTypes.object.isRequired,
        initialQuery: React.PropTypes.object
    },
    getInitialState() {
        return {
            displayData: _.clone(this.props.data),
            query: {}
        }
    },

    _searchData(data, searchQueries) {
        var searchableKeys = ['name', 'company'];

        return _.filter(data, d => {
            return _.any(searchQueries, searchQuery => {
                //return _.any(searchQuery.fields, key => {
                return _.any(searchableKeys, key => {
                    return (d[key] + '').toLowerCase().indexOf(searchQuery.value.toLowerCase()) > -1;
                })
            });
        })
    },
    _sortData(data, sortQuery) {
        // WARNING this mutates the data array
        //return _.sortBy(data, sortQuery.key);
        return data.sort((a, b) => {
            var key = sortQuery.key,
                order = sortQuery.order.toLowerCase().indexOf('asc') === 0 ? 1 : -1;
            return (b[key] - a[key]) * order;
        })
    },

    onChangeQuery(query) {
        console.log('new query', query);
        var displayData = _.clone(this.props.data);
        var hasSearch = _.isObject(query.search) && _.keys(query.search).length,
            hasSort = query.sort && !_.isUndefined(query.sort.key);

        displayData = hasSearch ? this._searchData(displayData, query.search) : displayData;
        displayData = hasSort ? this._sortData(displayData, query.sort) : displayData;

        this.setState({displayData, query});
    },

    render() {
        return <div>
            {React.Children.map(this.props.children, child => {
                var propsToPass =  _.omit(this.props, ['children']);
                propsToPass.onChangeQuery = this.onChangeQuery;
                propsToPass.data = this.state.displayData;
                propsToPass.query = this.state.query;
                return React.addons.cloneWithProps(child, propsToPass);
            })}
        </div>
    }
});

module.exports = LocalDatascope;
