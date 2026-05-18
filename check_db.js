const mongoose = require('mongoose');
const MissingPerson = require('./backend/models/MissingPerson');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  console.log('Connecting to:', process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');
  
  const persons = await MissingPerson.find({});
  console.log(`Found ${persons.length} persons in DB:`);
  persons.forEach(p => {
    console.log(`- Name: ${p.firstName} ${p.lastName}`);
    console.log(`  ID: ${p._id}`);
    console.log(`  Status: ${p.status}`);
    console.log(`  Verified: ${p.verified}`);
    console.log(`  Images:`, p.images);
  });
  
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
