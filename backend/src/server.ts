import { app } from './app';
import { env } from './config/env';
import { initializeDatabase } from './db/init';

async function start() {
  await initializeDatabase();

  app.listen(env.port, () => {
    console.log(`Backend API running on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
