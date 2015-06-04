var _ = require('lodash');
var React = require('react/addons');
var moment = require('moment');
var numeral = require('numeral');
var PropTypes = React.PropTypes;
var InterfaceMixin = require('./../InterfaceMixin');
var SimpleDataTableColumn = require('./SimpleDataTableColumn');

var SimpleDataTableCell = React.createClass({
    propTypes: {
        name: PropTypes.string,
        schema: PropTypes.object, // schema for this field
        field: PropTypes.object, // schema for this field
        row: PropTypes.object // the current data row which contains this cell
    },
    render() {
        var field = this.props.field;
        return <td>
            {field.renderer(this.props.row[field.key], field, {moment, numeral})}
        </td>
    }
});

var TableHeaderCell = React.createClass({
    propTypes: {
        schema: PropTypes.shape({
            name: PropTypes.string,
            title: PropTypes.string
        }), // schema for this field
        field: PropTypes.object,
        title: PropTypes.string, // to override schema title
        onClick: PropTypes.func, // usually the sort function
        isSortedBy: PropTypes.bool, // true if the table is sorted by this column
        sortIndicatorAscending: PropTypes.string,
        sortIndicatorDescending: PropTypes.string
    },
    getDefaultProps() {
        return {
            onClick: null,
            sortIndicatorAscending: ' ▲',
            sortIndicatorDescending: ' ▼'
        }
    },
    _getTitle() {
        return _.isUndefined(this.props.title) ? this.props.field.title : this.props.title;
    },
    render() {
        const isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0;
        const sortIndicator = this.props.isSortedBy ?
            (isSortAscending ? this.props.sortIndicatorAscending : this.props.sortIndicatorDescending)
            : '';

        return <th onClick={this.props.onClick}>
            {this._getTitle()}
            {sortIndicator}
        </th>
    }
});

var SimpleDataTable = React.createClass({
    mixins: [InterfaceMixin('Datascope', 'DatascopeSort')],
    propTypes: {
        // data displayed on the table, from Datascope
        data: React.PropTypes.array,
        // data schema, from Datascope
        schema: React.PropTypes.object,
        // fields (display rules)
        fields: React.PropTypes.object,
        orderedFields: React.PropTypes.array,
        // query (search, sort, filter)
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

        if(!hasColumns) columns = _.map(this.props.orderedFields,
            (field) => <SimpleDataTableColumn name={field.key} />
        );

        var renderRow = _.partial(this.renderRow, columns);
        return <table>
            <thead>
                <tr>
                    {React.Children.map(columns, this.renderColumnHeader)}
                </tr>
            </thead>
            <tbody>
                {this.props.data.map(renderRow)}
            </tbody>
        </table>
    },

    renderColumnHeader(column) {
        //console.log('sortKey', this.props.sortKey);
        var propsToPass = _.assign({}, _.clone(column.props), {// todo _.omit or _.pick
            field: this.props.fields[column.props.name],
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
                return <SimpleDataTableCell
                    name={column.props.name}
                    schema={this.props.schema.items.properties[column.props.name]}
                    field={this.props.fields[column.props.name]}
                    row={row}
                    />
            })}
        </tr>
    }
});


module.exports = SimpleDataTable;