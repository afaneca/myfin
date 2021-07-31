import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv/config.js';
import apiErrorHandler from './app/errorHandling/apiErrorHandler.js';
import router from './app/routes/router.js';

const app = express();

// TODO - cors settings
/* var corsOptions = {
    origin: "http://localhost:8081"
  };

  app.use(cors(corsOptions)); */
app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get('/', (request, response) => {
  response.json({ info: 'MyFin API' });
});

router(app);
app.use(apiErrorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MyFin server listening on port ${PORT}`);
});
