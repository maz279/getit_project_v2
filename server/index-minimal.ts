import express from 'express';
import cors from 'cors';
import { Server } from 'http';
import aiSearchRoutes from './routes/ai-search-minimal';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Search Server is running',
    timestamp: new Date().toISOString()
  });
});

// AI Search routes
app.use('/api/ai-search', aiSearchRoutes);

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'GetIt AI Search API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      aiSearch: '/api/ai-search/*'
    }
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 AI Search Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`AI Search: http://localhost:${port}/api/ai-search`);
});

export default server;