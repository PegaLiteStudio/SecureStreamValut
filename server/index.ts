import express, {NextFunction, type Request, Response} from "express";
import {registerRoutes} from "./routes";
import {log, serveStatic, setupVite} from "./vite";
import os from "os";

const numCPUs = os.cpus().length;
const port = 5003;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            log(logLine);
        }
    });

    next();
});

(async () => {
    const server = await registerRoutes(app);

    // Error handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({message});
        throw err;
    });

    // Dev mode: Vite setup
    if (app.get("env") === "development") {
        await setupVite(app, server);
    } else {
        serveStatic(app);
    }

    server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true, // allow multiple workers to bind same port
    }, () => {
        log(`Worker ${process.pid} serving on port ${port}`);
    });
})();

