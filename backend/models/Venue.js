const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Venue name is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        location: {
            address: { type: String, required: true },
            city: { type: String, default: 'Mumbai' },
            coordinates: {
                lat: { type: Number, default: null },
                lng: { type: Number, default: null },
            },
        },
        sports: [
            {
                name: { type: String, required: true },       // e.g. "Football"
                icon: { type: String, default: 'soccer' },   // MaterialCommunityIcons name
                surface: { type: String, default: 'Grass' }, // e.g. "Astro Turf"
            },
        ],
        amenities: {
            type: [String],
            default: [],
        },
        images: {
            type: [String], // Array of image URLs
            default: [],
        },
        pricePerHour: {
            type: Number,
            required: [true, 'Price per hour is required'],
            min: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewsCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        operatingHours: {
            start: { type: Number, default: 6 },  // 6 AM
            end: { type: Number, default: 23 },   // 11 PM
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
