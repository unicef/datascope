var _ = require('lodash'),
    React = require('react/addons');

const PropTypes = React.PropTypes;

/**
 * Datascope is the main wrapper class which passes data down the tree (to children as props.data)
 * and queries back up the tree (via the onChangeQuery callback).
 */

var Datascope = React.createClass({
    propTypes: {
        data: PropTypes.array,
        schema: PropTypes.shape({
            items: PropTypes.shape({
                properties: PropTypes.object
            })
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
    getDefaultProps() {
        return {
            query: {},
            onChangeQuery: function(){}
        }
    },

    onChangeSearch(searchId, value, fields) {
        var query = !_.isObject(this.props.query.search) ?
            React.addons.update(this.props.query, {search: {$set: {[searchId]: {value, fields}}}}) :
            React.addons.update(this.props.query, {search: {[searchId]: {$set: {value, fields}}}});

        this.props.onChangeQuery(query);
        //this.forceUpdate();
    },
    onChangeSort(key, order) {
        order = order || 'descending';
        var sortObj = (_.isUndefined(key) || _.isNull(key)) ? undefined : {key, order};
        var query = React.addons.update(this.props.query, {sort: {$set: sortObj}});

        this.props.onChangeQuery(query);
        //this.forceUpdate();
    },
    onChangeFilter(key, filterObj) {
        console.log('new filter', filterObj);
        var query = !_.isObject(this.props.query.filter) ?
            React.addons.update(this.props.query, {filter: {$set: {[key]: filterObj}}}) :
            React.addons.update(this.props.query, {filter: {$merge: {[key]: filterObj}}});

        this.props.onChangeQuery(query);
        //this.forceUpdate();
    },

    render() {
        const query = this.props.query;
        const {onChangeSearch, onChangeSort, onChangeFilter} = this;
        const allProps = _.assign(
            _.pick(this.props, ['data', 'schema', 'query']),
            {onChangeSearch, onChangeSort, onChangeFilter},
            {
                filter: _.isObject(query.filter) ? query.filter : {},
                sortKey: query.sort ? query.sort.key : null,
                sortOrder: query.sort ? query.sort.order : null
            }
        );
        const datascopeProps = _.pick(this.props, ['data', 'schema', 'query']);

        const sortProps = {onChangeSort,
            sort: _.isObject(query.sort) ? query.sort : {},
            sortKey: query.sort ? query.sort.key : null,
            sortOrder: query.sort ? query.sort.order : null
        };
        const filterProps = {onChangeFilter, filter: _.isObject(query.filter) ? query.filter : {}};
        const searchProps = {onChangeSearch};


        //console.log('consumerProps', datascopeProps, sortProps, filterProps, searchProps);

        // Recursively traverse children, cloning Datascope modules and adding their required props
        // React 0.14 should introduce a new feature: parent-based contexts
        // When 0.14 lands, we should be able to use context for this instead
        return <div>
            {this.recursiveCloneChildren(this.props.children, datascopeProps, sortProps, filterProps, searchProps)}
        </div>

        //return <div>
        //    {React.Children.map(this.props.children, child => {
        //        var childImplements = _.isFunction(child.type.implementsInterface) ?
        //            child.type.implementsInterface : () => false;
        //        var query = this.props.query;
        //        var propsToPass = _.pick(this.props, ['data', 'schema', 'query']);
        //
        //        if(childImplements('DatascopeSearch')) {
        //            var searchQuery = _.isObject(query.search) ? query.search[child.props.id] : undefined;
        //            var searchValue = _.isObject(searchQuery) ? searchQuery.value || '' : '';
        //            propsToPass.onChangeSearch = this.onChangeSearch;
        //            propsToPass.value = searchValue;
        //        }
        //
        //        if(childImplements('DatascopeSort')) {
        //            propsToPass.sortKey = query.sort ? query.sort.key : null;
        //            propsToPass.sortOrder = query.sort ? query.sort.order : null;
        //            propsToPass.onChangeSort = this.onChangeSort;
        //        }
        //        if(childImplements('DatascopeFilter')) {
        //            propsToPass.filter = _.isObject(query.filter) ? query.filter : {};
        //            propsToPass.onChangeFilter = this.onChangeFilter;
        //        }
        //
        //        console.log('passing from datascope', propsToPass);
        //        return React.addons.cloneWithProps(child, propsToPass);
        //        //return React.cloneElement(child, propsToPass);
        //    })}
        //</div>;
    },
    recursiveCloneChildren(children, datascopeProps, sortProps, filterProps,  searchProps) {
        return React.Children.map(children, child => {

            if(!_.isObject(child)) return child;

            console.log('traversing ', child.type.displayName || child.type);
            const childImplements = _.isFunction(child.type.implementsInterface) ?
                child.type.implementsInterface : () => false;
            var childProps = {};

            if(childImplements('Datascope')) {
                childProps = _.extend(childProps, datascopeProps,
                    childImplements('DatascopeSort') ? sortProps : null,
                    childImplements('DatascopeFilter') ? filterProps : null,
                    childImplements('DatascopeSearch') ? searchProps : null
                );
                console.log('Datascope child ', childProps);
                //child = React.cloneElement(child, childProps);
            }

            childProps.children = this.recursiveCloneChildren(child.props.children,
                datascopeProps, sortProps, filterProps, searchProps);

            return React.cloneElement(child, childProps);
            //return child;
        })
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