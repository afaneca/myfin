import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv/config.js';
import apiErrorHandler from './app/errorHandling/apiErrorHandler.js';
import router from './app/routes/router.js';

// Set UTC as default timezone
process.env.TZ = 'Etc/UTC';

// Set DATABASE_URL env variable for prisma
process.env.DATABASE_URL = `mysql://${process.env.DB_USER}:${process.env.DB_PW}@localhost:${process.env.DB_PORT}/${process.env.DB_TABLE}?schema=public`;

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
  })
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
