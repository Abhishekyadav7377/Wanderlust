const mongoose = require('mongoose');
const Listing = require('./models/listing');
const User = require('./models/user');

mongoose.connect('mongodb://127.0.0.1:27017/wanderlust').then(async () => {
    const user = await User.findOne({ username: 'Abhi' }); // jo user logged in hai
    console.log("User found:", user);
    await Listing.updateMany({}, { owner: user._id }); // sabko update karo
    console.log('Done! All listings updated!');
    mongoose.disconnect();
});