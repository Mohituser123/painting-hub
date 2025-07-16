const User = require('./models/user');

console.log("✅ Has .register?", typeof User.register);     // Should be 'function'
console.log("✅ Has .authenticate?", typeof User.authenticate); // Should be 'function'
