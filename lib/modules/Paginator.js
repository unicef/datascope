'use strict';

var _ = require('lodash'),
    React = require('react/addons'),
    cx = require('classnames'),
    InterfaceMixin = require('./../InterfaceMixin');

var Paginator = React.createClass({
    displayName: 'Paginator',

    mixins: [InterfaceMixin('Datascope', 'DatascopePagination')],

    getDefaultProps: function getDefaultProps() {
        return {
            canHide: true,
            truncateLimit: 5,
            truncatedSize: 3,
            showPreviousNext: true,
            nextLabel: '>',
            previousLabel: '<'
        };
    },

    onClickPage: function onClickPage(page) {
        console.log('clicked page', page);
        var offset = this.props.pagination.limit * (page - 1);
        var pagination = _.extend({}, this.props.pagination, { offset: offset, page: page });
        this.props.onChangePagination(pagination);
    },

    render: function render() {
        var _this = this;

        if (!this.props.pagination) return null;
        var _props = this.props;
        var pagination = _props.pagination;
        var truncateLimit = _props.truncateLimit;
        var truncatedSize = _props.truncatedSize;

        var shouldHide = this.props.canHide && pagination.total < pagination.limit;
        if (shouldHide) return null;

        var minResult = pagination.offset + 1;
        var maxResult = Math.min(pagination.total, pagination.offset + pagination.limit);
        var thisPage = pagination.page;
        var lastPage = Math.ceil(pagination.total / pagination.limit);
        var nextPage = Math.min(thisPage + 1, lastPage);
        var previousPage = Math.max(thisPage - 1, 1);

        var pageNums = _.range(1, lastPage + 1);
        var shouldTruncate = truncateLimit && lastPage > truncateLimit;
        if (shouldTruncate) {
            pageNums = _([_.range(1, truncatedSize + 1), // first few
            _.range(lastPage - truncatedSize + 1, lastPage + 1), // last few
            [previousPage, thisPage, nextPage] // this page and its neighbors
            ]).flatten().uniq().value().sort(function (a, b) {
                return a - b;
            }); // mash em all together, dedupe and sort

            pageNums = _.reduce(pageNums, function (result, page) {
                // insert '...' between breaks
                if (page > _.last(result) + 1) result.push('...');
                result.push(page);
                return result;
            }, []);
        }

        console.log('rendering page', thisPage);
        return React.createElement(
            'div',
            { className: 'datascope-paginator' },
            this.props.previousLabel ? React.createElement(
                'span',
                {
                    className: 'page-link page-link-previous',
                    onClick: _.partial(this.onClickPage, previousPage)
                },
                this.props.previousLabel
            ) : '',
            pageNums.map(function (page) {
                return _.isString(page) ? React.createElement(
                    'span',
                    { className: 'pagination-truncate' },
                    page
                ) : React.createElement(
                    'span',
                    {
                        className: cx('page-link', { active: page === thisPage }),
                        key: 'page' + page,
                        onClick: _this.onClickPage.bind(null, page)
                    },
                    page
                );
            }),
            this.props.nextLabel ? React.createElement(
                'span',
                {
                    className: 'page-link page-link-next',
                    onClick: _.partial(this.onClickPage, nextPage)
                },
                this.props.nextLabel
            ) : '',
            React.createElement(
                'div',
                { className: 'pagination-count' },
                minResult,
                ' to ',
                maxResult,
                ' of ',
                pagination.total
            )
        );
    },
    renderPageLinks: function renderPageLinks() {},
    renderPageLinksTruncated: function renderPageLinksTruncated() {}
});

function offsetFromPage() {}

module.exports = Paginator;