'use strict';

const express = require('express');
const logger = require('morgan');
const path = require('path');

const routes = require('./routes');
const app = express();

app.enable('trust proxy');
app.set('views', path.join(__dirname , 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname , 'public')));

app.use('/', routes);

module.exports = app;
