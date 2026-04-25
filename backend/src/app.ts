import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { env } from './config/env';

export const app = express();

app.use(helmet());
const allowedOrigins = env.corsOrigin
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

app.use(cors({
	origin: allowedOrigins.includes('*') ? true : allowedOrigins
}));
app.use(express.json());

app.use(routes);
app.use(notFound);
app.use(errorHandler);
