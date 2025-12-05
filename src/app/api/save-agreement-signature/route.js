// app/api/save-agreement-signature/route.js
import { NextResponse } from 'next/server';
import { submitToLaravel } from '@/app/lib/laravelApi';

/**
 * Convert camelCase to snake_case
 */
function toSnakeCase(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {});
}

/**
 * POST /api/save-agreement-signature
 *
 * Saves agreement signature data via Laravel API
 *
 * Expected request body:
 * {
 *   agreementType: 'consumer' | 'merchant' | string,
 *   userName: string,
 *   userId?: string,
 *   signatureData: string (base64),
 *   agreementPdf?: File (optional)
 * }
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let body;
    let isMultipart = false;

    // Handle multipart form data (if PDF is included)
    if (contentType.includes('multipart/form-data')) {
      isMultipart = true;
      const formData = await request.formData();
      body = formData;
    } else {
      // Handle JSON data
      body = await request.json();
    }

    console.log('Agreement signature save request received:', body);

    // Validate required fields for JSON requests
    if (!isMultipart) {
      const { agreementType, userName, signatureData, userId } = body;

      if (!agreementType || !userName || !signatureData) {
        return NextResponse.json({
          success: false,
          error: 'Missing required fields: agreementType, userName, signatureData'
        }, { status: 400 });
      }

      if (!userId) {
        return NextResponse.json({
          success: false,
          error: 'Missing required field: userId (GUID)'
        }, { status: 400 });
      }
    }

    // Convert camelCase to snake_case for Laravel
    const laravelPayload = isMultipart ? body : toSnakeCase(body);

    console.log('Sending to Laravel:', laravelPayload);

    // Forward to Laravel API
    const response = await submitToLaravel(
      '/agreement-signatures',
      laravelPayload,
      { isMultipart }
    );

    return NextResponse.json(response, {
      status: response.success ? 201 : 500
    });

  } catch (error) {
    console.error('Agreement Signature API Error:', {
      message: error.message,
      stack: error.stack,
      error: error
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to save agreement signature',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      fullError: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    }, { status: 500 });
  }
}

/**
 * GET /api/save-agreement-signature?agreementId={id}
 *
 * Retrieves agreement signature data by agreement ID via Laravel API
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agreementId = searchParams.get('agreementId');

    if (!agreementId) {
      return NextResponse.json({
        success: false,
        error: 'Agreement ID is required'
      }, { status: 400 });
    }

    // Forward to Laravel API
    const url = `${process.env.LARAVEL_API_URL || 'http://localhost:8000'}${process.env.LARAVEL_API_BASE_PATH || '/api/v1'}/agreement-signatures/${agreementId}`;

    const headers = {
      'Accept': 'application/json',
    };

    if (process.env.LARAVEL_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.LARAVEL_API_KEY}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status
    });

  } catch (error) {
    console.error('Agreement Signature Retrieval Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve agreement signature',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
