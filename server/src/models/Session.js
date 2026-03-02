import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    filename: String,
    sample_count: Number,
    duration_sec: Number,
    metrics: {
      step_count: Number,
      cadence: Number,
      avg_stride_time: Number,
      symmetry_index: Number
    },
    data: [
      {
        row_index: Number,
        values: mongoose.Schema.Types.Mixed
      }
    ]
  },
  { timestamps: { createdAt: 'uploaded_at', updatedAt: false } }
);

export default mongoose.model('Session', sessionSchema);
