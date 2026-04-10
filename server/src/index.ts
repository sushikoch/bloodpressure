import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as path from 'path';
import { initializeDatabase, closePool } from './config/database';
import measurementsRouter from './routes/measurements';

const app = express();
const PORT = parseInt(process.env.API_PORT || '3000');

// Trust proxy (for reverse proxies like nginx on Synology)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/measurements', measurementsRouter);

// Serve static files from React build (in production)
// Try multiple paths for compatibility (dev vs production/docker)
const possiblePaths = [
  path.join(__dirname, 'public'), // Docker path
  path.join(__dirname, '../../client/build'), // Dev path
];

let clientBuildPath = '';
for (const tryPath of possiblePaths) {
  try {
    if (require('fs').existsSync(tryPath)) {
      clientBuildPath = tryPath;
      console.log(`✓ Found client build at: ${clientBuildPath}`);
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

if (clientBuildPath) {
  app.use(express.static(clientBuildPath));

  // Fallback to index.html for React Router (SPA)
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: 'Failed to serve frontend',
        });
      }
    });
  });
} else {
  console.warn('⚠ Client build not found. API-only mode.');
  app.get('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found. Use /api/measurements endpoints.',
    });
  });
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closePool();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('✓ Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api/measurements`);
      console.log(`✓ Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
