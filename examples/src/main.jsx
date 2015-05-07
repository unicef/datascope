require('babel/polyfill');
require('./../styles/main.css');
require('./../styles/fixed-data-table.css');

var _ = require('lodash'),
    React = require('react/addons');

var {
    Datascope, LocalDatascope,
    DataTable, SimpleDataTable,
    SearchBar,
    FilterPanel, FilterInputRadio, FilterInputCheckbox,
} = require('../../src');

var mockData = require('./mock-data2');

var App = React.createClass({
    render() {
        var schemaIsActive = _.find(mockData.schema.fields, (field) => field.name === 'isActive');
        var searchableFieldNames = _(mockData.schema.fields).filter(f => f.searchable).pluck('name').value();
        return (
            <div>
                <LocalDatascope
                    data={mockData.data}
                    schema={mockData.schema}
                    >
                    <Datascope>

                        <SearchBar
                            id="search-all"
                            fields={searchableFieldNames}
                            placeholder="all fields"
                            />
                        <SearchBar
                            id="search-first-name"
                            fields={['first_name']}
                            placeholder="first name"
                            />

                        <FilterPanel>
                            <FilterInputRadio field='isActive' />
                            <FilterInputCheckbox field='groups' />
                        </FilterPanel>

                        <SimpleDataTable />

                    </Datascope>
                </LocalDatascope>
            </div>
        );

    }
});

React.render(<App />, document.getElementById('container'));

module.exports = App;
