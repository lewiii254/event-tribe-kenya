import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log('M-Pesa Callback received:', JSON.stringify(payload, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const resultCode = payload.Body?.stkCallback?.ResultCode;
    const bookingId = payload.Body?.stkCallback?.CallbackMetadata?.Item?.find(
      (item: { Name: string; Value: string }) => item.Name === 'AccountReference'
    )?.Value;

    if (resultCode === 0 && bookingId) {
      // Payment successful - generate QR code
      const qrCodeData = `EVENTTRIBE-${bookingId}-${Date.now()}`;
      
      await supabase
        .from('bookings')
        .update({ 
          payment_status: 'completed',
          qr_code: qrCodeData
        })
        .eq('id', bookingId);

      console.log('Payment completed for booking:', bookingId);
    } else {
      // Payment failed
      if (bookingId) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'failed' })
          .eq('id', bookingId);
      }
      console.log('Payment failed:', payload.Body?.stkCallback?.ResultDesc);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
