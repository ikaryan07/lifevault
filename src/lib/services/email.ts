const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    console.warn("[Email] No RESEND_API_KEY set, skipping email send");
    return { success: true, mock: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "HomePin <notifications@HomePin.com.au>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Email send failed: ${error}`);
  }

  return { success: true };
}

export function invitationEmail(inviterName: string, token: string) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`;
  return {
    subject: `${inviterName} has added you as a trusted contact on HomePin`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">HomePin</h1>
          <p style="color: #666; margin-top: 5px;">Secure end-of-life planning</p>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 30px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">You've been trusted</h2>
          <p style="color: #444; line-height: 1.6;">
            <strong>${inviterName}</strong> has added you as a trusted contact on HomePin. 
            This means they trust you to help manage their important documents and information 
            when the time comes.
          </p>
          <p style="color: #444; line-height: 1.6;">
            By accepting, you'll be able to access their vault according to the permissions 
            they've set. This could be immediate access, limited access, or access only after 
            they pass away.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" style="background: #1a5276; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #888; font-size: 13px;">
            If you don't recognise this person or don't want to participate, you can simply ignore this email.
          </p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          HomePin — Helping Australian families plan ahead. HomePin.com.au
        </p>
      </div>
    `,
  };
}

export function checkInReminderEmail(userName: string, daysSinceLogin: number) {
  const checkInUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login`;
  return {
    subject: `HomePin check-in: Are you okay, ${userName}?`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">HomePin</h1>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 30px;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #444; line-height: 1.6;">
            It's been ${daysSinceLogin} days since you last logged into HomePin. 
            Just checking in to make sure everything is okay.
          </p>
          <p style="color: #444; line-height: 1.6;">
            If you don't respond within the next few days, we'll let your trusted contacts 
            know — just as a precaution.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${checkInUrl}" style="background: #1a5276; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              I'm Fine — Check In
            </a>
          </div>
        </div>
      </div>
    `,
  };
}

export function vaultAccessRequestEmail(ownerName: string, requesterName: string) {
  return {
    subject: `Vault access requested for ${ownerName}'s HomePin`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">HomePin</h1>
        </div>
        <div style="background: #fff3cd; border-radius: 12px; padding: 30px; border: 1px solid #ffc107;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Vault Access Request</h2>
          <p style="color: #444; line-height: 1.6;">
            <strong>${requesterName}</strong> has requested access to <strong>${ownerName}'s</strong> vault.
          </p>
          <p style="color: #444; line-height: 1.6;">
            This request needs confirmation from multiple trusted contacts before access is granted. 
            If you believe this request is legitimate, you can confirm it below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background: #1a5276; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Review Request
            </a>
          </div>
          <p style="color: #888; font-size: 13px;">
            The request will expire in 7 days if not confirmed.
          </p>
        </div>
      </div>
    `,
  };
}
