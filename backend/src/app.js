import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors()); // lets the phone app call this server
app.use(express.json()); // lets us read JSON sent in request bodies

app.use(routes); // all our routes

// These two must stay last
app.use(notFoundHandler);
app.use(errorHandler);

export default app;