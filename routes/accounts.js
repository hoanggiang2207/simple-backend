const express = require('express');
const router = express.Router(); // Create a new Router object

module.exports = function (db) {
  const collection = db.collection('accounts'); // Specify the collection name

  // Define the GET /api/accounts route (Retrieve all accounts)
  router.get('/', async (req, res) => {
    try {
      const accounts = await collection.find().toArray(); // Retrieve all accounts
      res.status(200).json(accounts); // Send the accounts as a JSON response
    } catch (err) {
      console.error('Failed to retrieve accounts', err);
      res.status(500).send({ message: 'Failed to retrieve accounts' });
    }
  });

  // Define the POST /api/accounts route (Add new account)
  router.post('/', async (req, res) => {
    const { username, password } = req.body; // Destructure username and password from request body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
      // Check if the account already exists
      const existingAccount = await collection.findOne({ username });
      if (existingAccount) {
        return res.status(409).json({ message: 'Account with this username already exists.' });
      }

      // Insert the new account
      const result = await collection.insertOne({ username, password });
      res.status(201).json({ message: 'Account created successfully', accountId: result.insertedId });
    } catch (err) {
      console.error('Failed to create account', err);
      res.status(500).send({ message: 'Failed to create account' });
    }
  });

  return router;
};
