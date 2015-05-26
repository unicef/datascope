'use strict';

var _ = require('lodash'),
    React = require('react/addons');

var LocalDatascope = React.createClass({
    displayName: 'LocalDatascope',

    propTypes: {
        data: React.PropTypes.array,
        schema: React.PropTypes.object,
        initialQuery: React.PropTypes.object,
        pageSize: React.PropTypes.number
    },
    getDefaultProps: function getDefaultProps() {
        return {
            pageSize: 5
        };
    },
    getInitialState: function getInitialState() {
        return {
            displayData: _.clone(this.props.data),
            query: {}
        };
    },

    componentWillMount: function componentWillMount() {
        if (!this.props.pageSize || this.state.query.pagination) {
            return;
        }
        var query = React.addons.update(this.state.query, { pagination: { $set: { page: 1, offset: 0, limit: this.props.pageSize } } });
        console.log(query);

        var _getDisplayData = this._getDisplayData(query);

        var newQuery = _getDisplayData.newQuery;
        var displayData = _getDisplayData.displayData;

        this.setState({ query: newQuery, displayData: displayData });
    },

    _getDisplayData: function _getDisplayData(query) {
        var hasFilter = _.isObject(query.filter) && _.keys(query.filter).length;
        var hasSearch = _.isObject(query.search) && _.keys(query.search).length;
        var hasSort = query.sort && !_.isUndefined(query.sort.key);
        var hasPagination = _.isObject(query.pagination) && query.pagination.page && query.pagination.limit;

        var displayData = _.clone(this.props.data);
        var newQuery = query;

        displayData = hasFilter ? this._filterData(displayData, query.filter) : displayData;
        displayData = hasSearch ? this._searchData(displayData, query.search) : displayData;
        displayData = hasSort ? this._sortData(displayData, query.sort) : displayData;

        if (hasPagination) {
            // if pagination is past the end of newly-filtered data,
            // reset it to the last page which actually contains data
            if (query.pagination.offset >= displayData.length) {
                var lastPage = Math.floor(displayData.length / query.pagination.limit) + 1;
                var lastOffset = (lastPage - 1) * query.pagination.limit;
                var newPagination = { page: lastPage, offset: lastOffset, limit: query.pagination.limit };
                newQuery = React.addons.update(this.state.query, { pagination: { $set: newPagination } });
            }
            var pagination = newQuery.pagination;
            // then trim the data to paginate
            var pageEndIndex = Math.min(pagination.offset + pagination.limit - 1, displayData.length - 1);
            displayData = displayData.slice(pagination.offset, pageEndIndex + 1);
        }

        return { newQuery: newQuery, displayData: displayData };
    },

    _searchData: function _searchData(data, searchQueries) {
        var propSchemas = this.props.schema.items.properties;
        var stringFieldKeys = _(propSchemas).keys().filter(function (key) {
            return propSchemas[key].type === 'string';
        }).value();
        return _.filter(data, function (d) {
            return _.any(searchQueries, function (searchQuery) {
                var searchableKeys = searchQuery.fields || stringFieldKeys;
                return _.any(searchableKeys, function (key) {
                    return (d[key] + '').toLowerCase().indexOf(searchQuery.value.toLowerCase()) > -1;
                });
            });
        });
    },
    _sortData: function _sortData(data, sortQuery) {
        var _this = this;

        // WARNING this mutates the data array
        //return _.sortBy(data, sortQuery.key);
        return data.sort(function (a, b) {
            var key = sortQuery.key,
                order = sortQuery.order.toLowerCase().indexOf('asc') === 0 ? -1 : 1,
                field = _this.props.schema.items.properties[key],
                comparator = field.type === 'string' ? stringComparator : numberComparator;
            return comparator(a[key], b[key]) * order;
        });
    },
    _filterData: function _filterData(data, filterQuery) {
        return _.filter(data, function (d) {
            return _.all(filterQuery, function (filterObj, key) {
                return matchesFilter(d, filterObj, key);
            });
        });
    },

    _paginateData: function _paginateData(data, paginationQuery) {},

    onChangeQuery: function onChangeQuery(query) {
        console.log('new query', query);

        var _getDisplayData2 = this._getDisplayData(query);

        var newQuery = _getDisplayData2.newQuery;
        var displayData = _getDisplayData2.displayData;

        this.setState({ query: newQuery, displayData: displayData });
    },

    render: function render() {
        var _this2 = this;

        return React.createElement(
            'div',
            null,
            React.Children.map(this.props.children, function (child) {
                var propsToPass = _.omit(_this2.props, ['children']);
                propsToPass.onChangeQuery = _this2.onChangeQuery;
                propsToPass.data = _this2.state.displayData;
                propsToPass.query = _this2.state.query;

                return React.cloneElement(child, propsToPass);
            })
        );
    }
});

function stringComparator(a, b) {
    var aLower = (a + '').toLowerCase(),
        bLower = (b + '').toLowerCase();
    return aLower > bLower ? 1 : aLower < bLower ? -1 : 0;
}
function numberComparator(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
}

function matchesFilter(objToTest, filter, key) {
    // matcher for our filter query language
    if (!filter) return true;
    var value = objToTest[key];
    if ('eq' in filter) return value === filter.eq;
    if (_.isArray(filter['in'])) return filter['in'].indexOf(value) >= 0;
    if (_.isArray(filter.intersects)) {
        return _.intersection(filter.intersects, _.pluck(value, 'value')).length > 0;
    }
    if (_.isNumber(filter.gt) || _.isNumber(filter.lt)) {
        return ('gt' in filter ? value >= filter.gt : true) && ('lt' in filter ? value <= filter.lt : true);
    }
    return true;
}

module.exports = LocalDatascope;
//return React.addons.cloneWithProps(child, propsToPass);