'use server';

// This is a simple in-memory rate limiter.
// In a production environment, you would use a persistent store like Redis or a database.
const usage = new Map<string, number[]>();
const LIMIT = 2;
const DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const userTimestamps = usage.get(ip) || [];

    // Filter out timestamps that are older than the duration
    const recentTimestamps = userTimestamps.filter(
        (timestamp) => now - timestamp < DURATION
    );
    
    usage.set(ip, recentTimestamps);

    if (recentTimestamps.length < LIMIT) {
        return { allowed: true, remaining: LIMIT - recentTimestamps.length };
    }

    return { allowed: false, remaining: 0 };
}

export async function recordUsage(ip: string): Promise<void> {
    const now = Date.now();
    const userTimestamps = usage.get(ip) || [];
    
    const recentTimestamps = userTimestamps.filter(
        (timestamp) => now - timestamp < DURATION
    );

    if (recentTimestamps.length < LIMIT) {
        recentTimestamps.push(now);
        usage.set(ip, recentTimestamps);
    }
}
