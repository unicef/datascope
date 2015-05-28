require('babel/polyfill');
require('./../styles/main.css');
require('./../styles/fixed-data-table.css');

var _ = require('lodash'),
    React = require('react/addons');

var {
    Datascope, LocalDatascope,
    InterfaceMixin,
    DataList,
    SimpleDataTable, SimpleDataTableColumn,
    SearchBar,
    FilterPanel, FilterInputRadio, FilterInputCheckbox,
    Paginator
} = require('../../src');

var mockData = require('./mock-data3');

window.moment = require('moment');

var TestElement = React.createClass({
    mixins: [InterfaceMixin('Datascope', 'DatascopeSearch', 'DatascopeSort', 'DatascopeFilter')],
    componentDidMount() {
        console.log('mounted TestComponent', this.props)
    },
    render() {
        return <div>
            {this.props.data.map(d => {
                return _.map(this.props.schema.items.properties, (propSchema, key) => {
                    return <div><strong>{propSchema.title}: </strong>{d[key]}</div>
                }).concat(<hr/>);
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
                    fields={mockData.fields}
                    paginated={true}
                    pageSize={3}
                    >
                    <Datascope>
                        <Paginator />

                        <SearchBar
                            id="search-all"
                            fields={searchableFieldNames}
                            placeholder="all fields"
                            />

                        <DataList />

                        <SimpleDataTable>
                            <SimpleDataTableColumn name="first_name" />
                            <SimpleDataTableColumn name="last_name" />
                            <SimpleDataTableColumn name="username" />
                        </SimpleDataTable>

                        <SimpleDataTable></SimpleDataTable>
                    </Datascope>
                </LocalDatascope>
            </div>
        );

    }
});

React.render(<App />, document.getElementById('container'));

module.exports = App;
