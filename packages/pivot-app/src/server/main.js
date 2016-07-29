import expressApp from './app.js'
import bodyParser from 'body-parser';

import { reloadHot } from '../shared/reloadHot';
import { renderMiddleware } from './middleware';
import { getDataSourceFactory } from '../shared/middleware';
import { dataSourceRoute as falcorMiddleware } from 'falcor-express';

import { app as createApp, row as createRow } from '../shared/models';
import { loadApp, loadRows, insertRow, spliceRow, calcTotals, selectPivot } from '../shared/services';

const cols = [
    { name: 'Search' },
    { name: 'Links' },
    { name: 'Time'},
];

const values = {
    'Search': 'Input Splunk Query',
    'Links': 'Connect to Attributes',
    'Time': '07/28/1016/',
}

const rows = Array.from({ length: 6 }, (x, index) => (
    createRow(cols, values)
));

const app = createApp(cols, rows);


const routeServices = {
    loadApp: loadApp(app),
    insertRow, spliceRow, calcTotals, selectPivot,
    loadRowsById: loadRows(loadApp(app)),
};

const modules = reloadHot(module);
const getDataSource = getDataSourceFactory(routeServices);

expressApp.use('/index.html', renderMiddleware(getDataSource, modules));
expressApp.use('/graph.html', function(req, res) {
    const { query: options = {} } = req;
    res.type('html').send(`
        <!DOCTYPE html>
        <html lang='en-us'>
            <body>
                <h1>total: ${options.total}</h1>
            </body>
        </html>
    `);
});

expressApp.use(bodyParser.urlencoded({ extended: false }));
expressApp.use('/model.json', falcorMiddleware(getDataSource));

expressApp.use('/', renderMiddleware(getDataSource, modules));
