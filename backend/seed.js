const dotenv = require('dotenv'); dotenv.config();
const { connect } = require('./config/db');
const Service = require('./models/Service');
const Stylist = require('./models/Stylist');
const Schedule = require('./models/Schedule');

async function run(){
  await connect(process.env.MONGODB_URI);

  await Promise.all([Service.deleteMany({}), Stylist.deleteMany({}), Schedule.deleteMany({})]);

  const services = await Service.insertMany([
    { name:'Classic Haircut', description:'Tailored cut, shampoo & style', durationMinutes:45, price:800 },
    { name:'Beard Trim', description:'Precision trim and shape', durationMinutes:20, price:350 },
    { name:'Hair Color - Global', description:'Single-process color', durationMinutes:120, price:2500 },
    { name:'Highlights', description:'Foil highlights, toner & style', durationMinutes:150, price:3200 },
    { name:'Blow Dry & Style', description:'Wash, blow dry, and style', durationMinutes:40, price:600 },
    { name:'Signature Facial', description:'Deep cleanse, exfoliation, mask', durationMinutes:60, price:1500 },
    { name:'Party Makeup', description:'Event-ready look', durationMinutes:90, price:3000 }
  ]);

  const stylists = await Stylist.insertMany([
    { name:'Aarav', specialties:['Cuts','Fades','Beard'] },
    { name:'Meera', specialties:['Color','Balayage','Highlights'] },
    { name:'Riya', specialties:['Skincare','Makeup'] },
    { name:'Kabir', specialties:['Classic cuts','Styling'] }
  ]);

  const schedules = [];
  for (const st of stylists) {
    for (let dow=0; dow<=6; dow++) {
      schedules.push({ stylistId: st._id, dayOfWeek: dow, openTime:'10:00', closeTime:'20:00' });
    }
  }
  await Schedule.insertMany(schedules);
  console.log('Seed complete.');
  process.exit(0);
}

run().catch(e=>{ 
  console.error('Error running seed script:', e.message);
  console.log('\nTo fix this error:');
  console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
  console.log('2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
  console.log('3. Update the MONGODB_URI in .env file with your connection string');
  process.exit(1); 
});
