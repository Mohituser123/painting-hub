const mongoose = require("mongoose");
const Painting = require("../models/painting");
const initData = require("./data");

const MONGO_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/paintstore"; // ✅ use same as app.js

main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Painting.deleteMany({});
  await Painting.insertMany(initData.data);
  console.log("✅ Database seeded!");
};

initDB();
