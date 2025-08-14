const express = require('express');
const Service = require('../models/Service');
const router = express.Router();
router.get('/', async (req, res) => {
  const services = await Service.find({ active: true }).sort({ name: 1 });
  res.json(services);
});
router.post('/', async (req, res) => {
  const s = await Service.create(req.body);
  res.json(s);
});
module.exports = router;
