import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type AccountRole = "consumer" | "admin";

type AccountConfig = {
    table: "consumer" | "admin";
    idColumn: "consumer_id" | "admin_id";
    label: string;
};

type AccountRow = Record<string, unknown>;

export type CurrentAccount = {
    role: AccountRole;
    userId: number;
    email: string;
    username: string | null;
    status: string | null;
    createdAt: string | null;
};

type AccountSession = {
    role: AccountRole;
    userId: number;
    email: string;
};

const SESSION_COOKIE_NAME = "lazycook-account-session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const ACCOUNT_CONFIG: Record<AccountRole, AccountConfig> = {
    consumer: {
        table: "consumer",
        idColumn: "consumer_id",
        label: "Consumer",
    },
    admin: {
        table: "admin",
        idColumn: "admin_id",
        label: "Admin",
    },
};

export function getSupabaseEnv() {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^"|"$/g, "");
    const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^"|"$/g, "");
    return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseBrowserKeyClient() {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables.");
    }

    return createClient(supabaseUrl, supabaseAnonKey);
}

export function normalizeEmail(raw: FormDataEntryValue | null) {
    return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

export function normalizeUsername(raw: FormDataEntryValue | null) {
    return typeof raw === "string" ? raw.trim() : "";
}

export function normalizePassword(raw: FormDataEntryValue | null) {
    return typeof raw === "string" ? raw : "";
}

export function getRoleConfig(role: AccountRole) {
    return ACCOUNT_CONFIG[role];
}

export async function hasColumn(table: string, column: string) {
    const supabase = createSupabaseBrowserKeyClient();
    const { error } = await supabase.from(table).select(column, { head: true, count: "exact" }).limit(1);
    return !error;
}

export function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
    const [salt, expectedHash] = storedHash.split(":");

    if (!salt || !expectedHash) {
        return false;
    }

    const actualHash = scryptSync(password, salt, 64);
    const expectedBuffer = Buffer.from(expectedHash, "hex");

    if (actualHash.length !== expectedBuffer.length) {
        return false;
    }

    return timingSafeEqual(actualHash, expectedBuffer);
}

function getSessionSecret() {
    return process.env.ACCOUNT_SESSION_SECRET ?? "lazycook-demo-session-secret";
}

function signSession(payload: string) {
    return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encodeSession(session: AccountSession) {
    const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
    const signature = signSession(payload);
    return `${payload}.${signature}`;
}

function decodeSession(token: string): AccountSession | null {
    const [payload, signature] = token.split(".");

    if (!payload || !signature || signSession(payload) !== signature) {
        return null;
    }

    try {
        return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AccountSession;
    } catch {
        return null;
    }
}

export async function setAccountSession(session: AccountSession) {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, encodeSession(session), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
}

export async function clearAccountSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function readAccountSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    return decodeSession(token);
}

export async function findAccountByEmail(role: AccountRole, email: string) {
    const supabase = createSupabaseBrowserKeyClient();
    const config = getRoleConfig(role);

    const { data, error } = await supabase.from(config.table).select("*").eq("email", email).maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return (data as AccountRow | null) ?? null;
}

export async function findAccountByUsername(role: AccountRole, username: string) {
    const supabase = createSupabaseBrowserKeyClient();
    const config = getRoleConfig(role);

    const { data, error } = await supabase.from(config.table).select("*").eq("username", username).maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return (data as AccountRow | null) ?? null;
}

export async function findAccountById(role: AccountRole, userId: number) {
    const supabase = createSupabaseBrowserKeyClient();
    const config = getRoleConfig(role);

    const { data, error } = await supabase.from(config.table).select("*").eq(config.idColumn, userId).maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return (data as AccountRow | null) ?? null;
}

export async function buildInsertPayload(role: AccountRole, username: string, email: string, passwordHash: string) {
    const config = getRoleConfig(role);
    const [hasUsernameColumn, hasStatusColumn] = await Promise.all([
        hasColumn(config.table, "username"),
        hasColumn(config.table, "status"),
    ]);

    const payload: Record<string, string> = {
        email,
        password_hash: passwordHash,
    };

    if (hasUsernameColumn) {
        payload.username = username;
    }

    if (hasStatusColumn) {
        payload.status = "active";
    }

    return payload;
}

export function mapCurrentAccount(role: AccountRole, row: AccountRow) {
    const config = getRoleConfig(role);
    const rawId = row[config.idColumn];

    if (typeof rawId !== "number") {
        return null;
    }

    return {
        role,
        userId: rawId,
        email: typeof row.email === "string" ? row.email : "",
        username: typeof row.username === "string" ? row.username : null,
        status: typeof row.status === "string" ? row.status : null,
        createdAt: typeof row.created_at === "string" ? row.created_at : null,
    } satisfies CurrentAccount;
}

export async function getCurrentAccount() {
    const session = await readAccountSession();

    if (!session) {
        return null;
    }

    const row = await findAccountById(session.role, session.userId);

    if (!row) {
        await clearAccountSession();
        return null;
    }

    return mapCurrentAccount(session.role, row);
}

export function getRoleLabel(role: AccountRole) {
    return getRoleConfig(role).label;
}