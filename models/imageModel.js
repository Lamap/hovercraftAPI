let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ImageSchema = new Schema({
    name: String,
    googleId: String,
    shared: Boolean,
    originalSize: {
        width: Number,
        height: Number
    },
    tags: [String]
});
module.exports = mongoose.model('images', ImageSchema);