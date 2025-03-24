import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendAdminNotification(userData: {
  email: string;
  username: string;
  name: string;
  createdAt: Date;
  // Add any other relevant user data
}) {
  const adminEmail = 'karemnajjartunisian@gmail.com';

  const emailContent = `
    New User Registration:
    
    Name: ${userData.name}
    Username: ${userData.username}
    Email: ${userData.email}
    Registration Date: ${userData.createdAt}
    
    Platform: Mixy
    Environment: ${process.env.NODE_ENV}
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: adminEmail,
    subject: 'New User Registration on Mixy',
    text: emailContent,
  });
} 