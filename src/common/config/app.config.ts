export const EnvConfiguration = () => ({
  stage: process.env.STAGE,
  port: process.env.PORT,
  databaseHost: process.env.DB_HOST || 'localhost',
  databasePort: parseInt(process.env.DB_PORT || '5432', 10),
  databaseUsername: process.env.DB_USERNAME || 'root',
  databasePassword: process.env.DB_PASSWORD || 'rootroot ',
  databaseName: process.env.DB_NAME || 'POLICY_SYNC',
  jwtSecret: process.env.JWT_SECRET,
});
