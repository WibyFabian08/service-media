const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Haloo ini adalah media service');
});

module.exports = router;
