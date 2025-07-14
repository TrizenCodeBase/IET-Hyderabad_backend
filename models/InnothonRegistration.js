import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: String,
  department: String,
  year: String,
  linkedin: String,
  isIETMember: Boolean,
  ietMembershipId: String
}, { _id: false });

const innothonRegistrationSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  institutionName: { type: String, required: true },
  cityState: { type: String, required: true },
  problemStatement: { type: String }, // optional if customProblemStatement is provided
  customProblemStatement: { type: String }, // optional if problemStatement is provided
  leaderName: { type: String, required: true },
  leaderEmail: { type: String, required: true },
  leaderPhone: { type: String, required: true },
  leaderAltEmail: { type: String },
  leaderIsIETMember: { type: Boolean },
  leaderIetMembershipId: { type: String },
  member2: { type: teamMemberSchema, required: true },
  member3: { type: teamMemberSchema },
  member4: { type: teamMemberSchema },
  motivationStatement: { type: String, required: true },
  termsAccepted: { type: Boolean, required: true },
  consentAccepted: { type: Boolean },
  feeType: { type: String, required: true },
  transactionId: { type: String, required: true },
  transactionScreenshot: { type: String },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'submitted' },
  registrationId: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  registrationType: { type: String, default: 'innothon' }
});

// Custom validation: at least one problem statement field must be present
innothonRegistrationSchema.pre('validate', function(next) {
  if (!this.problemStatement && !this.customProblemStatement) {
    this.invalidate('problemStatement', 'Either problemStatement or customProblemStatement is required.');
  }
  next();
});

export default mongoose.model('InnothonRegistration', innothonRegistrationSchema); 