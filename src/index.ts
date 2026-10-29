import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import "dotenv/config";
import jwt from "jsonwebtoken";
import express from "express";

import cors from "cors";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { db } from "./db.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { graphqlRouter } from "./routes/graphql.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ALLOWED_ORIGINS = [
    "https://astc-joyit.io",
    "https://astc.joyit.io",
    "https://attendance-joyit.io",
    "https://attendance.joyit.io",
    "https://astc-project.joyit.io",
    "https://astc-backoffice.joyit.io",
    "https://astc-api.joyit.io",
    "https://astc-auth.joyit.io",
    "https://astc-minio.joyit.io",
    "https://minio-s3.astc.joyit.io",
    "https://auth-api.astc.joyit.io",
    "https://project.astc.joyit.io",
    "https://backoffice.astc.joyit.io",
    "https://assistance.astc.joyit.io",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        try {
            const parsed = new URL(origin);
            if (
                ALLOWED_ORIGINS.includes(origin) ||
                parsed.hostname.endsWith("joyit.io") ||
                parsed.hostname === "localhost" ||
                parsed.hostname === "127.0.0.1" ||
                process.env.NODE_ENV !== "production"
            ) {
                return callback(null, true);
            }
        } catch {
            // invalid URL
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const privateKeyPath = fs.existsSync("private.pem") ? "private.pem" : path.join(__dirname, "../private.pem");
const privateKey = fs.readFileSync(privateKeyPath);

/* =========================
   LOGIN (Directo o bajo /api/auth)
========================= */
app.post(["/login", "/api/auth/login"], async (req, res) => {
    const tStart = Date.now();
    try {

        console.log("============== LOGIN REQUEST ==============");
        console.log("[AUTH PERF] Login request started");

        const { email, password } = req.body;

        const tDbStart = Date.now();
        const user = await db.user.findUnique({
            where: { email },
            include: { role: true }
        });
        console.log(`[AUTH PERF] Database user lookup took ${Date.now() - tDbStart} ms`);

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const tPasswordStart = Date.now();
        const valid = await bcrypt.compare(
            password,
            user.password_hash
        );
        const tPasswordDuration = Date.now() - tPasswordStart;
        console.log(`[AUTH PERF] Password validation duration = ${tPasswordDuration} ms`);

        if (!valid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

let avatarUrl = user.avatar_url || "";
        const s3External = process.env.S3_EXTERNAL_URL || process.env.S3_PUBLIC_ENDPOINT || "https://astc-minio.joyit.io";
        if (avatarUrl.includes("http://minio:9000") || avatarUrl.includes("astc.local") || avatarUrl.includes("minio-s3.astc.joyit.io")) {
            avatarUrl = avatarUrl.replace("http://minio:9000", s3External)
                                 .replace("https://minio-s3.astc.local", s3External)
                                 .replace("http://minio-s3.astc.local", s3External)
                                 .replace("https://minio-s3.astc.joyit.io", s3External);
        }

        const tJwtStart = Date.now();
        // 🔥 JWT RS256 (MISMO PAYLOAD, SOLO CAMBIA FIRMA)
        const token = jwt.sign(
            {
                sub: user.id,
                email: user.email,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                avatarUrl: avatarUrl,
                role: user.role.code,
                groups: [user.role.code]
            },
            privateKey,
            {
                algorithm: "RS256",
                expiresIn: "24h",
                issuer: "better-auth-verify"
            }
        );
        const tJwtDuration = Date.now() - tJwtStart;
        console.log(`[AUTH PERF] JWT generation duration = ${tJwtDuration} ms`);
        
        console.log(`[AUTH PERF] Total login backend duration = ${Date.now() - tStart} ms`);

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                avatarUrl: avatarUrl,
                role: {
                    id: user.role.id,
                    code: user.role.code,
                    name: user.role.name
                }
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

/* =========================
   ME (PROTEGIDO)
========================= */
app.get(["/me", "/api/auth/me"], authMiddleware, (req, res) => {
    return res.json({
        user: (req as any).user
    });
});

/* =========================
   GRAPHQL (Backoffice & User Management)
========================= */
app.use(["/graphql", "/api/auth/graphql"], graphqlRouter);

/* =========================
   UI VISUAL (Frontend Auth Integrado)
========================= */
const candidates = [
    path.join(__dirname, "../public"),
    path.join(__dirname, "../../client/dist"),
    path.join(__dirname, "../client/dist"),
    path.join(process.cwd(), "client/dist"),
    path.join(process.cwd(), "public")
];

const clientBuildPath = candidates.find(p => fs.existsSync(path.join(p, "index.html")));

if (clientBuildPath) {
    console.log(`🎨 [AUTH UI] Servidor de UI Visual activo desde: ${clientBuildPath}`);
    app.use(express.static(clientBuildPath));

    // Fallback SPA para rutas del frontend
    app.use((req, res, next) => {
        if (req.method !== "GET") {
            return next();
        }
        if (req.path.startsWith("/api") || req.path === "/me" || req.path === "/graphql") {
            return next();
        }
        res.sendFile(path.join(clientBuildPath, "index.html"));
    });
} else {
    console.log("ℹ️ [AUTH UI] Modo API pura (no se detectó build estático en client/dist o public).");
}

// Warm up the database connection pool on startup to eliminate cold starts
db.$connect()
    .then(() => console.log("⚡ [AUTH] Prisma Client successfully connected to Database"))
    .catch((err: any) => console.error("❌ [AUTH] Prisma connection error during startup warmup:", err));

const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
    console.log(`Better Auth running on ${PORT}`);
});




