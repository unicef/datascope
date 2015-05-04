/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
	    Datascope: __webpack_require__(1),
	    LocalDatascope: __webpack_require__(2),

	    DataTable: __webpack_require__(3),

	    FilterPanel: __webpack_require__(4),
	    FilterInputCheckbox: __webpack_require__(5),
	    FilterInputRadio: __webpack_require__(6),

	    SearchBar: __webpack_require__(7),

	    InterfaceMixin: __webpack_require__(8)
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: key == null || typeof Symbol == 'undefined' || key.constructor !== Symbol, configurable: true, writable: true }); };

	var _ = __webpack_require__(9),
	    React = __webpack_require__(10);

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

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(9),
	    React = __webpack_require__(10);

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

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: key == null || typeof Symbol == 'undefined' || key.constructor !== Symbol, configurable: true, writable: true }); };

	var _ = __webpack_require__(9);
	var React = __webpack_require__(10);
	var FixedDataTable = __webpack_require__(11);
	var InterfaceMixin = __webpack_require__(8);

	var isColumnResizing;

	var DataTable = React.createClass({
	    displayName: 'DataTable',

	    mixins: [InterfaceMixin('DatascopeSort')],
	    propTypes: {
	        // data displayed on the table
	        data: React.PropTypes.array.isRequired,
	        // data schema
	        schema: React.PropTypes.object.isRequired,
	        // key for the column which the data is sorted on (eg. 'age')
	        sortKey: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
	        // order for the sort ('ascending' or 'descending')
	        sortOrder: React.PropTypes.string,
	        // callback to call when user changes sort
	        onChangeSort: React.PropTypes.func.isRequired
	    },
	    componentWillMount: function componentWillMount() {
	        var _this = this;

	        this.width = 1000;
	        var fields = this.props.schema.fields;
	        this.setState({
	            columnWidths: _.object(_.map(fields, function (field) {
	                return [field.name, _this.width / fields.length];
	            }))
	        });
	    },

	    onColumnResizeEndCallback: function onColumnResizeEndCallback(newColumnWidth, dataKey) {
	        var columnWidths = React.addons.update(this.state.columnWidths, _defineProperty({}, dataKey, { $set: newColumnWidth }));
	        this.setState({ columnWidths: columnWidths });
	        isColumnResizing = false;
	    },
	    onClickColumnHeader: function onClickColumnHeader(dataKey) {
	        var isSortedOnColumn = dataKey === this.props.sortKey,
	            isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0;

	        // if not already sorted by this, sort descending
	        // if already sorted descending by this, sort ascending
	        // if already sorted ascending by this, remove sort
	        var sortKey = !isSortedOnColumn || !isSortAscending ? dataKey : undefined;
	        var sortOrder = !isSortedOnColumn ? 'descending' : !isSortAscending ? 'ascending' : undefined;
	        this.props.onChangeSort(sortKey, sortOrder);
	    },

	    render: function render() {
	        var _this2 = this;

	        return React.createElement(
	            'div',
	            null,
	            React.createElement(
	                FixedDataTable.Table,
	                {
	                    rowHeight: 50,
	                    rowGetter: function (i) {
	                        return _this2.props.data[i];
	                    },
	                    rowsCount: this.props.data.length,
	                    width: 1000,
	                    maxHeight: 5000,
	                    headerHeight: 50,
	                    isColumnResizing: isColumnResizing,
	                    onColumnResizeEndCallback: this.onColumnResizeEndCallback
	                },
	                _.map(this.props.schema.fields, function (field) {
	                    var isSortedOnColumn = field.name === _this2.props.sortKey,
	                        isSortAscending = (_this2.props.sortOrder || '').toLowerCase().indexOf('asc') === 0,
	                        sortArrow = isSortedOnColumn ? isSortAscending ? ' ▲' : ' ▼' : '';

	                    return React.createElement(FixedDataTable.Column, {
	                        label: field.title + sortArrow,
	                        dataKey: field.name,
	                        width: _this2.state.columnWidths[field.name] || 100,
	                        isResizable: true,
	                        headerRenderer: _this2.renderColumnHeader,
	                        sortKey: _this2.props.sortKey,
	                        key: field.name
	                    });
	                })
	            )
	        );
	    },
	    renderColumnHeader: function renderColumnHeader(label, cellDataKey, columnData, rowData, width) {
	        return React.createElement(
	            'div',
	            { onClick: this.onClickColumnHeader.bind(this, cellDataKey) },
	            label
	        );
	    }
	});

	module.exports = DataTable;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(9),
	    React = __webpack_require__(10),
	    InterfaceMixin = __webpack_require__(8),
	    FilterInputRadio = __webpack_require__(6);

	var PropTypes = React.PropTypes;

	var FilterPanel = React.createClass({
	    displayName: 'FilterPanel',

	    mixins: [InterfaceMixin('DatascopeFilter')],
	    propTypes: {
	        filter: React.PropTypes.objectOf(React.PropTypes.object),
	        fields: React.PropTypes.array,
	        schema: React.PropTypes.object
	    },
	    getDefaultProps: function getDefaultProps() {
	        return {
	            filter: {},
	            schema: {}
	        };
	    },

	    onChangeFilterInput: function onChangeFilterInput(key, filterObj) {
	        console.log('changed FilterPanel input', key, filterObj);
	        this.props.onChangeFilter(key, filterObj);
	    },

	    render: function render() {
	        var _this = this;

	        var fieldSchemasByName = _.indexBy(this.props.schema.fields, 'name');
	        return React.createElement(
	            'div',
	            { className: 'datascope-filter-panel' },
	            'I\'m a little filter panel',
	            React.Children.map(this.props.children, function (child) {
	                var childKey = child.props.field;
	                var propsToPass = {
	                    onChange: _this.onChangeFilterInput,
	                    filter: _this.props.filter[childKey],
	                    schema: fieldSchemasByName[childKey]
	                };
	                console.log('passing to filter input', propsToPass);

	                return React.cloneElement(child, propsToPass);
	            })
	        );
	    },
	    renderChildren: function renderChildren() {},
	    renderBooleanInput: function renderBooleanInput() {
	        return React.createElement('div', null);
	    }
	});

	module.exports = FilterPanel;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(9),
	    React = __webpack_require__(10);

	var PropTypes = React.PropTypes;

	var RadioGroup = React.createClass({
	    displayName: 'RadioGroup',

	    render: function render() {
	        var _this = this;

	        return React.createElement(
	            'div',
	            _.omit(this.props, 'onChange'),
	            React.Children.map(this.props.children, function (child) {
	                var propsToPass = _.pick(_this.props, 'name');
	                propsToPass.checked = _this.props.value !== null && _this.props.value === child.props.value;
	                propsToPass.onClick = _this.props.onChange.bind(null, child.props.value);
	                return React.cloneElement(child, propsToPass);
	            })
	        );
	    }
	});

	var FilterInputCheckbox = React.createClass({
	    displayName: 'FilterInputCheckbox',

	    propTypes: {
	        // schema describing the field
	        schema: PropTypes.shape({
	            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	            title: PropTypes.string,
	            type: PropTypes.string,
	            constraints: PropTypes.shape({
	                oneOf: PropTypes.array,
	                items: PropTypes.shape({
	                    oneOf: PropTypes.array
	                })
	            })
	        }),
	        filter: PropTypes.object,

	        // provide name, label, values to override the schema
	        // unique name for this collection of checkboxes (for name attribute)
	        name: PropTypes.string,
	        // human-readable label for this collection of checkboxes
	        label: PropTypes.string,
	        // list of possible values for the checkboxes, in one of two formats:
	        // ['val1', 'val2', 'val3', ...] // OR...
	        // [{label: "Value 1", value: 'val1'}, {label: "Value 2", value: 'val2'}, ...]
	        // if the former, array values will be used for both labels and input values
	        values: PropTypes.array
	    },
	    componentWillMount: function componentWillMount() {
	        this._validateProps();
	    },
	    componentWillReceiveProps: function componentWillReceiveProps() {
	        this._validateProps();
	    },

	    _validateProps: function _validateProps() {
	        if (_.isNull(this._getName())) throw 'FilterInputCheckbox requires schema or `name` prop';
	        if (_.isNull(this._getValues())) throw 'FilterInputCheckbox requires schema or `values` prop';
	    },
	    _getName: function _getName() {
	        return _.isString(this.props.name) ? this.props.name : _.isObject(this.props.schema) && _.has(this.props.schema, 'name') ? this.props.schema.name : null;
	    },
	    _getLabel: function _getLabel() {
	        return _.isString(this.props.label) ? this.props.label : _.isObject(this.props.schema) && _.has(this.props.schema, 'label') ? this.props.schema.title : this._getName();
	    },
	    _getValues: function _getValues() {
	        var schema = this.props.schema;
	        return _.isArray(this.props.values) ? this.props.values : // use values if passed
	        schema && schema.constraints && schema.constraints.items && _.isArray(schema.constraints.items.oneOf) ? schema.constraints.items.oneOf : null; // othewise values specified in schema.constraints.items.oneOf
	    },
	    _getSelectedValues: function _getSelectedValues() {
	        return _.isObject(this.props.filter) && _.has(this.props.filter, 'intersects') ? this.props.filter.intersects : [];
	    },

	    onClickCheckbox: function onClickCheckbox(value, e) {
	        var selectedValues = this._getSelectedValues().slice(); // copy so we don't modify props
	        var valueIndex = _.indexOf(selectedValues, value);
	        valueIndex > -1 ? selectedValues.splice(valueIndex, 1) : selectedValues.push(value);
	        var newFilter = selectedValues.length ? { intersects: selectedValues } : null;
	        this.props.onChange(this._getName(), newFilter);
	    },

	    render: function render() {
	        var _this2 = this;

	        var name = this._getName();
	        var values = this._getValues();
	        var selectedValues = this._getSelectedValues();

	        return React.createElement(
	            'div',
	            null,
	            React.createElement(
	                'div',
	                null,
	                this._getLabel()
	            ),
	            values.map(function (value) {
	                var label = (_.has(value, 'label') ? value.label : value) + '';
	                value = _.has(value, 'value') ? value.value : value;
	                var isSelected = _.indexOf(selectedValues, value) > -1;
	                return React.createElement(
	                    'label',
	                    null,
	                    React.createElement('input', { type: 'checkbox',
	                        name: name,
	                        value: value,
	                        checked: isSelected,
	                        onClick: _this2.onClickCheckbox.bind(null, value)
	                    }),
	                    label
	                );
	            })
	        );
	    }
	});

	module.exports = FilterInputCheckbox;
	//return value.label

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _ = __webpack_require__(9),
	    React = __webpack_require__(10);

	var PropTypes = React.PropTypes;

	var RadioGroup = React.createClass({
	    displayName: 'RadioGroup',

	    render: function render() {
	        var _this = this;

	        return React.createElement(
	            'div',
	            _.omit(this.props, 'onChange'),
	            React.Children.map(this.props.children, function (child) {
	                var propsToPass = _.pick(_this.props, 'name');
	                propsToPass.checked = _this.props.value !== null && _this.props.value === child.props.value;
	                propsToPass.onClick = _this.props.onChange.bind(null, child.props.value);
	                return React.cloneElement(child, propsToPass);
	            })
	        );
	    }
	});

	var FilterInputRadio = React.createClass({
	    displayName: 'FilterInputRadio',

	    propTypes: {
	        // schema describing the field
	        schema: PropTypes.shape({
	            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	            title: PropTypes.string,
	            type: PropTypes.string,
	            constraints: PropTypes.shape({
	                oneOf: PropTypes.array
	            })
	        }),
	        filter: PropTypes.object,

	        // provide name, label, values to override the schema
	        // unique name for this collection of radio buttons (for name attribute)
	        name: PropTypes.string,
	        // human-readable label for this collection of radio buttons
	        label: PropTypes.string,
	        // list of possible values for the radio buttons, in one of two formats:
	        // ['val1', 'val2', 'val3', ...] // OR...
	        // [{label: "Value 1", value: 'val1'}, {label: "Value 2", value: 'val2'}, ...]
	        // if the former, array values will be used for both labels and input values
	        values: PropTypes.array,

	        // if true, clicking on a selected radio button will deselect it (unlike standard browser behavior)
	        shouldDeselect: PropTypes.bool
	    },
	    getDefaultProps: function getDefaultProps() {
	        return { shouldDeselect: true };
	    },
	    componentWillMount: function componentWillMount() {
	        this._validateProps();
	    },
	    componentWillReceiveProps: function componentWillReceiveProps() {
	        this._validateProps();
	    },

	    _validateProps: function _validateProps() {
	        if (_.isNull(this._getName())) throw 'FilterInputRadio requires schema or `name` prop';
	        if (_.isNull(this._getValues())) throw 'FilterInputRadio requires schema or `values` prop';
	    },
	    _getName: function _getName() {
	        return _.isString(this.props.name) ? this.props.name : _.isObject(this.props.schema) && _.has(this.props.schema, 'name') ? this.props.schema.name : null;
	    },
	    _getLabel: function _getLabel() {
	        return _.isString(this.props.label) ? this.props.label : _.isObject(this.props.schema) && _.has(this.props.schema, 'label') ? this.props.schema.title : this._getName();
	    },
	    _getValues: function _getValues() {
	        var schema = this.props.schema;
	        return _.isArray(this.props.values) ? this.props.values : // use values if passed
	        schema && schema.type === 'boolean' ? [true, false] : // if type boolean, values are true/false
	        schema && schema.constraints && _.isArray(schema.constraints.oneOf) ? schema.constraints.oneOf : null; // values are schema.constraints.oneOf
	    },
	    _getSelectedValue: function _getSelectedValue() {
	        return _.isObject(this.props.filter) && _.has(this.props.filter, 'eq') ? this.props.filter.eq : null;
	    },

	    onClickRadio: function onClickRadio(value, e) {
	        var newFilter = this.props.shouldDeselect && value === this._getSelectedValue() ? {} : { eq: value };
	        this.props.onChange(this._getName(), newFilter);
	    },

	    render: function render() {
	        var name = this._getName();
	        var value = this._getSelectedValue();

	        return React.createElement(
	            'div',
	            null,
	            React.createElement(
	                'div',
	                null,
	                this._getLabel()
	            ),
	            React.createElement(
	                RadioGroup,
	                { ref: 'group', name: this._getName(), value: value, onChange: this.onClickRadio },
	                this._getValues().map(function (value) {
	                    var label = (_.has(value, 'label') ? value.label : value) + '';
	                    value = _.has(value, 'value') ? value.value : value;
	                    return React.createElement(
	                        'input',
	                        {
	                            type: 'radio',
	                            value: value
	                        },
	                        label
	                    );
	                })
	            )
	        );
	    }
	});

	module.exports = FilterInputRadio;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _ = __webpack_require__(9),
	    React = __webpack_require__(10),
	    InterfaceMixin = __webpack_require__(8);

	var SearchBar = React.createClass({
	    displayName: 'SearchBar',

	    mixins: [InterfaceMixin('DatascopeSearch')],
	    propTypes: {
	        onChangeSearch: React.PropTypes.func, // required
	        id: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
	        fields: React.PropTypes.array,
	        value: React.PropTypes.string
	    },

	    getDefaultProps: function getDefaultProps() {
	        return {
	            id: 'searchbar' // pass unique id to have multiple independent search bars within one Datascope
	        };
	    },

	    onChangeSearch: function onChangeSearch(e) {
	        this.props.onChangeSearch(this.props.id, e.target.value, this.props.fields);
	    },

	    render: function render() {
	        var propsToPass = _.omit(this.props, ['id', 'fields', 'value', 'onChangeSearch']);
	        return React.createElement(
	            'div',
	            null,
	            React.createElement('input', _extends({
	                type: 'text',
	                value: this.props.value,
	                onChange: this.onChangeSearch
	            }, propsToPass))
	        );
	    }
	});

	module.exports = SearchBar;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// InterfaceMixin takes a list of string "interfaces"
	// and adds a static called implementsInterface to the component that simply checks if an interface is in the list
	// This way, a parent component can pass particular props only to children which implement the relevant interface
	// by checking child.type.implementsInterface('SomeInterface')
	// usage:
	// mixins: [InterfaceMixin('SomeInterface')] // or...
	// mixins: [InterfaceMixin(['SomeInterface', 'AnotherInterface'])]

	"use strict";

	var InterfaceMixin = function InterfaceMixin(interfaces) {
	    interfaces = isStr(interfaces) ? [interfaces] : interfaces;

	    return {
	        statics: {
	            implementsInterface: function implementsInterface(name) {
	                return interfaces.indexOf(name) >= 0;
	            }
	        }
	    };
	};

	function isStr(s) {
	    return typeof s === "string" || s instanceof String;
	}

	module.exports = InterfaceMixin;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("lodash");

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("react/addons");

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = require("fixed-data-table");

/***/ }
/******/ ]);