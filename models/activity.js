let mongoose  = require('mongoose');
let Schema    = mongoose.Schema;
let ActivitySchema = new Schema({
  actor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  start: {
    type: Date,
    default: Date.toUTCString
  },
  end: {
    type: Date,
    default: Date.toUTCString
  },
  description: {
    type: String,
    required: 'Please describe your activity.',
    generator: 'lorem.sentence'
  },
  notes: {
    type: String,
    generator: 'lorem.sentence'
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: 'Please add your comment.',
      generator: 'lorem.sentence'
    },
    timestamp: {
      type: Date,
      default: Date.toUTCString
    }
  }]
}, {
  timestamps: true, // adds createdAt and updatedAt fields automatically
  minimize: false   // will make sure all properties exist, even if null
});
ActivitySchema.index({ actor: 1, createdAt: -1 });
module.exports = mongoose.model('Activity', ActivitySchema);