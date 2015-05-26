'use strict';

var _ = require('lodash'),
    React = require('react/addons'),
    InterfaceMixin = require('./../InterfaceMixin');

var Paginator = React.createClass({
    displayName: 'Paginator',

    mixins: [InterfaceMixin('Datascope', 'DatascopePagination')],

    onClickPrevious: function onClickPrevious() {
        var oldPagination = this.props.pagination;
        if (oldPagination.page == 1) return;
        var pagination = _.extend({}, this.props.pagination, {
            offset: oldPagination.offset - oldPagination.limit,
            page: oldPagination.page - 1
        });
        this.props.onChangePagination(pagination);
    },
    onClickNext: function onClickNext() {
        var oldPagination = this.props.pagination;
        var pagination = _.extend({}, this.props.pagination, {
            offset: oldPagination.offset + oldPagination.limit,
            page: oldPagination.page + 1
        });
        this.props.onChangePagination(pagination);
    },

    render: function render() {
        if (!this.props.pagination) return React.createElement(
            'div',
            null,
            'No pagination'
        );

        var pagination = this.props.pagination;
        return React.createElement(
            'div',
            { className: 'datascope-paginator' },
            React.createElement(
                'div',
                null,
                'page ',
                pagination.page
            ),
            React.createElement(
                'div',
                null,
                'results ',
                pagination.offset + 1,
                ' to ',
                pagination.offset + pagination.limit
            ),
            React.createElement(
                'div',
                { onClick: this.onClickPrevious },
                '< ',
                'Previous Page'
            ),
            React.createElement(
                'div',
                { onClick: this.onClickNext },
                'Next Page ',
                ' >'
            )
        );
    }
});

module.exports = Paginator;