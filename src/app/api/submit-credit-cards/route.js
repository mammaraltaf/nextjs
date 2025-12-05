// app/api/submit-credit-cards/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

/**
 * POST /api/submit-credit-cards
 *
 * Submits credit cards to external George Backend API
 * Loops through all cards and sends individual POST requests
 *
 * Expected request body:
 * {
 *   guid: string,
 *   cards: Array<{
 *     card_number: string,
 *     nick_name: string,
 *     primary_card_holder_first_name: string,
 *     primary_card_holder_last_name: string
 *   }>
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { guid, cards } = body;

    console.log('Credit card submission received:', { guid, cardCount: cards?.length });

    // Validate required fields
    if (!guid || !cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: guid and cards array required'
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Loop through all cards and send individual POST requests
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardNumber = card.card_number?.replace(/-/g, ''); // Remove dashes from card number

      if (!cardNumber) {
        errors.push({
          index: i,
          card: card,
          error: 'Card number is required'
        });
        continue;
      }

      try {
        // Format: POST https://george-backend.quantilence.com/api/customer/{guid}/credit-card/{card_number}
        const url = `https://george-backend.quantilence.com/api/customer/${guid}/credit-card/${cardNumber}`;

        console.log(`Submitting card ${i + 1}/${cards.length} to:`, url);

        // Send card data to external API
        const response = await axios.post(url, {
          card_number: cardNumber,
          nick_name: card.nick_name || '',
          primary_card_holder_first_name: card.primary_card_holder_first_name || '',
          primary_card_holder_last_name: card.primary_card_holder_last_name || '',
          submitted_at: new Date().toISOString()
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });

        results.push({
          index: i,
          cardNumber: cardNumber,
          success: true,
          response: response.data
        });

        console.log(`Card ${i + 1} submitted successfully:`, response.data);

      } catch (error) {
        console.error(`Error submitting card ${i + 1}:`, error.message);

        errors.push({
          index: i,
          cardNumber: cardNumber,
          error: error.response?.data?.message || error.message || 'Unknown error'
        });
      }
    }

    // Determine overall success
    const allSuccess = errors.length === 0;
    const partialSuccess = results.length > 0 && errors.length > 0;

    return NextResponse.json({
      success: allSuccess,
      partialSuccess: partialSuccess,
      message: allSuccess
        ? 'All credit cards submitted successfully'
        : partialSuccess
          ? `${results.length} card(s) submitted, ${errors.length} failed`
          : 'All credit card submissions failed',
      results: results,
      errors: errors,
      summary: {
        total: cards.length,
        successful: results.length,
        failed: errors.length
      }
    }, allSuccess ? 200 : partialSuccess ? 207 : 500);

  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: 'An error occurred while submitting credit cards',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * GET /api/submit-credit-cards
 *
 * Health check endpoint
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Credit card submission API is running',
      endpoint: 'https://george-backend.quantilence.com/api/customer/{guid}/credit-card/{card_number}'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'API error',
      error: error.message
    }, { status: 500 });
  }
}
