/**
 * Test MongoDB Connection Endpoint
 * 
 * This endpoint helps diagnose MongoDB connection issues
 */

import { MongoClient } from 'mongodb';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      return res.status(500).json({
        error: 'MONGODB_URI not configured',
        message: 'MONGODB_URI environment variable is not set',
      });
    }

    // Log connection string (without password) for debugging
    const uriWithoutPassword = uri.replace(/:[^:@]+@/, ':****@');
    console.log('Attempting to connect to MongoDB:', uriWithoutPassword);
    console.log('URI length:', uri.length);
    console.log('URI starts with mongodb+srv:', uri.startsWith('mongodb+srv'));

    const client = new MongoClient(uri, {
      connectTimeoutMS: 15000,
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    const startTime = Date.now();
    await client.connect();
    const connectTime = Date.now() - startTime;

    // Test the connection
    const db = client.db('sui_chat');
    await db.command({ ping: 1 });

    // List collections
    const collections = await db.listCollections().toArray();

    await client.close();

    return res.status(200).json({
      success: true,
      message: 'MongoDB connection successful',
      connectTime: `${connectTime}ms`,
      database: 'sui_chat',
      collections: collections.map((c) => c.name),
    });
  } catch (error: any) {
    console.error('MongoDB test error:', error);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more detailed error information
    let errorDetails: any = {
      error: 'MongoDB connection failed',
      message: error.message,
      errorType: error.constructor.name,
      errorName: error.name,
    };
    
    if (error.code) {
      errorDetails.errorCode = error.code;
    }
    
    // Check for common error patterns
    if (error.message?.includes('authentication failed') || error.message?.includes('bad auth')) {
      errorDetails.hint = 'Check username and password in connection string';
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      errorDetails.hint = 'Check cluster hostname in connection string';
    } else if (error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
      errorDetails.hint = 'Check Network Access settings in MongoDB Atlas - ensure IP whitelist includes 0.0.0.0/0 or Vercel IPs';
    } else if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      errorDetails.hint = 'SSL/TLS connection issue - check MongoDB Atlas network settings';
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorDetails.stack = error.stack;
    }
    
    return res.status(500).json(errorDetails);
  }
}

