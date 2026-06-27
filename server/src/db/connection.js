'use strict';

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/verdikt';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected → ${MONGO_URI}`);
  } catch (err) {
    // Non-fatal: game runs without persistence if Mongo is unavailable
    console.warn(`MongoDB connection failed (${err.message}) — running without persistence`);
  }
}

module.exports = { connectDB, mongoose };
