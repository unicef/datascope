'use strict';

var _ = require('lodash'),
    React = require('react/addons');

var LocalDatascope = React.createClass({
    displayName: 'LocalDatascope',

    propTypes: {
        data: React.PropTypes.array.isRequired,
        schema: React.PropTypes.object.isRequired,
        initialQuery: React.PropTypes.object
    },
    getInitialState: function getInitialState() {
        return {
            displayData: _.clone(this.props.data),
            query: {}
        };
    },

    _searchData: function _searchData(data, searchQueries) {
        var stringFieldKeys = _(this.props.schema.fields).filter(function (f) {
            return f.type === 'string';
        }).pluck('name').value();
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
        // WARNING this mutates the data array
        //return _.sortBy(data, sortQuery.key);
        return data.sort(function (a, b) {
            var key = sortQuery.key,
                order = sortQuery.order.toLowerCase().indexOf('asc') === 0 ? -1 : 1;
            return (b[key] - a[key]) * order;
        });
    },
    _filterData: function _filterData(data, filterQuery) {
        return _.filter(data, function (d) {
            return _.all(filterQuery, function (filterObj, key) {
                return matchesFilter(d, filterObj, key);
            });
        });
    },

    onChangeQuery: function onChangeQuery(query) {
        console.log('new query', query);
        var displayData = _.clone(this.props.data);
        var hasFilter = _.isObject(query.filter) && _.keys(query.filter).length,
            hasSearch = _.isObject(query.search) && _.keys(query.search).length,
            hasSort = query.sort && !_.isUndefined(query.sort.key);

        displayData = hasFilter ? this._filterData(displayData, query.filter) : displayData;
        displayData = hasSearch ? this._searchData(displayData, query.search) : displayData;
        displayData = hasSort ? this._sortData(displayData, query.sort) : displayData;

        this.setState({ displayData: displayData, query: query });
    },

    render: function render() {
        var _this = this;

        return React.createElement(
            'div',
            null,
            React.Children.map(this.props.children, function (child) {
                var propsToPass = _.omit(_this.props, ['children']);
                propsToPass.onChangeQuery = _this.onChangeQuery;
                propsToPass.data = _this.state.displayData;
                propsToPass.query = _this.state.query;
                return React.addons.cloneWithProps(child, propsToPass);
            })
        );
    }
});

function matchesFilter(objToTest, filter, key) {
    // matcher for our filter query language
    if (!filter) {
        return true;
    }var value = objToTest[key];
    if ('eq' in filter) {
        return value === filter.eq;
    }if (_.isArray(filter['in'])) {
        return filter['in'].indexOf(value) >= 0;
    }if (_.isArray(filter.intersects)) {
        return _.intersection(filter.intersects, value).length > 0;
    }if (_.isNumber(filter.gt) || _.isNumber(filter.lt)) {
        return ('gt' in filter ? value >= filter.gt : true) && ('lt' in filter ? value <= filter.lt : true);
    }
    return true;
}

module.exports = LocalDatascope;