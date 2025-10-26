import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

/**
 * Database singleton (initialized once)
 */
let db: SQLite.SQLiteDatabase | null = null;

export type User = {
  id?: number;
  name: string;
  email: string;
  password: string; // hashed password
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
    console.log("[DB] Reusing existing DB instance");
    return db;
  }

  console.log("[DB] Opening database: shelfly.db");
  db = await SQLite.openDatabaseAsync("shelfly.db");

  console.log("[DB] Setting PRAGMA journal_mode = WAL and foreign_keys = ON");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  console.log("[DB] Creating users table if not exists");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `);

  console.log("[DB] Creating products table if not exists");
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

  const tables = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table';`
  );
  console.log("[DB] Tables in database:", tables.map(t => t.name));

  console.log("[DB] SQLite DB initialized successfully");
  return db;
}

/* ------------------------------
   USER FUNCTIONS
--------------------------------*/

async function hashPassword(password: string): Promise<string> {
  console.log("[DB] hashPassword called with password length:", password.length);
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
  console.log("[DB] Password hashed successfully");
  return hashed;
}

export async function createUser(user: User): Promise<number> {
  console.log("[DB] createUser called with:", { name: user.name, email: user.email });

  const database = await initDB();

  if (!user.name?.trim()) throw new ValidationError("Name is required");
  if (!user.email?.trim()) throw new ValidationError("Email is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim()))
    throw new ValidationError("Invalid email format");

  if (!user.password || user.password.length < 6)
    throw new ValidationError("Password must be at least 6 characters");

  const hashed = await hashPassword(user.password);
  const email = user.email.trim().toLowerCase();

  try {
    console.log("[DB] Inserting user into DB:", { name: user.name.trim(), email });
    const result = await database.runAsync(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?);`,
      [user.name.trim(), email, hashed]
    );
    console.log("[DB] User created with ID:", result.lastInsertRowId);
    return result.lastInsertRowId ?? -1;
  } catch (err: any) {
    if (String(err?.message).includes("UNIQUE")) {
      console.log("[DB] Email already exists:", email);
      throw new Error("A user with this email already exists");
    }
    console.error("[DB] Failed to create user:", err.message);
    throw new Error("Failed to create user: " + err.message);
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  console.log("[DB] getUserByEmail called with:", email);
  const database = await initDB();
  const cleanEmail = email.trim().toLowerCase();

  const row = await database.getFirstAsync<User>(
    `SELECT * FROM users WHERE email = ? LIMIT 1;`,
    [cleanEmail]
  );

  if (row) {
    console.log("[DB] User found:", { id: row.id, email: row.email });
  } else {
    console.log("[DB] No user found for email:", cleanEmail);
  }

  return row ?? null;
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  console.log("[DB] validateUser called for:", email);
  const user = await getUserByEmail(email);
  if (!user) {
    console.log("[DB] validateUser: User not found");
    return null;
  }

  const hashed = await hashPassword(password);
  const isValid = user.password === hashed;
  console.log("[DB] validateUser: Password match =", isValid);

  return isValid ? user : null;
}

export async function updateUser(user: Partial<User> & { email: string }): Promise<void> {
  console.log("[DB] updateUser called for email:", user.email);
  const database = await initDB();

  const updates: string[] = [];
  const values: any[] = [];

  if (user.name) {
    updates.push("name = ?");
    values.push(user.name.trim());
    console.log("[DB] Updating name to:", user.name.trim());
  }

  if (user.password) {
    const hashed = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      user.password
    );
    updates.push("password = ?");
    values.push(hashed);
    console.log("[DB] Updating password (hashed)");
  }

  if (updates.length === 0) {
    console.log("[DB] updateUser: No fields to update");
    throw new Error("No fields to update");
  }

  values.push(user.email.trim().toLowerCase());

  const result = await database.runAsync(
    `UPDATE users SET ${updates.join(", ")} WHERE email = ?;`,
    values
  );

  if (result.changes === 0) {
    console.log("[DB] updateUser: No changes made (user not found or unchanged)");
    throw new Error("User not found or unchanged");
  }

  console.log("[DB] updateUser: User updated successfully");
}

export async function deleteUser(email: string): Promise<void> {
  console.log("[DB] deleteUser called for:", email);
  const database = await initDB();
  const cleanEmail = email.trim().toLowerCase();

  console.log("[DB] Deleting products for user:", cleanEmail);
  await database.runAsync("DELETE FROM products WHERE ownerEmail = ?;", [cleanEmail]);

  console.log("[DB] Deleting user record:", cleanEmail);
  await database.runAsync("DELETE FROM users WHERE email = ?;", [cleanEmail]);

  console.log("[DB] User and products deleted successfully");
}

/* ------------------------------
   PRODUCT FUNCTIONS
--------------------------------*/

export async function insertProduct(product: Product): Promise<number> {
  console.log("[DB] insertProduct called:", { name: product.name, ownerEmail: product.ownerEmail });

  const database = await initDB();

  if (!product.ownerEmail?.trim()) throw new ValidationError("Owner email required");
  if (!product.name?.trim()) throw new ValidationError("Product name required");
  if (!Number.isInteger(product.quantity) || product.quantity < 0)
    throw new ValidationError("Quantity must be a non-negative integer");
  if (typeof product.price !== "number" || product.price < 0)
    throw new ValidationError("Price must be a non-negative number");

  const owner = await getUserByEmail(product.ownerEmail);
  if (!owner) throw new ValidationError("Owner not found");

  const result = await database.runAsync(
    `INSERT INTO products (ownerEmail, name, quantity, price, imageUri)
     VALUES (?, ?, ?, ?, ?);`,
    [
      product.ownerEmail.trim().toLowerCase(),
      product.name.trim(),
      product.quantity,
      product.price,
      product.imageUri ?? null,
    ]
  );

  console.log("[DB] Product inserted with ID:", result.lastInsertRowId);
  return result.lastInsertRowId ?? -1;
}

export async function getProductsByOwner(ownerEmail: string): Promise<Product[]> {
  console.log("[DB] getProductsByOwner called for:", ownerEmail);
  const database = await initDB();
  const cleanEmail = ownerEmail.trim().toLowerCase();

  const products = await database.getAllAsync<Product>(
    `SELECT * FROM products WHERE ownerEmail = ? ORDER BY id DESC;`,
    [cleanEmail]
  );

  console.log(`[DB] Found ${products.length} product(s) for ${cleanEmail}`);
  return products;
}

export async function updateProduct(product: Product): Promise<void> {
  console.log("[DB] updateProduct called for product ID:", product.id);

  const database = await initDB();

  if (!product.id) throw new ValidationError("Product ID required");
  if (!product.name?.trim()) throw new ValidationError("Product name required");

  const result = await database.runAsync(
    `UPDATE products
     SET name = ?, quantity = ?, price = ?, imageUri = ?
     WHERE id = ?;`,
    [product.name.trim(), product.quantity, product.price, product.imageUri ?? null, product.id]
  );

  if (result.changes === 0) {
    console.log("[DB] updateProduct: No changes (product not found or unchanged)");
    throw new Error("Product not found or unchanged");
  }

  console.log("[DB] Product updated successfully (ID:", product.id, ")");
}

export async function deleteProductById(id: number): Promise<void> {
  console.log("[DB] deleteProductById called for ID:", id);
  const database = await initDB();

  const result = await database.runAsync(`DELETE FROM products WHERE id = ?;`, [id]);

  if (result.changes === 0) {
    console.log("[DB] deleteProductById: Product not found");
    throw new Error("Product not found");
  }

  console.log("[DB] Product deleted successfully (ID:", id, ")");
}

/* ------------------------------
   HELPER QUERIES
--------------------------------*/

export async function getUserCount(): Promise<number> {
  console.log("[DB] getUserCount called");
  const database = await initDB();
  const row = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM users;`
  );
  const count = Number(row?.count ?? 0);
  console.log("[DB] Total users:", count);
  return count;
}

export async function getProductCount(ownerEmail: string): Promise<number> {
  console.log("[DB] getProductCount called for:", ownerEmail);
  const database = await initDB();
  const row = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM products WHERE ownerEmail = ?;`,
    [ownerEmail.trim().toLowerCase()]
  );
  const count = Number(row?.count ?? 0);
  console.log(`[DB] Product count for ${ownerEmail}:`, count);
  return count;
}

export async function getProductById(id: number): Promise<Product | null> {
  console.log("[DB] getProductById called for ID:", id);
  const database = await initDB();
  const row = await database.getFirstAsync<Product>(
    `SELECT * FROM products WHERE id = ? LIMIT 1;`,
    [id]
  );

  if (row) {
    console.log("[DB] Product found:", row);
  } else {
    console.log("[DB] No product found for ID:", id);
  }

  return row ?? null;
}