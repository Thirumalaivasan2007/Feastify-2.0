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
    earnings: { type: Number, default: 0 }
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
    }]
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
    deliveredAt: { type: Date, default: null }
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
