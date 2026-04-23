import dotenv from 'dotenv';

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  atRiskNoUpdateDays: Number(process.env.AT_RISK_NO_UPDATE_DAYS ?? 10),
  atRiskStuckStageDays: Number(process.env.AT_RISK_STUCK_STAGE_DAYS ?? 14),
  seedDemo: (process.env.SEED_DEMO ?? 'true').toLowerCase() === 'true'
};
