import aj from '../lib/arcjet.js'
import { isSpoofedBot } from "@arcjet/inspect";
import { ENV } from '../lib/env.js';

export const arcjetProtection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req)

        if(decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ message : "Rate limit exceeded. Please try again later "})
            } else if (decision.reason.isBot()) {
                const userAgent = req.headers['user-agent'] || '';
                if (ENV.NODE_ENV === 'development' || userAgent.includes('Postman')) {
                    return next();
                }
                return res.status(403).json({ message : " Bot access denied"})
            } else {
                return res.status(403).json({ message : "Access denied by security policy"})
            }
        }

        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({ 
                error : "Spoofed bot detected",
                message : "Malicious bot activity detected",
            })
        }

        next();
    } catch (error) {
        console.error("Arcjet Protection error:", error);
        next();
    }
}