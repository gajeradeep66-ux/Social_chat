import { ENV } from './env.js';

let aj;

try {
    const arcjetModule = await import("@arcjet/node");
    const arcjet = arcjetModule.default || arcjetModule;
    const { shield, detectBot, slidingWindow } = arcjetModule;

    aj = arcjet({
        key: ENV.ARCJET_KEY || "ajkey_placeholder",        
        rules: [
            // Shield protects your app from common attacks e.g. SQL injection
            shield({ mode: "LIVE" }),
            // Create a bot detection rule
            detectBot({
                mode: "LIVE",
                // Block all bots except the following
                allow: [
                    "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
                    "CATEGORY:TOOL", // API testing tools like Postman
                    "CATEGORY:CURL", // curl requests
                    "CATEGORY:PROGRAMMATIC",
                ],
            }),
            slidingWindow({
                mode: "LIVE", // Tracked by IP address by default, but this can be customized
                max: 100,
                interval: 60,
            }),
        ],
    });
} catch (error) {
    console.warn("Arcjet loading skipped due to module compatibility issue:", error.message);
    aj = {
        protect: async () => ({
            isDenied: () => false,
            reason: { isRateLimit: () => false, isBot: () => false },
            results: [],
        }),
    };
}

export default aj;
