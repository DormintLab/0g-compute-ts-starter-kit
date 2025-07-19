import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import dotenv from 'dotenv';
import { initializeApplication } from './startup';

// Import routes
import accountRoutes from './routes/accountRoutes';
import serviceRoutes from './routes/serviceRoutes';
import {runComputeFlow} from "./demo-compute-flow";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 4000;

// Apply basic middleware
app.use(cors());
app.use(express.json());

// API documentation route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: '0G Compute Network API Documentation',
}));

// API routes
const apiPrefix = '/api';

// Register routes
app.use(`${apiPrefix}/account`, accountRoutes);
app.use(`${apiPrefix}/services`, serviceRoutes);


app.post('/api/easy_query', async (req, res) => {
  const { text } = req.body;

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Missing or invalid \"text\"' });
  }

  try {

    const result = await runComputeFlow(text);
    res.json({ success: true, answer: result });
  } catch (err: any) {
    console.error('OpenAI error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to generate completion' });
  }
});

// Root route with basic info
app.get('/', (req, res) => {
  res.json({
    name: '0G Compute Network API',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      account: `${apiPrefix}/account`,
      services: `${apiPrefix}/services`,
    }
  });
});

// Simple error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Server error',
    message: err.message
  });
});

// Initialize application and start server
const startServer = async () => {
  try {
    // Run initialization tasks
    await initializeApplication();
    
    // Start the server
    app.listen(PORT, HOST, () => {
    console.log(`
🚀 0G Compute Network API Server running on http://${HOST}:${PORT}
📚 API Documentation: http://${HOST}:${PORT}/docs
    `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

export default app; 