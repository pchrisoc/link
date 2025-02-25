import mongoose, { Schema } from 'mongoose';

const urlSchema = new Schema({
    unique: {
        type: String,
        unique: true,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    clicked: {
        type: Number,
        default: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Url = mongoose.models.Url || mongoose.model("Url", urlSchema);

export default Url;