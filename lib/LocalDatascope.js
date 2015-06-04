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
            paginated: true,
            pageSize: 200
        };
    },
    getInitialState: function getInitialState() {
        return {
            displayData: _.clone(this.props.data),
            query: this.props.initialQuery || {}
        };
    },

    componentWillMount: function componentWillMount() {
        var query = this.state.query;

        if (this.props.paginated) {
            // initialize pagination
            query = React.addons.update(query, { pagination: { $set: { page: 1, offset: 0, limit: this.props.pageSize, total: this.props.data.length }
                } });
        }

        this.setState(this._getDisplayData(query));
    },

    _getDisplayData: function _getDisplayData(query) {
        var hasFilter = _.isObject(query.filter) && _.keys(query.filter).length;
        var hasSearch = _.isObject(query.search) && _.keys(query.search).length;
        var hasSort = query.sort && !_.isUndefined(query.sort.key);
        var hasPagination = _.isObject(query.pagination);

        var displayData = _.clone(this.props.data);

        displayData = hasFilter ? this._filterData(displayData, query.filter) : displayData;
        displayData = hasSearch ? this._searchData(displayData, query.search) : displayData;
        displayData = hasSort ? this._sortData(displayData, query.sort) : displayData;
        if (hasPagination) {
            var paginated = this._paginateData(displayData, query.pagination);
            displayData = paginated.data;
            query = _.assign({}, query, { pagination: paginated.pagination });
        }

        return { query: query, displayData: displayData };
    },

    _filterData: function _filterData(data, filterQuery) {
        return _.filter(data, function (d) {
            return _.all(filterQuery, function (filterObj, key) {
                return matchesFilter(d, filterObj, key);
            });
        });
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

        // WARNING this mutates the data array so call it with a copy
        //return _.sortBy(data, sortQuery.key);
        return data.sort(function (a, b) {
            var key = sortQuery.key,
                order = sortQuery.order.toLowerCase().indexOf('asc') === 0 ? -1 : 1,
                field = _this.props.schema.items.properties[key],
                comparator = field.type === 'string' ? stringComparator : numberComparator;
            return comparator(a[key], b[key]) * order;
        });
    },
    _paginateData: function _paginateData(data, pagination) {
        // if pagination is past the end of newly-filtered data,
        // reset it to the last page which actually contains data
        var newPagination = undefined;
        if (pagination.offset >= data.length) {
            var lastPage = Math.floor(data.length / pagination.limit) + 1;
            var lastOffset = (lastPage - 1) * pagination.limit;
            newPagination = {
                page: lastPage,
                offset: lastOffset,
                limit: pagination.limit,
                total: data.length
            };
        } else {
            newPagination = _.assign({}, pagination, { total: data.length });
        }

        // trim the data to paginate from [offset] to [offset + limit]
        var pageEndIndex = Math.min(newPagination.offset + newPagination.limit - 1, data.length - 1);
        var newData = data.slice(newPagination.offset, pageEndIndex + 1);

        return { data: newData, pagination: newPagination };
    },

    onChangeQuery: function onChangeQuery(query) {
        //console.log('new query', query);
        var newState = this._getDisplayData(query);
        this.setState(newState);
    },

    render: function render() {
        var _this2 = this;

        return React.createElement(
            'div',
            { className: 'local-datascope' },
            React.Children.map(this.props.children, function (child) {
                return React.cloneElement(child, _.assign({}, _.omit(_this2.props, ['children']), {
                    onChangeQuery: _this2.onChangeQuery,
                    data: _this2.state.displayData,
                    query: _this2.state.query
                }));
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
    } else if (_.isDate(filter.gt) || _.isNumber(filter.lt)) {
        return ('gt' in filter ? new Date(value) >= filter.gt : true) && ('lt' in filter ? new Date(value) <= filter.lt : true);
    }
    return true;
}

module.exports = LocalDatascope;