var _ = require('lodash'),
    React = require('react/addons'),
    moment = require('moment'),
    numeral = require('numeral');

const PropTypes = React.PropTypes;

/**
 * Datascope is the main wrapper class which passes data down the tree (to children as props.data)
 * and queries back up the tree (via the onChangeQuery callback).
 */

var Datascope = React.createClass({
    propTypes: {
        data: PropTypes.array, // the (filtered/searched/sorted/paginated) data to display
        schema: PropTypes.shape({ // json-schema representing the shape of the data
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

    componentWillMount() {
        // generate fields from schema properties, but override them with any passed in this.props.fields
        //var fields = _.assign({}, fieldsFromSchema(this.props.schema), this.props.fields);
        var {fields, orderedFields} = initFields(this.props.fields, this.props.schema);
        this.setState({fields, orderedFields});
    },

    onChangeSearch(searchId, value, fields) {
        var query = !_.isObject(this.props.query.search) ?
            React.addons.update(this.props.query, {search: {$set: {[searchId]: {value, fields}}}}) :
            React.addons.update(this.props.query, {search: {[searchId]: {$set: {value, fields}}}});

        this.props.onChangeQuery(query);
    },
    onChangeSort(key, order) {
        order = order || 'descending';
        var sortObj = (_.isUndefined(key) || _.isNull(key)) ? undefined : {key, order};
        var query = React.addons.update(this.props.query, {sort: {$set: sortObj}});

        this.props.onChangeQuery(query);
    },
    onChangeFilter(key, filterObj) {
        console.log('new filter', filterObj);
        var query = !_.isObject(this.props.query.filter) ?
            React.addons.update(this.props.query, {filter: {$set: {[key]: filterObj}}}) :
            React.addons.update(this.props.query, {filter: {$merge: {[key]: filterObj}}});

        this.props.onChangeQuery(query);
    },
    onChangePagination(pagination) {
        // todo keep all the pagination things in sync - let paginator just change page and auto update the rest
        var query = React.addons.update(this.props.query, {pagination: {$set: pagination}});
        this.props.onChangeQuery(query);
    },

    render() {
        const query = this.props.query;
        const {onChangeSearch, onChangeSort, onChangeFilter, onChangePagination} = this;
        const allProps = _.assign(
            _.pick(this.props, ['data', 'schema', 'query']),
            {onChangeSearch, onChangeSort, onChangeFilter},
            {
                filter: _.isObject(query.filter) ? query.filter : {},
                sortKey: query.sort ? query.sort.key : null,
                sortOrder: query.sort ? query.sort.order : null
            }
        );

        const {fields, orderedFields} = this.state;
        const datascopeProps = _.assign({},
            _.pick(this.props, ['data', 'schema', 'query']),
            {fields, orderedFields}
        );
        const sortProps = {onChangeSort,
            sort: _.isObject(query.sort) ? query.sort : {},
            sortKey: query.sort ? query.sort.key : null,
            sortOrder: query.sort ? query.sort.order : null
        };
        const filterProps = {onChangeFilter, filter: _.isObject(query.filter) ? query.filter : {}};
        const searchProps = {onChangeSearch};

        const paginationProps = {
            onChangePagination,
            pagination: _.isObject(query.pagination) ? query.pagination : {}
        };

        // Recursively traverse children, cloning Datascope modules and adding their required props
        // React 0.14 should introduce a new feature: parent-based contexts
        // When 0.14 lands, we may be able to use context for this instead
        return <div>
            {this.recursiveCloneChildren(this.props.children,
                datascopeProps, sortProps, filterProps, searchProps, paginationProps)}
        </div>;
    },
    recursiveCloneChildren(children, datascopeProps, sortProps, filterProps, searchProps, paginationProps) {
        return React.Children.map(children, child => {
            if(!_.isObject(child)) return child;

            const childImplements = _.isFunction(child.type.implementsInterface) ?
                child.type.implementsInterface : () => false;
            var childProps = {};

            if(childImplements('Datascope')) {
                if(childImplements('DatascopeSearch')) {
                    var searchQuery = _.isObject(datascopeProps.query.search) ?
                        datascopeProps.query.search[child.props.id] : undefined;
                    var searchValue = _.isObject(searchQuery) ? searchQuery.value || '' : '';
                    searchProps = _.assign({}, searchProps, {
                        value: searchValue
                    })
                }

                childProps = _.extend(childProps, datascopeProps,
                    childImplements('DatascopeSort') ? sortProps : null,
                    childImplements('DatascopeFilter') ? filterProps : null,
                    childImplements('DatascopeSearch') ? searchProps : null,
                    childImplements('DatascopePagination') ? paginationProps : null
                );
            }

            childProps.children = this.recursiveCloneChildren(child.props.children,
                datascopeProps, sortProps, filterProps, searchProps);

            return React.cloneElement(child, childProps);
        })
    }
});


var fieldDefaults = {
    numberFormat: '0,0',
    dateFormat: '',
    test: 'd',
    renderers: {
        string: _.identity,
        boolean: function defaultBooleanRenderer(v) { return v+''; },
        number: function defaultNumberRenderer(v) { return v+''; },
        null: function defaultNullRenderer(v) { return v+''; },
        array: function defaultArrayRenderer(v) { return v && v.length ? v.join(', ') : v+''; }
    }
};

function initFields(definedFields, schema) {
    var fields = fieldsFromSchema(schema);

    _.each(definedFields, (definedField, fieldName) => {
        // either fieldName must be in fields, or field must have .key attribute
        let fieldKey = _.has(definedField, 'key') ? definedField.key :
            (fieldName in schema.items.properties) ? fieldName : null;
        if(!fieldKey) throw "Datascope: could not match field " + fieldName + "to a schema property";
        // fill in unknown (implicit) parts of defined fields
        var fieldSchema = schema.items.properties[fieldKey];
        var fieldProps = _.pick(definedField, ['title', 'weight', 'renderer', 'format']);
        fieldProps.name = fieldName;
        fieldProps.key = fieldKey;
        if(fieldProps.format && !fieldProps.renderer) {
            if(fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
                fieldProps.renderer = (v, field) => numeral(v).format(fieldProps.format);
            } else if(fieldSchema.type === 'string' && fieldSchema.format === 'date-time') {
                fieldProps.renderer = (v, field) => moment(v).format(fieldProps.format);
            }
        }
        // override the default field props (from schema) with user-provided field props
        if(fieldName in fields) _.assign(fields[fieldName], fieldProps);
        else fields[fieldName] = fieldProps;
    });

    var orderedFields = _.sortBy(fields, 'weight');

    return {fields, orderedFields};
}

function fieldsFromSchema(schema) {
    if(!schema || !schema.items || !schema.items.properties) return [];
    return _(schema.items.properties).map((propSchema, key) => {
        return [key, {
            title: propSchema.title || key,
            key: key,
            name: key,
            renderer: (propSchema.type && propSchema.type in fieldDefaults.renderers) ?
                fieldDefaults.renderers[propSchema.type] : v => v+''
        }]
    }).object().value();
}

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