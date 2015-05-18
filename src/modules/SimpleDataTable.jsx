var _ = require('lodash');
var React = require('react/addons');
var PropTypes = React.PropTypes;
var InterfaceMixin = require('./../InterfaceMixin');
var SimpleDataTableColumn = require('./SimpleDataTableColumn.jsx');

var SimpleDataTableCell = React.createClass({
    propTypes: {
        name: PropTypes.string,
        schema: PropTypes.object, // schema for this field
        row: PropTypes.object // the current data row which contains this cell
    },
    render() {
        return <td>
            {this.props.row[this.props.name]}
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
        // data displayed on the table, from Datascope
        data: React.PropTypes.array,
        // data schema, from Datascope
        schema: React.PropTypes.object,
        query: React.PropTypes.object,
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


    onClickColumnHeader(dataKey) {
        var isSortedOnColumn = (dataKey === this.props.sortKey);
        var isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0;

        // if not already sorted by this, sort descending by this
        // if already sorted descending by this, sort ascending
        // if already sorted ascending by this, remove sort
        var sortKey = (!isSortedOnColumn || !isSortAscending) ? dataKey : undefined;
        var sortOrder = !isSortedOnColumn ? 'descending' : (!isSortAscending ? 'ascending' : undefined);
        //this.props.onChangeSort(sortKey, sortOrder);
        this.props.onChangeSort(sortKey, sortOrder);
    },

    render() {
        var children = this.props.children;
        children = _.isUndefined(children) ? [] : (_.isArray(children) ? children : [children]);
        var hasColumns = false;
        var columns = React.Children.map(this.props.children, child => {
            var isColumn = _.isFunction(child.type.implementsInterface) &&
                child.type.implementsInterface('DataTableColumn');
            if(isColumn) hasColumns = true;
            return isColumn ? child : null;
        });

        //var columns = children.filter(child => {
        //    return _.isFunction(child.type.implementsInterface) && child.type.implementsInterface('DataTableColumn')
        //});

        if(!hasColumns) columns = _.map(this.props.schema.items.properties,
            (p, key) => <SimpleDataTableColumn name={key} />
        );

        var renderRow = _.partial(this.renderRow, columns);
        return <table>
            <thead>
            <tr>
                {React.Children.map(columns, column => {
                    //var propsToPass = _.clone(column.props); // todo _.omit or _.pick
                    //propsToPass.schema = this.props.schema.items.properties[column.props.name];
                    //propsToPass.onClick = this.props.sortable ?
                    //    this.onClickColumnHeader.bind(this, column.props.name) : null;
                    //propsToPass.isSortedBy = (column.props.name === this.props.sortKey);
                    //propsToPass.sortOrder = this.props.sortOrder;
                    //return <TableHeaderCell {...propsToPass} />
                    return this.renderColumnHeader(column);
                })}
            </tr>
            </thead>
            <tbody>
            {this.props.data.map(renderRow)}
            </tbody>
        </table>
    },

    renderColumnHeader(column) {
        console.log('sortKey', this.props.sortKey);
        var propsToPass = _.assign({}, _.clone(column.props), {// todo _.omit or _.pick
            schema: this.props.schema.items.properties[column.props.name],
            onClick: this.props.sortable ? this.onClickColumnHeader.bind(this, column.props.name) : null,
            isSortedBy: (column.props.name === this.props.sortKey),
            sortOrder: this.props.sortOrder
        });
        return <TableHeaderCell {...propsToPass} />
    },
    renderRow(columns, row) {
        return <tr>
            {React.Children.map(columns, column => {
                var schema = this.props.schema.items.properties[column.props.name];
                return <SimpleDataTableCell
                    name={column.props.name}
                    schema={schema}
                    row={row}
                    />
            })}
        </tr>
    },


    //renderColumnHeader(field, key) {
    //    //var context = this._reactInternalInstance._context; // hack, replace with this.context @ React 0.14
    //    var context = this.context;
    //    const onClick = this.onClickColumnHeader.bind(this, key);
    //    const isSortedOnColumn = (key === context.sortKey);
    //    const isSortAscending = (context.sortOrder || '').toLowerCase().indexOf('asc') === 0;
    //    const sortArrow = isSortedOnColumn ? (isSortAscending ? ' ▲' : ' ▼') : '';
    //
    //    return <td onClick={onClick}>
    //        {field.title} {sortArrow}
    //    </td>
    //},
    //renderRow(row) {
    //    return <tr>
    //        {_.map(this.props.schema.items.properties, (field, key) => {
    //            return <td>
    //                {row[key]}
    //            </td>
    //        })}
    //    </tr>
    //}
});


module.exports = SimpleDataTable;