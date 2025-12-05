// app/api/submit-consumer-form/route.js
import { NextResponse } from 'next/server';
import { submitToLaravel, testLaravelConnection } from '@/app/lib/laravelApi';

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
 * POST /api/submit-consumer-form
 *
 * Handles consumer form submissions with multipart form data
 * Forwards the data to Laravel API for processing and file storage
 *
 * Expected form data:
 * - formData: JSON string of form fields
 * - files: Uploaded files (optional)
 */
export async function POST(request) {
  try {
    // Handle multipart form data
    const formData = await request.formData();
    const formJson = formData.get('formData');

    if (!formJson) {
      return NextResponse.json({
        success: false,
        error: 'Missing formData field'
      }, { status: 400 });
    }

    let parsedFormData;
    try {
      parsedFormData = JSON.parse(formJson);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in formData field'
      }, { status: 400 });
    }

    const { recaptchaScore, guid } = parsedFormData;

    console.log('Consumer form submission received:', { guid, recaptchaScore });

    // Check reCAPTCHA score threshold (must be > 0.5)
    if (recaptchaScore <= 0.5) {
      return NextResponse.json({ 
        success: false, 
        error: 'Security verification failed - reCAPTCHA score too low' 
      }, { status: 403 });
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Convert camelCase to snake_case for Laravel
    const snakeCaseData = toSnakeCase(parsedFormData);

    // Prepare FormData to send to Laravel
    const laravelFormData = new FormData();

    // Add parsed form data as JSON (now in snake_case)
    const laravelPayload = {
      ...snakeCaseData,
      ip_address: ipAddress,
      user_agent: userAgent,
      submitted_at: new Date().toISOString()
    };
    laravelFormData.append('formData', JSON.stringify(laravelPayload));

    // Process and forward file uploads
    const fileTypes = {
      income: [],
      multiRacial: [],
      impairment: []
    };

    // Categorize files by type
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File && !key.startsWith('multi_racial_file_') && !key.startsWith('impairment_file_')) {
        fileTypes.income.push({ key, file: value });
      } else if (key.startsWith('multi_racial_file_') && value instanceof File) {
        fileTypes.multiRacial.push({ key, file: value });
      } else if (key.startsWith('impairment_file_') && value instanceof File) {
        fileTypes.impairment.push({ key, file: value });
      }
    }

    // Add files to FormData with categorization
    fileTypes.income.forEach((item, index) => {
      laravelFormData.append(`income_files[${index}]`, item.file);
    });

    fileTypes.multiRacial.forEach((item, index) => {
      laravelFormData.append(`multi_racial_files[${index}]`, item.file);
    });

    fileTypes.impairment.forEach((item, index) => {
      laravelFormData.append(`impairment_files[${index}]`, item.file);
    });

    // Add file metadata
    laravelFormData.append('file_metadata', JSON.stringify({
      incomePosition: parsedFormData.incomePosition || 'income_document',
      totalFiles: {
        income: fileTypes.income.length,
        multiRacial: fileTypes.multiRacial.length,
        impairment: fileTypes.impairment.length
      }
    }));

    console.log('📤 Forwarding consumer form to Laravel API with files:', {
      incomeFiles: fileTypes.income.length,
      multiRacialFiles: fileTypes.multiRacial.length,
      impairmentFiles: fileTypes.impairment.length
    });

    // Send data to Laravel API
    const laravelResponse = await submitToLaravel(
      '/consumer-submissions',
      laravelFormData,
      { isMultipart: true }
    );

    // Return Laravel's response to the client
    return NextResponse.json({
      success: true,
      message: laravelResponse.message || 'Consumer form submitted successfully',
      data: laravelResponse.data || laravelResponse,
      source: 'laravel'
    });

  } catch (error) {
    console.error('Consumer Form API Error Details:', {
      message: error.message,
      stack: error.stack,
      validationErrors: error.validationErrors,
      status: error.status,
      responseData: error.responseData
    });

    // Check if it's a Laravel API connection error
    if (error.message.includes('Unable to connect to Laravel API')) {
      return NextResponse.json({
        success: false,
        error: 'Unable to connect to the backend server',
        details: process.env.NODE_ENV === 'development'
          ? 'Laravel API is not reachable. Please ensure the Laravel server is running at ' + (process.env.LARAVEL_API_URL || 'http://localhost:8000')
          : undefined
      }, { status: 503 });
    }

    // Return validation errors if present
    if (error.validationErrors) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: error.message,
        validationErrors: error.validationErrors,
        details: 'Please check the validation errors and correct the form data'
      }, { status: error.status || 422 });
    }

    // Return generic error with more details in development
    return NextResponse.json({
      success: false,
      error: 'An error occurred while submitting the consumer form',
      details: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        responseData: error.responseData
      })
    }, { status: error.status || 500 });
  }
}

/**
 * GET /api/submit-consumer-form
 *
 * Health check endpoint for the consumer form API
 */
export async function GET() {
  try {
    // Test Laravel API connection
    const connectionTest = await testLaravelConnection();

    if (connectionTest.success) {
      return NextResponse.json({
        success: true,
        message: 'Consumer Form API is running and Laravel backend is connected',
        endpoint: '/api/submit-consumer-form',
        laravel: {
          url: process.env.LARAVEL_API_URL || 'http://localhost:8000',
          status: 'connected',
          data: connectionTest.data
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Consumer Form API is running but Laravel backend connection failed',
        endpoint: '/api/submit-consumer-form',
        laravel: {
          url: process.env.LARAVEL_API_URL || 'http://localhost:8000',
          status: 'disconnected',
          error: connectionTest.message
        }
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Consumer Form API error',
      error: error.message
    }, { status: 500 });
  }
}