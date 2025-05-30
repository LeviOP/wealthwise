import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { authTypeDefs } from './schema/auth';
import { authResolvers } from './resolvers/auth';
import { transactionTypeDefs } from './schema/transaction';
import { transactionResolvers } from './resolvers/transaction';
import { categoryTypeDefs } from './schema/category';
import { categoryResolvers } from './resolvers/category';
import { budgetTypeDefs } from './schema/budget';
import { budgetResolvers } from './resolvers/budget';
import { authMiddleware } from './middleware/auth';
import { connectDB } from './config/database';

dotenv.config();

// Define types for our GraphQL schema
interface ServerContext {
  req: express.Request;
  user?: any;
}

const baseTypeDefs = `#graphql
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

async function startServer(): Promise<void> {
  const app: Application = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());

  // Create Apollo Server
  const server = new ApolloServer<ServerContext>({
    typeDefs: [
      baseTypeDefs,
      authTypeDefs,
      transactionTypeDefs,
      categoryTypeDefs,
      budgetTypeDefs
    ],
    resolvers: [
      authResolvers,
      transactionResolvers,
      categoryResolvers,
      budgetResolvers
    ],
    context: authMiddleware,
    introspection: true
  });

  await server.start();
  server.applyMiddleware({ app });

  // Serve static files from the client build directory
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));

  // Handle client-side routing by serving index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/graphql')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
  });

  // Connect to MongoDB
  try {
    await connectDB();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((error: Error) => {
  console.error('Error starting server:', error);
  process.exit(1);
}); 