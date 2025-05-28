import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify SMTP connection
transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

interface WelcomeEmailParams {
  to: string;
  firstName: string;
  plan: string;
}

export async function sendWelcomeEmail({ to, firstName, plan }: WelcomeEmailParams) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const subject = 'Welcome to Your Free Trial!';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to Your Free Trial, ${firstName}!</h1>
          <p>Thank you for starting your ${plan} trial. We're excited to have you on board!</p>
          
          <h2>Getting Started</h2>
          <ol>
            <li>Complete your profile setup</li>
            <li>Explore the dashboard</li>
            <li>Set up your first project</li>
            <li>Invite team members</li>
          </ol>

          <h2>Your Trial Details</h2>
          <ul>
            <li>Plan: ${plan}</li>
            <li>Duration: 14 days</li>
            <li>Full access to all features</li>
          </ul>

          <p>Need help getting started? Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs">documentation</a> or contact our support team.</p>

          <p>Best regards,<br>The Team</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      });

      return; // Success, exit the function
    } catch (error) {
      retryCount++;
      console.error(`Failed to send welcome email (attempt ${retryCount}/${maxRetries}):`, error);
      
      if (retryCount === maxRetries) {
        throw new Error(`Failed to send welcome email after ${maxRetries} attempts`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
}

interface AdminNotificationParams {
  type: 'NEW_TRIAL';
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    plan: string;
  };
}

export async function sendAdminNotification({ type, user }: AdminNotificationParams) {
  if (type !== 'NEW_TRIAL') return;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const subject = 'New Trial Signup';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>New Trial Signup</h1>
          
          <h2>User Details</h2>
          <ul>
            <li>Name: ${user.firstName} ${user.lastName}</li>
            <li>Email: ${user.email}</li>
            <li>Company: ${user.company}</li>
            <li>Plan: ${user.plan}</li>
          </ul>

          <p>View user details in the admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin/users/${user.id}</p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL,
        subject,
        html,
      });

      return; // Success, exit the function
    } catch (error) {
      retryCount++;
      console.error(`Failed to send admin notification (attempt ${retryCount}/${maxRetries}):`, error);
      
      if (retryCount === maxRetries) {
        throw new Error(`Failed to send admin notification after ${maxRetries} attempts`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
} 