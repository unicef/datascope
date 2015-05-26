var _ = require('lodash'),
    React = require('react/addons'),
    InterfaceMixin = require('./../InterfaceMixin');

var Paginator = React.createClass({
    mixins: [InterfaceMixin('Datascope', 'DatascopePagination')],

    onClickPrevious() {
        const oldPagination = this.props.pagination;
        if(oldPagination.page == 1) return;
        let pagination = _.extend({}, this.props.pagination, {
            offset: oldPagination.offset - oldPagination.limit,
            page: oldPagination.page - 1
        });
        this.props.onChangePagination(pagination);
    },
    onClickNext() {
        const oldPagination = this.props.pagination;
        let pagination = _.extend({}, this.props.pagination, {
            offset: oldPagination.offset + oldPagination.limit,
            page: oldPagination.page + 1
        });
        this.props.onChangePagination(pagination);
    },

    render() {
        if(!this.props.pagination)
            return <div>No pagination</div>;

        const pagination = this.props.pagination;
        return <div className="datascope-paginator">
            <div>page {pagination.page}</div>
            <div>results {pagination.offset + 1} to {pagination.offset + pagination.limit}</div>
            <div onClick={this.onClickPrevious}>{'< '}Previous Page</div>
            <div onClick={this.onClickNext}>Next Page {' >'}</div>
        </div>
    }
});

module.exports = Paginator;