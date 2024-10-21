require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is required.');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware to parse JSON
app.use(express.json());

// Load Swagger JSON from the swagger.json file
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db('myDatabase'); // Change 'myDatabase' to your desired database

    const accountsRouter = require('./routes/accounts')(db); // Import and use accounts routes
    app.use('/api/accounts', accountsRouter); // Mount the /api/accounts route

    app.listen(port, () => {
      console.log(`API is running on http://localhost:${port}`);
      console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
}

run().catch(console.dir);
