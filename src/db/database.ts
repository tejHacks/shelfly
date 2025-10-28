import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

/**
 * Database singleton
 */
let db: SQLite.SQLiteDatabase | null = null;

// User with phone
export type User = {
  id?: number;
  name: string;
  email: string;
  password: string; // hashed
  phone?: string;
  created_at?: string;
};

export type Product = {
  id?: number;
  ownerEmail: string;
  name: string;
  quantity: number;
  price: number;
  imageUri?: string | null;
  created_at?: string;
};

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export async function initDB() {
  console.log("[DB] initDB called");
  if (db) {
    console.log("[DB] Reusing existing DB");
    return db;
  }

  db = await SQLite.openDatabaseAsync("shelfly.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  // === USERS TABLE ===
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `);
// add th phone colun to it in case 
  try {
    await db.execAsync(`ALTER TABLE users ADD COLUMN phone TEXT;`);
    console.log("[DB] Added 'phone' column");
  } catch (err: any) {
    if (!String(err.message).includes("duplicate column name")) {
      console.error("[DB] Failed to add phone column:", err);
    } else {
      console.log("[DB] 'phone' column already exists");
    }
  }

  // === PRODUCTS TABLE ===
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerEmail TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      imageUri TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY(ownerEmail) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  // === RESET TOKENS TABLE === send tokens to reset the user password sha (its not a real one though, but it just works sha...)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE
    );
  `);

  // Clean expired tokens
  await db.runAsync(`DELETE FROM reset_tokens WHERE expires_at < datetime('now');`);

  const tables = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table';`
  );
  console.log("[DB] Tables:", tables.map(t => t.name));

  return db;
}

/* ------------------------------
   PASSWORD HASHING
--------------------------------*/

async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

/* ------------------------------
   USER FUNCTIONS
--------------------------------*/

export async function createUser(user: User & { phone?: string }): Promise<number> {
  const db = await initDB();

  if (!user.name?.trim()) throw new ValidationError("Name is required");
  if (!user.email?.trim()) throw new ValidationError("Email is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim()))
    throw new ValidationError("Invalid email format");
  if (!user.password || user.password.length < 6)
    throw new ValidationError("Password must be at least 6 characters");

  const hashed = await hashPassword(user.password);
  const email = user.email.trim().toLowerCase();
  const phone = user.phone?.trim() || null;

  try {
    const result = await db.runAsync(
      `INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?);`,
      [user.name.trim(), email, hashed, phone]
    );
    return result.lastInsertRowId ?? -1;
  } catch (err: any) {
    const msg = String(err?.message || "");

    if (msg.includes("UNIQUE")) {
      throw new Error("This email is already registered.");
    }
    if (msg.includes("no such table")) {
      throw new Error("Database not ready. Restart the app.");
    }
    if (msg.includes("no column")) {
      throw new Error("DB outdated. Run: npx expo start --clear");
    }

    throw new Error(`Signup failed: ${msg}`);
  }
}


// get the user buy their email
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await initDB();
  const cleanEmail = email.trim().toLowerCase();

  return await db.getFirstAsync<User>(
    `SELECT * FROM users WHERE email = ? LIMIT 1;`,
    [cleanEmail]
  );
}


// get the user by validating their email and password
export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const hashed = await hashPassword(password);
  return user.password === hashed ? user : null;
}

export async function updateUser(user: Partial<User> & { email: string }): Promise<void> {
  const db = await initDB();
  const updates: string[] = [];
  const values: any[] = [];

  if (user.name) {
    updates.push("name = ?");
    values.push(user.name.trim());
  }
  if (user.password) {
    const hashed = await hashPassword(user.password);
    updates.push("password = ?");
    values.push(hashed);
  }

  if (updates.length === 0) throw new Error("No fields to update");

  values.push(user.email.trim().toLowerCase());

  const result = await db.runAsync(
    `UPDATE users SET ${updates.join(", ")} WHERE email = ?;`,
    values
  );

  if (result.changes === 0) throw new Error("User not found");
}


/* ------------------------------
   DELETE USER (with cascade)
--------------------------------*/

export async function deleteUser(email: string): Promise<void> {
  const db = await initDB();
  const cleanEmail = email.trim().toLowerCase();

  // First, verify user exists
  const user = await getUserByEmail(cleanEmail);
  if (!user) {
    throw new Error("User not found");
  }

  // Delete user → products are auto-deleted via FOREIGN KEY ... ON DELETE CASCADE
  const result = await db.runAsync(`DELETE FROM users WHERE email = ?;`, [cleanEmail]);

  if (result.changes === 0) {
    throw new Error("Failed to delete user");
  }

  console.log(`[DB] User deleted: ${cleanEmail}`);
}

/* ------------------------------
   PASSWORD RESET
--------------------------------*/

export async function sendResetToken(email: string): Promise<string> {
  const db = await initDB();
  const cleanEmail = email.trim().toLowerCase();

  const user = await getUserByEmail(cleanEmail);
  if (!user) throw new ValidationError("No account with this email");

  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  await db.runAsync(`DELETE FROM reset_tokens WHERE email = ?;`, [cleanEmail]);
  await db.runAsync(
    `INSERT INTO reset_tokens (email, token, expires_at) VALUES (?, ?, ?);`,
    [cleanEmail, token, expiresAt.toISOString()]
  );

  return token;
}


export async function verifyResetToken(email: string, token: string): Promise<User | null> {
  const db = await initDB();
  const cleanEmail = email.trim().toLowerCase();

  const row = await db.getFirstAsync<{ token: string; expires_at: string }>(
    `SELECT token, expires_at FROM reset_tokens WHERE email = ? AND token = ?;`,
    [cleanEmail, token]
  );

  if (!row) return null;

  const expired = new Date(row.expires_at) < new Date();
  if (expired) {
    await db.runAsync(`DELETE FROM reset_tokens WHERE email = ? AND token = ?;`, [cleanEmail, token]);
    return null;
  }

  await db.runAsync(`DELETE FROM reset_tokens WHERE email = ?;`, [cleanEmail]);
  return await getUserByEmail(cleanEmail);
}

/* ------------------------------
   PRODUCT FUNCTIONS
--------------------------------*/

export async function insertProduct(product: Product): Promise<number> {
  const db = await initDB();

  if (!product.ownerEmail?.trim()) throw new ValidationError("Owner email required");
  if (!product.name?.trim()) throw new ValidationError("Product name required");
  if (!Number.isInteger(product.quantity) || product.quantity < 0)
    throw new ValidationError("Invalid quantity");
  if (typeof product.price !== "number" || product.price < 0)
    throw new ValidationError("Invalid price");

  const owner = await getUserByEmail(product.ownerEmail);
  if (!owner) throw new ValidationError("Owner not found");

  const result = await db.runAsync(
    `INSERT INTO products (ownerEmail, name, quantity, price, imageUri) VALUES (?, ?, ?, ?, ?);`,
    [
      product.ownerEmail.trim().toLowerCase(),
      product.name.trim(),
      product.quantity,
      product.price,
      product.imageUri ?? null,
    ]
  );

  return result.lastInsertRowId ?? -1;
}

export async function getProductsByOwner(ownerEmail: string): Promise<Product[]> {
  const db = await initDB();
  return await db.getAllAsync<Product>(
    `SELECT * FROM products WHERE ownerEmail = ? ORDER BY id DESC;`,
    [ownerEmail.trim().toLowerCase()]
  );
}

export async function updateProduct(product: Product): Promise<void> {
  const db = await initDB();

  if (!product.id) throw new ValidationError("Product ID required");
  if (!product.name?.trim()) throw new ValidationError("Product name required");

  const result = await db.runAsync(
    `UPDATE products SET name = ?, quantity = ?, price = ?, imageUri = ? WHERE id = ?;`,
    [product.name.trim(), product.quantity, product.price, product.imageUri ?? null, product.id]
  );

  if (result.changes === 0) throw new Error("Product not found");
}

export async function deleteProductById(id: number): Promise<void> {
  const db = await initDB();
  const result = await db.runAsync(`DELETE FROM products WHERE id = ?;`, [id]);
  if (result.changes === 0) throw new Error("Product not found");
}

/* ------------------------------
   HELPERS
--------------------------------*/

export async function getUserCount(): Promise<number> {
  const db = await initDB();
  const row = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) AS count FROM users;`);
  return Number(row?.count ?? 0);
}

export async function getProductCount(ownerEmail: string): Promise<number> {
  const db = await initDB();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM products WHERE ownerEmail = ?;`,
    [ownerEmail.trim().toLowerCase()]
  );
  return Number(row?.count ?? 0);
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = await initDB();
  return await db.getFirstAsync<Product>(`SELECT * FROM products WHERE id = ? LIMIT 1;`, [id]);
}



// i didnt have a backend so i decided not to use a process to send a token to the users email...
//