// src/app/api/google-drive-oauth-callback/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google Drive OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/consumer/this-is-me?error=google_oauth_error`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/consumer/this-is-me?error=google_no_code`);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/google-drive-oauth-callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Store the access token and redirect back to consumer page
    const redirectUrl = new URL(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/consumer/this-is-me`);
    redirectUrl.searchParams.set('google_token', tokenData.access_token);
    redirectUrl.searchParams.set('action', 'open_google_picker');
    
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Google Drive OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/consumer/this-is-me?error=google_oauth_failed`);
  }
}
