'use strict';

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: key == null || typeof Symbol == 'undefined' || key.constructor !== Symbol, configurable: true, writable: true }); };

var _ = require('lodash'),
    React = require('react/addons');

var PropTypes = React.PropTypes;

var Datascope = React.createClass({
    displayName: 'Datascope',

    propTypes: {
        data: PropTypes.array,
        schema: PropTypes.shape({
            fields: PropTypes.arrayOf(PropTypes.object)
        }),
        query: PropTypes.shape({
            search: PropTypes.objectOf(PropTypes.shape({
                value: PropTypes.string,
                fields: PropTypes.array
            })),
            sort: PropTypes.shape({
                key: PropTypes.string,
                order: PropTypes.string
            }),
            filter: PropTypes.objectOf(PropTypes.object)
        }),
        onChangeQuery: React.PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return { onChangeQuery: function onChangeQuery() {} };
    },

    onChangeSearch: function onChangeSearch(searchId, value, fields) {
        var query = !_.isObject(this.props.query.search) ? React.addons.update(this.props.query, { search: { $set: _defineProperty({}, searchId, { value: value, fields: fields }) } }) : React.addons.update(this.props.query, { search: _defineProperty({}, searchId, { $set: { value: value, fields: fields } }) });

        this.props.onChangeQuery(query);
    },
    onChangeSort: function onChangeSort(key, order) {
        order = order || 'descending';
        var sortObj = _.isUndefined(key) || _.isNull(key) ? undefined : { key: key, order: order };
        var query = React.addons.update(this.props.query, { sort: { $set: sortObj } });

        this.props.onChangeQuery(query);
    },
    onChangeFilter: function onChangeFilter(key, filterObj) {
        console.log('new filter', filterObj);
        var query = !_.isObject(this.props.query.filter) ? React.addons.update(this.props.query, { filter: { $set: _defineProperty({}, key, filterObj) } }) : React.addons.update(this.props.query, { filter: { $merge: _defineProperty({}, key, filterObj) } });
        this.props.onChangeQuery(query);
    },

    render: function render() {
        var _this = this;

        return React.createElement(
            'div',
            null,
            React.Children.map(this.props.children, function (child) {
                var childImplements = _.isFunction(child.type.implementsInterface) ? child.type.implementsInterface : function () {
                    return false;
                };
                var query = _this.props.query;
                var propsToPass = _.pick(_this.props, ['data', 'schema', 'query']);

                if (childImplements('DatascopeSearch')) {
                    var searchQuery = _.isObject(query.search) ? query.search[child.props.id] : undefined;
                    var searchValue = _.isObject(searchQuery) ? searchQuery.value || '' : '';
                    propsToPass.onChangeSearch = _this.onChangeSearch;
                    propsToPass.value = searchValue;
                }

                if (childImplements('DatascopeSort')) {
                    propsToPass.sortKey = query.sort ? query.sort.key : null;
                    propsToPass.sortOrder = query.sort ? query.sort.order : null;
                    propsToPass.onChangeSort = _this.onChangeSort;
                }
                if (childImplements('DatascopeFilter')) {
                    propsToPass.filter = _.isObject(query.filter) ? query.filter : undefined;
                    propsToPass.onChangeFilter = _this.onChangeFilter;
                }

                return React.addons.cloneWithProps(child, propsToPass);
            })
        );
    }
});

// datascope will keep a query object in state which represents all the rules by which the data will be displayed:
// `fields` limits which data fields are used
// `filters` are simple filters for individual column values, allowed filter types:
//      `eq` - exact match
//      `lt` - less than (number only)
//      `gt` - greater than (number only)
//      `in` - list of values, of which the column value must be one
//      `intersects` - for data type `array` only, a list of values which filter the data such that:
//                     length(intersection(dataList, thisList)) > 0
// `searches` are search terms meant to fuzzy match, potentially against multiple fields
// `sort` describes how the data should be sorted (column key and order)

//var mockQuery = {
//    fields: ['name', 'age', 'company', 'gender', 'email'],
//    filters: {
//        isActive: { eq: true },
//        age: { gt: 30 }
//    },
//    search: {
//        search1: {
//            value: 'com', // the string to search for
//            fields: ['email', 'name']
//        }
//    },
//    sort: {
//        key: 'age',
//        order: 'descending'
//    }
//};

module.exports = Datascope;