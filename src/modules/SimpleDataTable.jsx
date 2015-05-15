var _ = require('lodash');
var React = require('react/addons');
var PropTypes = React.PropTypes;
var InterfaceMixin = require('./../InterfaceMixin');

var SimpleDataTableCell = React.createClass({
    propTypes: {
        schema: PropTypes.shape({
            name: PropTypes.string
        }), // schema for this field
        row: PropTypes.object // the current data row which contains this cell
    },
    render() {
        return <td>
            {this.props.row[this.props.schema.name]}
        </td>
    }
});

var TableHeaderCell = React.createClass({
    propTypes: {
        schema: PropTypes.shape({
            name: PropTypes.string,
            title: PropTypes.string
        }), // schema for this field
        title: PropTypes.string, // to override schema title
        onClick: PropTypes.func, // usually the sort function
        isSortedBy: PropTypes.bool, // true if the table is sorted by this column
        sortIndicatorAscending: PropTypes.string,
        sortIndicatorDescending: PropTypes.string,
    },
    getDefaultProps() {
        return {
            onClick: null,
            sortIndicatorAscending: ' ▲',
            sortIndicatorDescending: ' ▼'
        }
    },
    _getTitle() {
        return _.isUndefined(this.props.title) ? this.props.schema.title : this.props.title;
    },
    render() {
        const isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0;
        const sortIndicator = this.props.isSortedBy ?
            (isSortAscending ? this.props.sortIndicatorAscending : this.props.sortIndicatorDescending)
            : '';

        return <td onClick={this.props.onClick}>
            {this._getTitle()}
            {sortIndicator}
        </td>
    }
});

var SimpleDataTable = React.createClass({
    mixins: [InterfaceMixin('Datascope', 'DatascopeSort')],
    propTypes: {

        //data: React.PropTypes.array, // required

        //schema: React.PropTypes.object, // required
        // if true, can sort table by clicking header
        sortable: React.PropTypes.bool,
        // key for the column on which the data is sorted (eg. 'age')
        sortKey: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
        // order for the sort ('ascending' or 'descending')
        sortOrder: React.PropTypes.string,
        // callback to call when user changes sort, passed implicitly by Datascope
        onChangeSort: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            sortable: true
        }
    },
    contextTypes: {
        // data displayed on the table, from Datascope
        data: React.PropTypes.array,
        // data schema, from Datascope
        schema: React.PropTypes.object,
        query: React.PropTypes.object,
        sortKey: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
        sortOrder: React.PropTypes.string,
        onChangeSort: PropTypes.func,
        subscribe: PropTypes.func
    },
    //componentDidMount() {
    //    this._reactInternalInstance._context.subscribe(() => {
    //        console.log('hit subscribe!', this);
    //        console.log('context sortkey', this._reactInternalInstance._context.sortKey);
    //        this.forceUpdate();
    //        this.render();
    //    });
    //},

    onClickColumnHeader(dataKey) {
        // hack to get parent-based context, replace with this.context after React 0.14
        //var context = this._reactInternalInstance._context;
        var context = this.context;
        var isSortedOnColumn = (dataKey === context.sortKey);
        var isSortAscending = (context.sortOrder || '').toLowerCase().indexOf('asc') === 0;

        // if not already sorted by this, sort descending by this
        // if already sorted descending by this, sort ascending
        // if already sorted ascending by this, remove sort
        var sortKey = (!isSortedOnColumn || !isSortAscending) ? dataKey : undefined;
        var sortOrder = !isSortedOnColumn ? 'descending' : (!isSortAscending ? 'ascending' : undefined);
        //this.props.onChangeSort(sortKey, sortOrder);
        context.onChangeSort(sortKey, sortOrder);
    },

    render() {
        var children = this.props.children;
        children = _.isUndefined(children) ? [] : (_.isArray(children) ? children : [children]);
        var childColumns = children.filter(child => {
            return _.isFunction(child.type.implementsInterface) && child.type.implementsInterface('DataTableColumn')
        });
        console.log('table context', this.context);

        return childColumns.length ? this.renderColumns(childColumns) : this.renderAll();
    },

    renderAll() {
        //var context = this._reactInternalInstance._context; // hack, replace with this.context @ React 0.14
        var context = this.context;
        return <table>
            <thead>
                <tr>
                {context.schema.fields.map(this.renderColumnHeader)}
                </tr>
            </thead>
            <tbody>
            {context.data.map(this.renderRow)}
            </tbody>
        </table>
    },
    renderColumns(childColumns) {
        //var context = this._reactInternalInstance._context; // hack, replace with this.context @ React 0.14
        var context = this.context;
        var schemasByName = _.indexBy(context.schema.fields, 'name');
        return <table>
            <thead>
                <tr>
                    {childColumns.map(column => {
                        var propsToPass = _.clone(column.props); // todo _.omit or _.pick
                        propsToPass.schema = schemasByName[column.props.name];
                        propsToPass.onClick = this.props.sortable ?
                            this.onClickColumnHeader.bind(this, column.props.name) : null;
                        propsToPass.isSortedBy = (column.props.name === context.sortKey);
                        propsToPass.sortOrder = context.sortOrder;
                        //return this.renderColumnHeader(schemasByName[childColumn.props.name]);
                        return <TableHeaderCell {...propsToPass} />
                    })}
                </tr>
            </thead>
            <tbody>
                {context.data.map(_.partial(this.renderRowFromColumns, childColumns, schemasByName))}
            </tbody>
        </table>
    },
    renderRowFromColumns(columns, schemasByName, row) {
        return <tr>
            {columns.map(column => {
                var schema = schemasByName[column.props.name];
                return <SimpleDataTableCell
                    schema={schema}
                    row={row}
                    />
            })}
        </tr>
    },


    renderColumnHeader(field) {
        //var context = this._reactInternalInstance._context; // hack, replace with this.context @ React 0.14
        var context = this.context;
        const onClick = this.onClickColumnHeader.bind(this, field.name);
        const isSortedOnColumn = (field.name === context.sortKey);
        const isSortAscending = (context.sortOrder || '').toLowerCase().indexOf('asc') === 0;
        const sortArrow = isSortedOnColumn ? (isSortAscending ? ' ▲' : ' ▼') : '';

        return <td onClick={onClick}>
            {field.title} {sortArrow}
        </td>
    },
    renderRow(row) {
        //var context = this._reactInternalInstance._context; // hack, replace with this.context @ React 0.14
        var context = this.context;
        return <tr>
            {context.schema.fields.map(field => {
                return <td>
                    {row[field.name]}
                </td>
            })}
        </tr>
    }
});


module.exports = SimpleDataTable;