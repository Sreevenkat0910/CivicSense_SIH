import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    url: String,
    caption: String,
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    reportId: { type: String, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    locationText: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined },
    },
    photos: [photoSchema],
    voiceNoteUrl: { type: String },
    department: { type: String, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

reportSchema.index({ location: '2dsphere' });

export default mongoose.model('Report', reportSchema);


