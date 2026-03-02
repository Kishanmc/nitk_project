import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['doctor', 'patient'], required: true },
    name: { type: String, required: true },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

export default mongoose.model('User', userSchema);
