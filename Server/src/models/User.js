import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    language: { type: String, default: 'English' },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);


