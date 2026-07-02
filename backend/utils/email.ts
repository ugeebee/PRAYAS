import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
    try {
        let transporter;

        // In Production, set these environment variables in your .env file
        // e.g., GMAIL_USER="prayas.nhpc@gmail.com" and GMAIL_APP_PASSWORD="your-app-password"
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });
        } else {
            // Fallback for Development: Generate test SMTP service account from ethereal.email
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, 
                auth: {
                    user: testAccount.user, 
                    pass: testAccount.pass, 
                },
            });
        }

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER ? `"Prayas Team" <${process.env.GMAIL_USER}>` : '"Prayas Team" <no-reply@prayas.nhpc.com>', // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
