var _ = require('lodash');
var React = require('react/addons');
var FixedDataTable = require('fixed-data-table');
var InterfaceMixin = require('InterfaceMixin');

var isColumnResizing;

var DataTable = React.createClass({
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
    componentWillMount() {
        this.width = 1000;
        var fields = this.props.schema.fields;
        this.setState({
            columnWidths: _.object(_.map(fields, field => [field.name, this.width / fields.length]))
        })
    },

    onColumnResizeEndCallback(newColumnWidth, dataKey) {
        var columnWidths = React.addons.update(this.state.columnWidths, {[dataKey]: {$set: newColumnWidth}});
        this.setState({columnWidths});
        isColumnResizing = false;
    },
    onClickColumnHeader(dataKey) {
        var isSortedOnColumn = (dataKey === this.props.sortKey),
            isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0;

        // if not already sorted by this, sort descending
        // if already sorted descending by this, sort ascending
        // if already sorted ascending by this, remove sort
        var sortKey = (!isSortedOnColumn || !isSortAscending) ? dataKey : undefined;
        var sortOrder = !isSortedOnColumn ? 'descending' : (!isSortAscending ? 'ascending' : undefined);
        this.props.onChangeSort(sortKey, sortOrder)
    },

    render() {
        return <div>
            <FixedDataTable.Table
                rowHeight={50}
                rowGetter={i => this.props.data[i]}
                rowsCount={this.props.data.length}
                width={1000}
                maxHeight={5000}
                headerHeight={50}
                isColumnResizing={isColumnResizing}
                onColumnResizeEndCallback={this.onColumnResizeEndCallback}
                >

                {_.map(this.props.schema.fields, field => {
                    var isSortedOnColumn = (field.name === this.props.sortKey),
                        isSortAscending = (this.props.sortOrder || '').toLowerCase().indexOf('asc') === 0,
                        sortArrow = isSortedOnColumn ? (isSortAscending ? ' ▲' : ' ▼') : '';

                    return <FixedDataTable.Column
                        label={field.title + sortArrow}
                        dataKey={field.name}
                        width={this.state.columnWidths[field.name] || 100}
                        isResizable={true}
                        headerRenderer={this.renderColumnHeader}
                        sortKey={this.props.sortKey}
                        key={field.name}
                        />
                })}
            </FixedDataTable.Table>
        </div>;
    },
    renderColumnHeader(label, cellDataKey, columnData, rowData, width) {
        return <div onClick={this.onClickColumnHeader.bind(this, cellDataKey)}>
            {label}
        </div>
    }
});

module.exports = DataTable;