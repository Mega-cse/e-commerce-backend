import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    mobileNo: { type: String, required: true }, // Added mobileNo
    address: { type: String, required: true },  // Added address
    randomString: String,
    expirationTimestamp: Number
});

export default mongoose.model('User', UserSchema);
