import { User, Order } from './models';
import { connectDB } from './db';

interface FraudAnalysisResult {
    isFraudulent: boolean;
    reason: string | null;
    riskScore: number; // 0 to 100
}

export async function analyzeOrderForFraud(userId: string, totalAmount: number): Promise<FraudAnalysisResult> {
    await connectDB();
    
    let riskScore = 0;
    const reasons: string[] = [];

    // 1. High-value order from a new user
    const user = await User.findById(userId);
    if (!user) {
        return { isFraudulent: true, reason: 'User not found', riskScore: 100 };
    }

    if (user.totalDeliveries === 0 && totalAmount > 5000) {
        riskScore += 60;
        reasons.push('Unusually large first order');
    }

    // 2. Rate limiting (Velocity check)
    // Check if the user placed more than 3 orders in the last 10 minutes
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentOrdersCount = await Order.countDocuments({
        'customerDetails.userId': userId,
        timestamp: { $gte: tenMinsAgo }
    });

    if (recentOrdersCount >= 3) {
        riskScore += 80;
        reasons.push('Too many orders placed rapidly');
    }

    // 3. Time of day checks (e.g. large orders at 3 AM might be riskier)
    const currentHour = new Date().getHours();
    if ((currentHour >= 1 && currentHour <= 5) && totalAmount > 2000) {
        riskScore += 30;
        reasons.push('Large order during late night hours');
    }

    const isFraudulent = riskScore >= 75;

    return {
        isFraudulent,
        reason: isFraudulent ? reasons.join(', ') : null,
        riskScore: Math.min(riskScore, 100)
    };
}
