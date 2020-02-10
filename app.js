const dotenv = require('dotenv');
const campaigns = require('./src/campaigns');

// Initialize dotenv
dotenv.config();

campaigns()
  .then(() => console.log('Data finalized'));
