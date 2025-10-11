import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, phoneNumber } = await req.json();

    if (!bookingId || !phoneNumber) {
      throw new Error('Missing bookingId or phoneNumber');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get booking and event details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, events(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    const event = booking.events;
    const amount = Math.ceil(event.price);

    // Get M-Pesa access token
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')!;
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')!;
    const auth = btoa(`${consumerKey}:${consumerSecret}`);

    const tokenResponse = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Prepare STK Push request
    const businessShortCode = Deno.env.get('MPESA_BUSINESS_SHORTCODE')!;
    const passkey = Deno.env.get('MPESA_PASSKEY')!;
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = btoa(`${businessShortCode}${passkey}${timestamp}`);

    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-callback`;
    const formattedPhone = phoneNumber.replace(/^0/, '254').replace(/\+/, '');

    const stkPushPayload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: bookingId,
      TransactionDesc: `Payment for ${event.title}`,
    };

    console.log('Initiating STK Push:', { amount, phone: formattedPhone, bookingId });

    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushPayload),
      }
    );

    const stkData = await stkResponse.json();
    console.log('STK Push Response:', stkData);

    if (stkData.ResponseCode === '0') {
      // Update booking with phone number
      await supabase
        .from('bookings')
        .update({ payment_phone: formattedPhone })
        .eq('id', bookingId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment request sent. Please check your phone.',
          checkoutRequestId: stkData.CheckoutRequestID,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(stkData.ResponseDescription || 'Payment initiation failed');
    }
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment failed';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
