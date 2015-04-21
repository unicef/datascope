require('babel/polyfill');
require('../styles/main.css');
require('../styles/fixed-data-table.css');

var _ = require('lodash'),
    React = require('react/addons'),
    Testing = require('./test.jsx');


var mockData = require('./mock-data');

var App = require('./app.jsx');
React.render(<App />, document.getElementById('container'));


module.exports = {};