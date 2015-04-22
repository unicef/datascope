var _ = require('lodash'),
    React = require('react/addons'),
    Testing = require('./test.jsx');

var Datascope = require('./components/Datascope.jsx');
var LocalDatascope = require('./components/LocalDatascope.jsx');
var SearchBar = require('./components/SearchBar.jsx');
var FilterPanel = require('./components/FilterPanel.jsx');
var FilterInputRadio = require('./components/filter/FilterInputRadio.jsx');
var DataTable = require('./components/DataTable.jsx');


var mockData = require('./mock-data');


var App = React.createClass({
    render() {
        var schemaIsActive = _.find(mockData.schema.fields, (field) => field.name === 'isActive');
        return (
            <div>
                <LocalDatascope
                    data={mockData.data}
                    schema={mockData.schema}
                    >
                    <Datascope>
                        <SearchBar />
                        <FilterPanel fields={['name', 'isActive', 'age']}>
                            <FilterInputRadio field={'isActive'} />
                        </FilterPanel>
                        <DataTable />
                    </Datascope>
                </LocalDatascope>
            </div>
        );
    }
});

window.React = React;

module.exports = App;
