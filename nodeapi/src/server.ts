import app from './app.js';
import 'dotenv/config.js';

// Set UTC as default timezone
process.env.TZ = 'Etc/UTC';

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MyFin server listening on port ${PORT}`);
});
