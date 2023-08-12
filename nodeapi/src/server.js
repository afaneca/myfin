import app from './app.js';
import 'dotenv/config.js';

// Set UTC as default timezone
process.env.TZ = 'Etc/UTC';

// Set DATABASE_URL env variable for prisma
process.env.DATABASE_URL = `mysql://${process.env.DB_USER}:${process.env.DB_PW}@localhost:${process.env.DB_PORT}/${process.env.DB_TABLE}?schema=public`;

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MyFin server listening on port ${PORT}`);
});
