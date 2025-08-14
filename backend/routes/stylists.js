const express = require('express');
const Stylist = require('../models/Stylist');
const router = express.Router();
router.get('/', async (req, res) => {
  const stylists = await Stylist.find().sort({ name: 1 });
  res.json(stylists);
});
router.post('/', async (req, res) => {
  const st = await Stylist.create(req.body);
  res.json(st);
});
module.exports = router;
