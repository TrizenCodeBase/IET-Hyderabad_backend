import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  instituteName: {
    type: String,
    required: true
  },
  isIETMember: {
    type: String,
    required: true,
    enum: ['yes', 'no']
  },
  mobileNumber: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true
  },
  zoneVenue: {
    type: String,
    required: true
  },
  youtubeLink: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Registration', registrationSchema); 