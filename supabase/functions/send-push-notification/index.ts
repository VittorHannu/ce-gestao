import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Interface for the webhook payload for type safety
interface NotificationRecord {
  id: number;
  user_id: string;
  title: string;
  message: string;
  link?: string;
}

interface WebhookPayload {
  type: 'INSERT';
  table: 'notifications';
  record: NotificationRecord;
}

console.log("Edge Function 'send-push-notification' is up and running!");

serve(async (req) => {
  // 1. Verify the request is a POST request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Parse the webhook payload
    const payload: WebhookPayload = await req.json();
    const { record } = payload;

    console.log(`Processing notification for user: ${record.user_id}`);

    // 3. Get OneSignal secrets from environment variables
    const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
    const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      throw new Error('OneSignal secrets are not set in environment variables.');
    }

    // 4. Construct the notification body for the OneSignal API
    // This uses the Supabase user_id as the external_user_id in OneSignal.
    // Your app must set this ID using the OneSignal SDK.
    const notificationBody = {
      app_id: ONESIGNAL_APP_ID,
      include_external_user_ids: [record.user_id],
      headings: { en: record.title, pt: record.title },
      contents: { en: record.message, pt: record.message },
      channel_for_external_user_ids: 'push',
      // Optionally, use the 'link' from our table for deep-linking
      // The 'data' field can be used to send custom data to the app
      data: { app_url: record.link }, 
    };

    console.log('Sending notification to OneSignal...');

    // 5. Send the request to the OneSignal API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationBody),
    });

    const responseData = await response.json();

    if (response.status !== 200) {
      console.error('Error sending notification to OneSignal:', responseData);
      throw new Error(`OneSignal API responded with status ${response.status}`);
    }

    console.log('Successfully sent notification to OneSignal:', responseData);

    // 6. Return a success response
    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Edge Function:', error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});