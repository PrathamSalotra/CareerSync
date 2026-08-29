import mongoose from 'mongoose';

const SearchReservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    state: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

// TTL Index (§4.4): Auto-expire documents after expiresAt date
SearchReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SearchReservation = mongoose.model(
  'SearchReservation',
  SearchReservationSchema
);
export default SearchReservation;
