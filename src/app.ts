import express from 'express';
import logger from 'morgan';
import path from 'path';
import routes from './routes';

const app = express();

app.enable('trust proxy');
app.set('views', path.join(__dirname , 'views'));
app.set('view engine', 'twig');

app.use(logger('dev', {
    skip: req => req.url === "/_health"
}));

app.use(express.static(path.join(__dirname , 'public')));

app.use('/', routes);

export default app;
