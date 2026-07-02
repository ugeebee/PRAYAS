

/**
 * Sends an SMS using the capcom6/android-sms-gateway API.
 * Uses environment variables for configuration:
 * - SMS_GATEWAY_URL: e.g., "http://192.168.1.100:8080"
 * - SMS_GATEWAY_LOGIN
 * - SMS_GATEWAY_PASSWORD
 */
export async function sendSms(phoneNumber: string, message: string) {
    const url = process.env.SMS_GATEWAY_URL;
    const login = process.env.SMS_GATEWAY_LOGIN;
    const password = process.env.SMS_GATEWAY_PASSWORD;

    if (!url) {
        console.warn("SMS_GATEWAY_URL is not set. SMS will not be sent.");
        return false;
    }

    try {
        const formattedPhone = phoneNumber.length === 10 ? `+91${phoneNumber}` : phoneNumber;
        const auth = Buffer.from(`${login}:${password}`).toString('base64');
        const res = await fetch(`${url}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify({
                phoneNumbers: [formattedPhone],
                message: message
            })
        });

        if (res.ok) {
            console.log(`✅ SMS successfully sent to ${phoneNumber}`);
            return true;
        } else {
            const err = await res.text();
            console.error(`❌ Failed to send SMS to ${phoneNumber}:`, err);
            return false;
        }
    } catch (error) {
        console.error("SMS Gateway Error:", error);
        return false;
    }
}
