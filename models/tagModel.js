let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let TagSchema = new Schema({
    name: String
});
module.exports = mongoose.model('tags', TagSchema);