const express = require("express");
const router = express.Router();

const {
  getCountryMarketData,
} = require("../controllers/publicCountryController");

router.get("/country-market", getCountryMarketData);

module.exports = router;