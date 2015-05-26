var _ = require('lodash'),
    React = require('react/addons');

var LocalDatascope = React.createClass({
    propTypes: {
        data: React.PropTypes.array,
        schema: React.PropTypes.object,
        initialQuery: React.PropTypes.object,
        pageSize: React.PropTypes.number
    },
    getDefaultProps() {
        return {
            pageSize: 5
        }
    },
    getInitialState() {
        return {
            displayData: _.clone(this.props.data),
            query: {}
        }
    },

    componentWillMount() {
        if(!this.props.pageSize || this.state.query.pagination) { return; }
        var query = React.addons.update(this.state.query,
            {pagination: {$set: {page: 1, offset: 0, limit: this.props.pageSize}}});
        console.log(query);

        let {newQuery, displayData} = this._getDisplayData(query);
        this.setState({query: newQuery, displayData});
    },

    _getDisplayData(query) {
        const hasFilter = _.isObject(query.filter) && _.keys(query.filter).length;
        const hasSearch = _.isObject(query.search) && _.keys(query.search).length;
        const hasSort = query.sort && !_.isUndefined(query.sort.key);
        const hasPagination = _.isObject(query.pagination) && query.pagination.page && query.pagination.limit;

        let displayData = _.clone(this.props.data);
        let newQuery = query;

        displayData = hasFilter ? this._filterData(displayData, query.filter) : displayData;
        displayData = hasSearch ? this._searchData(displayData, query.search) : displayData;
        displayData = hasSort ? this._sortData(displayData, query.sort) : displayData;

        if(hasPagination) {
            // if pagination is past the end of newly-filtered data,
            // reset it to the last page which actually contains data
            if(query.pagination.offset >= displayData.length) {
                const lastPage = Math.floor(displayData.length / query.pagination.limit) + 1;
                const lastOffset = (lastPage - 1) * query.pagination.limit;
                const newPagination = {page: lastPage, offset: lastOffset, limit: query.pagination.limit };
                newQuery = React.addons.update(this.state.query, {pagination: {$set: newPagination}});
            }
            let pagination = newQuery.pagination;
            // then trim the data to paginate
            var pageEndIndex = Math.min(pagination.offset + pagination.limit - 1, displayData.length - 1);
            displayData = displayData.slice(pagination.offset, pageEndIndex + 1);
        }

        return {newQuery: newQuery, displayData: displayData};
    },

    _searchData(data, searchQueries) {
        const propSchemas = this.props.schema.items.properties;
        const stringFieldKeys = _(propSchemas).keys()
            .filter(key => propSchemas[key].type === 'string').value();
        return _.filter(data, d => {
            return _.any(searchQueries, searchQuery => {
                const searchableKeys = searchQuery.fields || stringFieldKeys;
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
                order = sortQuery.order.toLowerCase().indexOf('asc') === 0 ? -1 : 1,
                field = this.props.schema.items.properties[key],
                comparator = (field.type === 'string') ? stringComparator : numberComparator;
            return comparator(a[key], b[key]) * order;
        })
    },
    _filterData(data, filterQuery) {
        return _.filter(data, d => {
            return _.all(filterQuery, (filterObj, key) => matchesFilter(d, filterObj, key));
        })
    },

    _paginateData(data, paginationQuery) {

    },

    onChangeQuery(query) {
        console.log('new query', query);
        var {newQuery, displayData} = this._getDisplayData(query);
        this.setState({query: newQuery, displayData});
    },

    render() {
        return <div>
            {React.Children.map(this.props.children, child => {
                var propsToPass =  _.omit(this.props, ['children']);
                propsToPass.onChangeQuery = this.onChangeQuery;
                propsToPass.data = this.state.displayData;
                propsToPass.query = this.state.query;
                //return React.addons.cloneWithProps(child, propsToPass);
                return React.cloneElement(child, propsToPass);
            })}
        </div>
    }
});

function stringComparator(a, b) {
    var aLower = (a+'').toLowerCase(), bLower = (b+'').toLowerCase();
    return aLower > bLower ? 1 : (aLower < bLower ? -1 : 0);
}
function numberComparator(a, b) {
    return a > b ? 1 : (a < b ? -1 : 0);
}

function matchesFilter(objToTest, filter, key) {
    // matcher for our filter query language
    if(!filter) return true;
    var value = objToTest[key];
    if('eq' in filter) return value === filter.eq;
    if(_.isArray(filter.in)) return filter.in.indexOf(value) >= 0;
    if(_.isArray(filter.intersects)) {
        return _.intersection(filter.intersects, _.pluck(value, 'value')).length > 0;
    }
    if(_.isNumber(filter.gt) || _.isNumber(filter.lt)) {
        return ('gt' in filter ? value >= filter.gt : true) &&
               ('lt' in filter ? value <= filter.lt : true);
    }
    return true;
}

module.exports = LocalDatascope;
