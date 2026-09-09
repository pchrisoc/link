import mongoose, { Schema } from 'mongoose';

const sessionSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  credentialVersion: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});
const attemptSchema = new Schema({
  _id: String,
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
});
export const Session = mongoose.models.AuthSession || mongoose.model('AuthSession', sessionSchema);
export const LoginAttempt = mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', attemptSchema);
