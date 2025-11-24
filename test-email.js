
async function sendEmail() {
    const url = 'https://api.emailjs.com/api/v1.0/email/send';
    const data = {
        service_id: 'service_k09aipq',
        template_id: 'template_hria60l',
        user_id: 'SGkjyZ1R5BvytZwyM',
        template_params: {
            to_email: 'giftology.in01@gmail.com',
            to_name: 'Test User',
            otp: '123456',
            message: 'Test OTP from Antigravity Node Script'
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

sendEmail();
