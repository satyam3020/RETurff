const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true,
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false, // Never returned in queries by default
        },
        resetPasswordOTP: String,
        resetPasswordExpires: Date,
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        profileImage: {
            type: String,
            default: null,
        },
        preferences: {
            age: { type: Number, default: null },
            gender: { type: String, default: null },
            interestedSports: { type: [String], default: [] },
        },
        bio: {
            type: String,
            default: null,
        },
        promptsAnswered: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove passwordHash from JSON responses
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
