var _ = require('lodash'),
    React = require('react/addons'),
    cx = require('classnames'),
    InterfaceMixin = require('./../InterfaceMixin');

var Paginator = React.createClass({
    mixins: [InterfaceMixin('Datascope', 'DatascopePagination')],

    getDefaultProps() {
        return {
            canHide: true,
            truncateLimit: 5,
            truncatedSize: 3,
            showPreviousNext: true,
            nextLabel: '>',
            previousLabel: '<'
        }
    },

    onClickPage(page) {
        console.log('clicked page', page);
        const offset = this.props.pagination.limit * (page - 1);
        const pagination = _.extend({}, this.props.pagination, {offset, page});
        this.props.onChangePagination(pagination);
    },

    render() {
        if(!this.props.pagination) return null;
        const {pagination, truncateLimit, truncatedSize} = this.props;

        const shouldHide = this.props.canHide && pagination.total < pagination.limit;
        if(shouldHide) return null;

        const minResult = pagination.offset + 1;
        const maxResult = Math.min(pagination.total, pagination.offset + pagination.limit);
        const thisPage = pagination.page;
        const lastPage = Math.ceil(pagination.total / pagination.limit);
        const nextPage = Math.min(thisPage + 1, lastPage);
        const previousPage = Math.max(thisPage - 1, 1);

        let pageNums = _.range(1, lastPage + 1);
        const shouldTruncate = truncateLimit && lastPage > truncateLimit;
        if(shouldTruncate) {
            pageNums = _([
                _.range(1, truncatedSize+1), // first few
                _.range((lastPage - truncatedSize)+1, lastPage+1), // last few
                [previousPage, thisPage, nextPage] // this page and its neighbors
            ]).flatten().uniq().value().sort((a, b) => a - b); // mash em all together, dedupe and sort

            pageNums = _.reduce(pageNums, (result, page) => {
                // insert '...' between breaks
                if(page > _.last(result) + 1) result.push('...');
                result.push(page);
                return result;
            }, [])
        }

        console.log('rendering page', thisPage);
        return <div className="datascope-paginator">
            {this.props.previousLabel ?
                <span
                    className="page-link page-link-previous"
                    onClick={_.partial(this.onClickPage, previousPage)}
                    >
                {this.props.previousLabel}
                </span> : ''
            }

            {pageNums.map((page) => {
                return _.isString(page) ?
                    <span className="pagination-truncate">{page}</span> :
                    <span
                        className={cx('page-link', {active: (page === thisPage)})}
                        key={'page'+page}
                        onClick={this.onClickPage.bind(null, page)}
                        >
                        {page}
                    </span>;
            })}

            {this.props.nextLabel ?
                <span
                    className="page-link page-link-next"
                    onClick={_.partial(this.onClickPage, nextPage)}
                    >
                {this.props.nextLabel}
                </span> : ''
            }

            <div className="pagination-count">
                {minResult} to {maxResult} of {pagination.total}
            </div>
        </div>
    },
    renderPageLinks() {

    },
    renderPageLinksTruncated() {

    }
});

function offsetFromPage() {}

module.exports = Paginator;