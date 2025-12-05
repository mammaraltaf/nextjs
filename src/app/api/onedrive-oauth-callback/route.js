// src/app/api/onedrive-oauth-callback/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('OneDrive OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/consumer/this-is-me?error=onedrive_oauth_error`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/consumer/this-is-me?error=onedrive_no_code`);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID,
        client_secret: process.env.ONEDRIVE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/onedrive-oauth-callback`,
        scope: 'files.readwrite',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Store the access token and redirect back to consumer page
    const redirectUrl = new URL(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/consumer/this-is-me`);
    redirectUrl.searchParams.set('onedrive_token', tokenData.access_token);
    redirectUrl.searchParams.set('action', 'open_onedrive_picker');
    
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('OneDrive OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/consumer/this-is-me?error=onedrive_oauth_failed`);
  }
}
