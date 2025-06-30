import rateLimit from "express-rate-limit";

// Limit login attempts (to prevent brute-force attacks)
export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: () => 5,
    message: { message: "Too many login attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limit video stream requests
export const streamLimiter = rateLimit({
    windowMs: 60 * 1000 * 5, // 5 minutes
    limit: () => 30,
    message: { message: "Too many stream requests from this IP, slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limit video uploads
export const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: () => 10,
    message: { message: "Too many uploads, please wait before trying again." },
    standardHeaders: true,
    legacyHeaders: false,
});
