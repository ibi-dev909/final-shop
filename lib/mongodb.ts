import mongoose from "mongoose";
import dns from "node:dns";

// Node.js 22+ has a known bug on Windows where it doesn't correctly use the
// system DNS resolver for SRV lookups, causing mongodb+srv:// connection
// strings to fail with "querySrv ECONNREFUSED" even on a fine network with
// correct credentials. Forcing public DNS resolvers works around it, and is
// harmless on other platforms/Node versions.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export default async function dbConnect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not defined. Set it in .env.local."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
