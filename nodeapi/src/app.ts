import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes/router.js';
import apiErrorHandler from './errorHandling/apiErrorHandler.js';

const app = express();

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({ info: 'MyFin API' });
});

router(app);
app.use(apiErrorHandler);

export default app;
