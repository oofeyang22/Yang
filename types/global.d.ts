// types/global.d.ts

import { Mongoose } from 'mongoose';

// Define the structure of your custom mongoose cache
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the Node.js global interface to include your cache
declare global {
  var mongoose: MongooseCache;
}

// This empty export is crucial: it tells the TypeScript compiler to treat 
// this file as a module rather than a global script, ensuring that 
// 'declare global' works as intended for augmenting the global scope.
export {};