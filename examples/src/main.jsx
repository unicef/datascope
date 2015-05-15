require('babel/polyfill');
require('./../styles/main.css');
require('./../styles/fixed-data-table.css');

var _ = require('lodash'),
    React = require('react/addons');

var {
    Datascope, LocalDatascope,
    InterfaceMixin,
    SimpleDataTable, SimpleDataTableColumn,
    SearchBar,
    FilterPanel, FilterInputRadio, FilterInputCheckbox,
} = require('../../src');

var mockData = require('./mock-data3');

var TestElement = React.createClass({
    mixins: [InterfaceMixin('Datascope', 'DatascopeSearch', 'DatascopeSort', 'DatascopeFilter')],
    componentDidMount() {
        console.log('mounted TestComponent', this.props)
    },
    render() {
        return <div>
            {this.props.data.map(d => {
                return <div>{d}</div>
            })}
        </div>

    }
});


var App = React.createClass({
    render() {
        var schemaIsActive = _.find(mockData.schema.items.properties, (prop) => prop.title === 'isActive');
        var searchableFieldNames = _(mockData.schema.items.properties).filter(f => f.searchable).pluck('name').value();

        //<SearchBar
        //    id="search-all"
        //    fields={searchableFieldNames}
        //    placeholder="all fields"
        //    />
        //<SearchBar
        //id="search-first-name"
        //fields={['first_name']}
        //placeholder="first name"
        //    />
        //
        //    <FilterPanel>
        //        <FilterInputRadio field='isActive' />
        //        <FilterInputCheckbox field='groups' />
        //    </FilterPanel>

        //<div>
        //    <SimpleDataTable />
        //</div>

        return (
            <div>
                <LocalDatascope
                    data={mockData.data}
                    schema={mockData.schema}
                    >
                    <Datascope>
                        <div><div><div>
                            <TestElement />
                        </div></div></div>
                    </Datascope>
                </LocalDatascope>
            </div>
        );

    }
});

React.render(<App />, document.getElementById('container'));

module.exports = App;
