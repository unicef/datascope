import _ from 'lodash';
import React from 'react/addons';
import InterfaceMixin from '../InterfaceMixin';

// Datascope module which clears existing filters, searches and sorts, and resets to first page
// (each type can be selectively disabled with clearWhatever = false)
// renders children wrapped in a clickable div

const ClearQueryLink = React.createClass({
    mixins: [InterfaceMixin('Datascope')],
    propTypes: {
        clearFilters: React.PropTypes.bool,
        clearSearch: React.PropTypes.bool,
        clearSort: React.PropTypes.bool,
        clearPagination: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            clearFilters: true,
            clearSearch: true,
            clearSort: true,
            clearPagination: true
        }
    },

    onClick() {
        const {clearFilters, clearSearch, clearSort, clearPagination} = this.props;
        let query = this.props.query;

        if(clearFilters) query = React.addons.update(query, {filter: {$set: undefined}});
        if(clearSearch) query = React.addons.update(query, {search: {$set: undefined}});
        if(clearSort) query = React.addons.update(query, {sort: {$set: undefined}});
        if(clearPagination && query.pagination)
            query = React.addons.update(query, {pagination: {$merge: {page: 1, offset: 0}}});

        this.props.onChangeQuery(query);
        return false;
    },

    render() {
        const content = this.props.children || "Clear filters";

        return <div className="ds-clear-query-link" onClick={this.onClick}>
            {content}
        </div>
    }
});

export default ClearQueryLink;