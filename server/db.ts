// server/db.ts
/*
import mongoose, { Mongoose } from 'mongoose';

const MONGO_URL = process.env.MONGO_URL!;
if (!MONGO_URL) throw new Error('MONGO_URL not set');

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached = (globalThis as any).mongoose as MongooseCache;

if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URL).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}*/

// server/db.ts
/*
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL!;
if (!MONGO_URL) throw new Error('MONGO_URL not set');

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a more robust global cache
const mongoGlobal = global as typeof global & {
  mongoose?: MongooseCache;
};

let cached = mongoGlobal.mongoose;

if (!cached) {
  cached = mongoGlobal.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached!.conn) return cached!.conn;
  
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Adjust for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    cached!.promise = mongoose.connect(MONGO_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }
  
  return cached!.conn;
}
console.log(process.env.MONGO_URL)*/

import mongoose from 'mongoose';
import './models/userModel';
import './models/postModel';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URL = process.env.MONGO_URL!;
if (!MONGO_URL) throw new Error('MONGO_URL not set');

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const mongoGlobal = global as typeof global & {
  mongoose?: MongooseCache;
};

let cached = mongoGlobal.mongoose;

if (!cached) {
  cached = mongoGlobal.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached!.conn) return cached!.conn;
  
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    cached!.promise = mongoose.connect(MONGO_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }
  
  return cached!.conn;
}
