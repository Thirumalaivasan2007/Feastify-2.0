import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// --- User Model ---
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'driver'], default: 'customer' },
    feastPoints: { type: Number, default: 0 },
    loyaltyTier: { type: String, enum: ['Gold', 'Platinum', 'Black'], default: 'Gold' },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Food' }],
    totalDeliveries: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    // Phase 1 Features
    isFeastifyPrime: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    dietaryPreferences: [{ type: String }],
    badges: [{ type: String }],
    biometricId: { type: String, default: null }
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- Food Model ---
const foodSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
    prepTime: { type: String, default: '25-30 Mins' },
    tag: { type: String, default: 'Fresh Items' },
    dietaryTags: [{ type: String }], // e.g., 'Vegan', 'Gluten-Free'
    reviews: [{
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    // Phase 1 Features
    arModelUrl: { type: String, default: null },
    ecoPackaging: { type: Boolean, default: true },
    calories: { type: Number, default: 0 },
    macros: {
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 }
    }
}, { timestamps: true });

export const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

// --- Category Model ---
const categorySchema = new Schema({
    name: { type: String, required: true, unique: true }
});

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// --- Order Model ---
const orderSchema = new Schema({
    customerDetails: { type: Object, required: true },
    customerEmail: { type: String, required: true },
    cartItems: [{
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    orderStatus: { type: String, default: 'Pending' },
    timestamp: { type: Date, default: Date.now },
    cancelledBy: { type: String, default: null },
    acknowledgedByAdmin: { type: Boolean, default: false },
    deliveryCoordinates: { 
        lat: { type: Number },
        lng: { type: Number }
    },
    appliedCoupon: { type: String, default: null },
    driverId: { type: String, default: null },
    driverName: { type: String, default: null },
    deliveredAt: { type: Date, default: null },
    // Phase 1 Features
    scheduledDeliveryTime: { type: Date, default: null },
    ecoPackagingRequested: { type: Boolean, default: false },
    splitBillDetails: {
        isSplit: { type: Boolean, default: false },
        participants: [{ type: String }]
    },
    chatHistory: [{
        sender: { type: String }, // 'customer', 'driver', 'admin'
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
    }]
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// --- Coupon Model ---
const couponSchema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxUses: { type: Number, default: null }, // null means unlimited
    usesCount: { type: Number, default: 0 },
    validUntil: { type: Date, default: null }, // null means never expires
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

// --- DriverProfile Model ---
const driverProfileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currentShift: {
        start: { type: Date },
        end: { type: Date }
    },
    vehicleDetails: {
        type: { type: String, default: 'Bike' },
        licensePlate: { type: String }
    },
    proofOfDelivery: [{
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        imageUrl: { type: String },
        signatureUrl: { type: String },
        timestamp: { type: Date, default: Date.now }
    }]
});
export const DriverProfile = mongoose.models.DriverProfile || mongoose.model('DriverProfile', driverProfileSchema);

// --- Review Model (Sentiment Analysis) ---
const reviewSchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true },
    comment: { type: String },
    sentimentScore: { type: Number, default: 0 } // -1 to 1 based on AI analysis
}, { timestamps: true });
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// --- StoreBranch Model ---
const storeBranchSchema = new Schema({
    name: { type: String, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    inventory: [{
        foodId: { type: Schema.Types.ObjectId, ref: 'Food' },
        stock: { type: Number, default: 0 }
    }]
});
export const StoreBranch = mongoose.models.StoreBranch || mongoose.model('StoreBranch', storeBranchSchema);
