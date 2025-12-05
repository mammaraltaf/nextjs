import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/verify-recaptcha
 * 
 * Purpose: Verifies traditional reCAPTCHA v3 tokens (non-Enterprise)
 * This is an alternative to the Enterprise version for simpler implementations
 * 
 * Request Body:
 * - token: reCAPTCHA token from frontend
 * 
 * Response:
 * - success: boolean
 * - score: Risk score from Google (0.0-1.0)
 * - error: Error message if verification failed
 */

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { token } = body;

    // Validate required parameters
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing reCAPTCHA token' },
        { status: 400 }
      );
    }

    // Get secret key from environment variables
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('Missing RECAPTCHA_SECRET_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify token with Google's reCAPTCHA service
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    
    const response = await fetch(verificationUrl, {
      method: 'POST',
    });

    const data = await response.json();

    // Check if verification was successful
    if (!data.success) {
      return NextResponse.json({
        success: false,
        error: 'reCAPTCHA verification failed',
        details: data['error-codes'] || 'Unknown error'
      }, { status: 400 });
    }

    // Return verification result
    return NextResponse.json({
      success: true,
      score: data.score,
      action: data.action,
      hostname: data.hostname,
      message: 'reCAPTCHA verification successful'
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}