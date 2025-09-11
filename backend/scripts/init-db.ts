#!/usr/bin/env ts-node

// Database initialization script
import { initializeDatabase } from '../src/models';
import { Logger } from '../src/utils/logger';

async function initDatabase() {
  try {
    Logger.info('Initializing database...');
    await initializeDatabase();
    Logger.info('✅ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    Logger.error('❌ Database initialization failed', error);
    process.exit(1);
  }
}

// Run initialization
initDatabase();
