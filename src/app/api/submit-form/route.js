// app/api/submit-form/route.js
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
 * POST /api/submit-form
 *
 * Handles form submissions for education, government, health, merchant, and financial institution forms
 * Forwards the data to Laravel API for processing
 *
 * Expected request body:
 * {
 *   formType: 'education' | 'government' | 'health' | 'merchant' | 'financial_institution',
 *   formData: { ... form fields ... },
 *   recaptchaScore: number,
 *   guid: string
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { formType, formData, recaptchaScore, guid } = body;

    console.log('Form submission received:', { formType, guid, recaptchaScore });
    console.log('Form data keys:', Object.keys(formData));
    console.log('agreementSignatureId in formData:', formData.agreementSignatureId);

    // Validate required fields
    if (!formType || !formData || typeof recaptchaScore !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Prepare data to send to Laravel
    // Laravel expects flat structure with snake_case field names
    const convertedFormData = toSnakeCase(formData);

    // Fix field names that don't convert correctly with simple snake_case conversion
    // Handle cases where there are no capital letters to trigger the conversion
    const fieldMappings = {
      'noof_employees': 'no_of_employees',  // noofEmployees -> no_of_employees
      'estimated_number_of_p_o_s_terminals': 'estimated_number_of_pos_terminals',  // estimatedNumberOfPOSTerminals
      'p_o_s_manufacturer': 'pos_manufacturer',  // POSManufacturer
      'p_o_s_hardware_software': 'pos_hardware_software',  // POSHardwareSoftware
      'p_o_s_version_number': 'pos_version_number',  // POSVersionNumber
      'vendor_p_c_i_compliant': 'vendor_pci_compliant',  // vendorPCICompliant -> vendor_pci_compliant
    };

    Object.keys(fieldMappings).forEach(oldKey => {
      if (convertedFormData[oldKey] !== undefined) {
        convertedFormData[fieldMappings[oldKey]] = convertedFormData[oldKey];
        delete convertedFormData[oldKey];
      }
    });

    // Remove fields that should not be sent to Laravel merchant submissions
    // These fields are handled separately (e.g., stored in agreement_signatures table)
    // NOTE: agreement_signature_id is now kept so Laravel can link the records
    const fieldsToRemove = [
      'biometric_consent_data',
      'verified_social_security_number'
    ];

    fieldsToRemove.forEach(field => {
      delete convertedFormData[field];
    });

    console.log('agreement_signature_id after conversion:', convertedFormData.agreement_signature_id);

    const laravelPayload = {
      ...convertedFormData, // Spread form fields at root level
      guid,
      recaptcha_score: recaptchaScore,
      recaptcha_action: formType.toLowerCase(),
      // ip_address and user_agent will be added by Laravel controller
    };

    console.log('Laravel payload agreement_signature_id:', laravelPayload.agreement_signature_id);

    // Map form types to Laravel API endpoints
    const endpointMap = {
      'education': '/education-submissions',
      'government': '/government-submissions',
      'health': '/health-submissions',
      'healthcare': '/health-submissions', // Alias
      'merchant': '/merchant-submissions',
      'financial_institution': '/financial-institution-submissions',
      'financial-institution': '/financial-institution-submissions' // Alias
    };

    const endpoint = endpointMap[formType.toLowerCase()];

    if (!endpoint) {
      return NextResponse.json({
        success: false,
        error: `Invalid form type: ${formType}`,
        validTypes: Object.keys(endpointMap)
      }, { status: 400 });
    }

    // Send data to Laravel API
    console.log(`📤 Forwarding ${formType} form to Laravel API endpoint: ${endpoint}`);

    const laravelResponse = await submitToLaravel(endpoint, laravelPayload);

    // Return Laravel's response to the client
    return NextResponse.json({
      success: true,
      message: laravelResponse.message || 'Form submitted successfully',
      data: laravelResponse.data || laravelResponse,
      source: 'laravel'
    });

  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      stack: error.stack
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

    // Return generic error
    return NextResponse.json({
      success: false,
      error: 'An error occurred while submitting the form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * GET /api/submit-form
 *
 * Health check endpoint - tests Laravel API connection
 */
export async function GET() {
  try {
    // Test Laravel API connection
    const connectionTest = await testLaravelConnection();

    if (connectionTest.success) {
      return NextResponse.json({
        success: true,
        message: 'API is running and Laravel backend is connected',
        laravel: {
          url: process.env.LARAVEL_API_URL || 'http://localhost:8000',
          status: 'connected',
          data: connectionTest.data
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'API is running but Laravel backend connection failed',
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
      message: 'API error',
      error: error.message
    }, { status: 500 });
  }
}
