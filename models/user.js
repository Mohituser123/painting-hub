const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email can't be blank"],
    unique: true,
  },
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Painting",
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
});

// 🔐 This will add username, hashed password, .authenticate(), etc.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
