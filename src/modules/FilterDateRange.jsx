import _ from 'lodash';
import React from 'react/addons';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
const { PropTypes } = React;

export default React.createClass({
    displayName: 'FilterDateRange',
    propTypes: {
        name: PropTypes.string,
        schema: PropTypes.object,
        filter: PropTypes.object,
        onChange: PropTypes.func,
        // include the minimum (after) part of the time range
        hasMin: PropTypes.bool,
        // include the maximum (before) part of the time range
        hasMax: PropTypes.bool,
        showTitle: PropTypes.bool,
        preMinContent: PropTypes.node,
        postMinContent: PropTypes.node,
        preMaxContent: PropTypes.node,
        postMaxContent: PropTypes.node,
        calendar: PropTypes.bool, // whether to show the date picker button
        time: PropTypes.bool // whether to show the time picker button
    },
    getDefaultProps() {
        return {
            showTitle: true,
            hasMin: true,
            hasMax: true
        }
    },

    componentWillMount() { this._validateProps() },
    componentWillReceiveProps() { this._validateProps() },
    _validateProps() {
        const {schema} = this.props;
        if(!_.isObject(schema)) throw "FilterDateRange requires a schema (wrap this component in FilterPanel)";
        if(schema.type !== 'string' || schema.format !== 'date-time')
            throw "FilterDateRange data schema must be type: 'string' and format: 'date-time'";

    },

    _getTitle() {
        // todo if neither exist, use schema key (pass from parent as another prop?)
        return _.isString(this.props.title) ? this.props.title :
            _.isObject(this.props.schema) && _.has(this.props.schema, 'title') ?
                this.props.schema.title : this.props.name;
    },

    onChangeDate(date, dateString) {
        const newFilter = {gt: date};
        this.props.onChange(newFilter);
    },
    onClickCheckbox(value, e) {
        const selectedValues = this._getSelectedValues().slice(); // copy so we don't modify props
        const valueIndex = _.indexOf(selectedValues, value);
        valueIndex > -1 ? selectedValues.splice(valueIndex, 1) : selectedValues.push(value);
        const newFilter = selectedValues.length ? {intersects: selectedValues} : null;
        this.props.onChange(this._getName(), newFilter);
    },

    onChangeMinDate(minDate) {
        let newFilter = this.props.filter ? _.clone(this.props.filter) : {};
        if(!minDate) delete newFilter.gt;
        else _.assign(newFilter, {gt: minDate});
        this.props.onChange(newFilter);
    },
    onChangeMaxDate(maxDate) {
        let newFilter = this.props.filter ? _.clone(this.props.filter) : {};
        if(!maxDate) delete newFilter.lt;
        else _.assign(newFilter, {lt: maxDate});
        this.props.onChange(newFilter);
    },

    render() {
        let {
            hasMin, hasMax, showTitle, calendar, time,
            preMinContent, postMinContent, preMaxContent, postMaxContent
        } = this.props;
        const hasContent = !_.every(preMinContent, postMinContent, preMaxContent, postMaxContent, _.isUndefined);

        if(!hasContent && hasMin && hasMax) {
            preMinContent = <span className="ds-date-range-pre-min">Between</span>;
            preMaxContent = <span className="ds-date-range-pre-max">and</span>;
        } else if(!hasContent) {
            preMinContent = <span className="ds-date-range-pre-min">Before</span>;
            preMaxContent = <span className="ds-date-range-pre-min">After</span>;
        }

        const pickerProps = {calendar, time};

        const titleContent = showTitle ?
            <div className="ds-date-range-title">
                {this._getTitle()}
            </div> : null;

        const minContent = hasMin ?
            <div className="ds-date-range-min">
                {preMinContent}
                <DateTimePicker onChange={this.onChangeMinDate} {...pickerProps} />
                {postMinContent}
            </div> : null;

        const maxContent = hasMax ?
            <div className="ds-date-range-max">
                {preMaxContent}
                <DateTimePicker onChange={this.onChangeMaxDate} {...pickerProps} />
                {postMaxContent}
            </div> : null;

        return <div className="ds-date-range-filter">
            {titleContent}
            {minContent}
            {maxContent}
        </div>
    }
});

//export default FilterDateRange;
