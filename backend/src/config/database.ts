import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3307'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'event_ticket',
  synchronize: false, 
  logging: true,
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
