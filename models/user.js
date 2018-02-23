let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let UserSchema = new Schema({
  first_name: {
    type: String,
    required: 'Please tell us your first name.',
    generator: 'name.firstName'
  },
  last_name: {
    type: String,
    required: 'Please tell us your last name.',
    generator: 'name.lastName'
  },
  email: {
    type: String,
    index: {
      unique: true
    },
    required: 'Please let us know your email address.',
    validate: {
      validator: e => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(e),
      message: 'Please make sure your email is typed correctly.'
    },
    generator: 'internet.email'
  },
  phone: {
    type: String,
    required: 'Please tell us your cell phone number.',
    validate: {
      validator: pn => /\d{3}-\d{3}-\d{4}/.test(pn),
      message: 'Please enter all ten digits of your phone number.'
    },
    generator: 'phone.phoneNumberFormat'
  },
  photo: {
    type: String,
    generator: 'internet.avatar'
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  activities: [{
    type: Schema.Types.ObjectId,
    ref: 'Activity'
  }]
}, {
  timestamps: true, // adds createdAt and updatedAt fields automatically
  minimize: false   // will make sure all properties exist, even if null
});
UserSchema.index({ last_name: 1, first_name: 1 });
module.exports = mongoose.model('User', UserSchema);