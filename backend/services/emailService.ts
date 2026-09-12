import nodemailer from 'nodemailer';
import { getEmailConfig } from '../config/emailConfig';
import { ValidatedContactBody } from '../middleware/validation';
import { db } from '../db/database';

export interface StoredContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'delivered' | 'failed' | 'queued' | 'simulated';
  emailSent: boolean;
  provider: string;
  attachments?: any[];
  error?: string;
}

// Persistent contact database bridging to centralized DatabaseManager
class ContactDatabase {
  public insert(msg: StoredContactMessage): StoredContactMessage {
    const record: any = { ...msg };
    db.contacts.set(msg.id, record);
    db.saveDiskAsync();
    return msg;
  }

  public updateStatus(id: string, status: StoredContactMessage['status'], emailSent: boolean, error?: string): void {
    const item: any = db.contacts.get(id);
    if (item) {
      item.status = status;
      item.emailSent = emailSent;
      if (error) item.error = error;
      db.contacts.set(id, item);
      db.saveDiskAsync();
    }
  }

  public getAll(): StoredContactMessage[] {
    return Array.from(db.contacts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as any[];
  }

  public getByEmail(email: string): StoredContactMessage[] {
    return Array.from(db.contacts.values())
      .filter((m) => m.email.toLowerCase() === email.toLowerCase()) as any[];
  }

  public getCount(): number {
    return db.contacts.size;
  }
}

export const contactDb = new ContactDatabase();

// HTML Email Template for Portfolio Inquiries
const createPortfolioEmailHtml = (data: ValidatedContactBody, id: string): string => {
  const formattedDate = new Date(data.timestamp).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'UTC',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry: ${escapeHtml(data.subject)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #4f46e5; padding: 32px 36px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Logo Badge -->
                        <td style="width: 46px; height: 46px; background-color: #ffffff; border-radius: 12px; text-align: center; vertical-align: middle; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; display: block; line-height: 46px;">AJ</span>
                        </td>
                        <td style="padding-left: 14px; vertical-align: middle;">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.4px; display: block; line-height: 1.15;">Anish Jethva</span>
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 700; color: #c7d2fe; letter-spacing: 1.4px; text-transform: uppercase; display: block; margin-top: 3px;">PORTFOLIO OS · CONTACT ENGINE</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 1.8px; color: #38bdf8; text-transform: uppercase;">NEW INQUIRY</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 38px 36px 32px 36px; background-color: #ffffff;">
              <h1 style="margin: 0 0 14px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.5px; line-height: 1.25;">Hi Anish Jethva,</h1>
              <p style="margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #4b5563;">You have received a new contact submission from your <strong>Windows 11 Portfolio OS</strong>. Below are the inquiry details and sender message.</p>

              <!-- Submission Overview -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; width: 100px;">From:</td>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #0f172a;">${escapeHtml(data.name)}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Email:</td>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500;"><a href="mailto:${data.email}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${escapeHtml(data.email)}</a></td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Subject:</td>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #0f172a;">${escapeHtml(data.subject)}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Received:</td>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #475569;">${formattedDate} (UTC)</td>
                      </tr>
                      <tr>
                        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Visitor IP:</td>
                        <td style="font-family: monospace; font-size: 12px; color: #64748b;">${escapeHtml(data.ipAddress)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Section -->
              <h3 style="margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Message Content</h3>
              <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-wrap; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);">${escapeHtml(data.message)}</div>

              <!-- Primary Action CTA -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px auto 0 auto;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 10px; background-color: #4f46e5; text-align: center;">
                          <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" target="_blank" style="display: inline-block; padding: 13px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff !important; text-decoration: none; border-radius: 10px; letter-spacing: -0.2px;">Reply to ${escapeHtml(data.name)}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Footer -->
          <tr>
            <td style="border-top: 1px solid #e5e7eb; background-color: #ffffff; padding: 24px 36px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.5;">
                &copy; 2026 Anish Jethva. All rights reserved. &middot; <a href="https://anishjethva.onrender.com/" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 500;">Portfolio OS</a>
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #9ca3af; line-height: 1.4;">
                Delivered securely via Google OAuth 2.0 &middot; Message ID: <span style="font-family: monospace; color: #6b7280;">${id}</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Confirmation HTML Email for Inquiry Senders
const createSenderConfirmationEmailHtml = (data: ValidatedContactBody, id: string): string => {
  const formattedDate = new Date(data.timestamp).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'UTC',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt: Message delivered to Anish Jethva</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    td {
      padding: 0;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #4f46e5; padding: 32px 36px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Logo Badge -->
                        <td style="width: 46px; height: 46px; background-color: #ffffff; border-radius: 12px; text-align: center; vertical-align: middle; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; display: block; line-height: 46px;">AJ</span>
                        </td>
                        <td style="padding-left: 14px; vertical-align: middle;">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.4px; display: block; line-height: 1.15;">Anish Jethva</span>
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 700; color: #c7d2fe; letter-spacing: 1.4px; text-transform: uppercase; display: block; margin-top: 3px;">PORTFOLIO OS · CONTACT ENGINE</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 1.8px; color: #38bdf8; text-transform: uppercase;">RECEIPT CONFIRMED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 38px 36px 32px 36px; background-color: #ffffff;">
              <h1 style="margin: 0 0 14px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.5px; line-height: 1.25;">Hi ${escapeHtml(data.name)},</h1>
              <p style="margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #4b5563;">Thank you for getting in touch through my <strong>Windows 11 Portfolio OS</strong>. Your inquiry has been received and delivered directly to my personal inbox.</p>

              <!-- Submission Overview -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; width: 100px;">Recipient:</td>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #0f172a;">Anish Jethva</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Email:</td>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500;"><a href="mailto:anish.jethva2006@gmail.com" style="color: #4f46e5; text-decoration: none; font-weight: 600;">anish.jethva2006@gmail.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Subject:</td>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #0f172a;">${escapeHtml(data.subject)}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Sent:</td>
                        <td style="padding-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #475569;">${formattedDate} (UTC)</td>
                      </tr>
                      <tr>
                        <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Status:</td>
                        <td style="font-size: 13px; font-weight: 600; color: #16a34a;">Delivered via Google OAuth 2.0</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Section -->
              <h3 style="margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">Message Content</h3>
              <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-wrap; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); margin-bottom: 24px;">${escapeHtml(data.message)}</div>

              <!-- Primary Action CTA -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 10px; background-color: #4f46e5; text-align: center;">
                          <a href="https://anishjethva.onrender.com/" target="_blank" style="display: inline-block; padding: 13px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff !important; text-decoration: none; border-radius: 10px; letter-spacing: -0.2px;">Explore Portfolio OS</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Follow-up Note -->
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.6; color: #64748b; text-align: center;">I review all inquiries promptly and will get back to you soon. Looking forward to connecting!</p>
            </td>
          </tr>

          <!-- Email Footer -->
          <tr>
            <td style="border-top: 1px solid #e5e7eb; background-color: #ffffff; padding: 24px 36px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.5;">
                &copy; 2026 Anish Jethva. All rights reserved. &middot; <a href="https://anishjethva.onrender.com/" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 500;">Portfolio OS</a>
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #9ca3af; line-height: 1.4;">
                Delivered securely via Google OAuth 2.0 &middot; Message ID: <span style="font-family: monospace; color: #6b7280;">${id}</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface SendContactResult {
  success: boolean;
  messageId: string;
  timestamp: string;
  status: 'delivered' | 'failed' | 'simulated';
  emailSent: boolean;
  provider: string;
  receiver: string;
  note?: string;
  error?: string;
}

export class EmailService {
  /**
   * Exchanges a Google OAuth 2.0 Refresh Token for a short-lived access token
   */
  private async getGoogleAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = (await response.json()) as any;

    if (!response.ok || !data.access_token) {
      const errReason = data.error_description || data.error || 'Failed to exchange Google OAuth 2.0 refresh token';
      throw new Error(`Google OAuth 2.0 Token Exchange Failed: ${errReason}`);
    }

    return data.access_token as string;
  }

  /**
   * Sends an email directly through the Google Gmail REST API (users.messages.send)
   */
  private async sendViaGmailApi(accessToken: string, rawRfc822Email: string): Promise<any> {
    // Gmail API requires base64url-encoded string
    const base64UrlSafe = Buffer.from(rawRfc822Email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64UrlSafe }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      const msg = data.error?.message || 'Failed to dispatch email via Gmail API';
      throw new Error(`Gmail API Delivery Error: ${msg}`);
    }

    return data;
  }

  /**
   * Builds an RFC 2822 MIME email string with multipart/mixed attachment support
   */
  private buildRfc2822Email(options: {
    from: string;
    to: string;
    replyTo?: string;
    subject: string;
    html: string;
    attachments?: Array<{
      name: string;
      content?: string;
      type?: string;
    }>;
  }): string {
    const encodedSubject = `=?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`;
    const lines: string[] = [
      `From: ${options.from}`,
      `To: ${options.to}`,
    ];

    if (options.replyTo) {
      lines.push(`Reply-To: ${options.replyTo}`);
    }

    lines.push(`Subject: ${encodedSubject}`);
    lines.push('MIME-Version: 1.0');

    if (!options.attachments || options.attachments.length === 0) {
      lines.push(
        'Content-Type: text/html; charset=utf-8',
        'Content-Transfer-Encoding: base64',
        '',
        Buffer.from(options.html).toString('base64')
      );
      return lines.join('\r\n');
    }

    // Multipart/mixed for attachments
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push('');

    // HTML Body part
    lines.push(`--${boundary}`);
    lines.push('Content-Type: text/html; charset=utf-8');
    lines.push('Content-Transfer-Encoding: base64');
    lines.push('');
    lines.push(Buffer.from(options.html).toString('base64'));

    // Attachments
    for (const att of options.attachments) {
      if (!att.content) continue;
      const mimeType = att.type || 'application/octet-stream';
      const filename = att.name || 'attachment';
      const encodedFilename = `=?utf-8?B?${Buffer.from(filename).toString('base64')}?=`;

      let base64Content = att.content;
      if (base64Content.includes(';base64,')) {
        base64Content = base64Content.split(';base64,')[1];
      }

      lines.push(`--${boundary}`);
      lines.push(`Content-Type: ${mimeType}; name="${encodedFilename}"`);
      lines.push('Content-Transfer-Encoding: base64');
      lines.push(`Content-Disposition: attachment; filename="${encodedFilename}"`);
      lines.push('');
      lines.push(base64Content);
    }

    lines.push(`--${boundary}--`);
    lines.push('');

    return lines.join('\r\n');
  }

  /**
   * Main email dispatch handler with Google OAuth 2.0 as primary transport
   */
  public async handleContactSubmission(data: ValidatedContactBody): Promise<SendContactResult> {
    const config = getEmailConfig();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Initial record into Database
    const initialRecord: StoredContactMessage = {
      id: messageId,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      attachments: data.attachments,
      timestamp: data.timestamp,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: 'queued',
      emailSent: false,
      provider: config.provider,
    };
    contactDb.insert(initialRecord);

    const emailHtml = createPortfolioEmailHtml(data, messageId);
    const receiptHtml = createSenderConfirmationEmailHtml(data, messageId);

    // 2. Dev/Mock Simulation Provider (when neither Google OAuth nor SMTP is configured)
    if (config.provider === 'dev_mock') {
      console.log('====================================================');
      console.log('📧 [PORTFOLIO OS CONTACT MESSAGE RECORDED (DEV MODE)]');
      console.log(`ID: ${messageId}`);
      console.log(`To: ${config.receiverEmail}`);
      console.log(`From: "${data.name}" <${data.email}>`);
      console.log(`Subject: ${data.subject}`);
      console.log('====================================================');

      contactDb.updateStatus(messageId, 'simulated', false);
      return {
        success: true,
        messageId,
        timestamp: data.timestamp,
        status: 'simulated',
        emailSent: false,
        provider: 'Dev/Mock Store',
        receiver: config.receiverEmail,
        note: `Message stored in portfolio database for ${config.receiverEmail}. Set Google OAuth 2.0 credentials to dispatch live emails.`,
      };
    }

    // 3. Primary Method: Google OAuth 2.0 (Gmail API)
    if (config.provider === 'google_oauth' && config.googleOAuth) {
      try {
        console.log(`[EmailService] Acquiring Google OAuth 2.0 access token for ${config.googleOAuth.email}...`);
        const accessToken = await this.getGoogleAccessToken(
          config.googleOAuth.clientId,
          config.googleOAuth.clientSecret,
          config.googleOAuth.refreshToken
        );

        // Build RFC 2822 payload for the portfolio owner notification
        const ownerEmailRfc = this.buildRfc2822Email({
          from: `Portfolio Contact <${config.googleOAuth.email}>`,
          to: config.receiverEmail,
          replyTo: `"${data.name}" <${data.email}>`,
          subject: `[Portfolio Contact] ${data.subject} - from ${data.name}`,
          html: emailHtml,
          attachments: data.attachments,
        });

        console.log('[EmailService] Dispatching owner notification via Google OAuth 2.0 (Gmail API)...');
        await this.sendViaGmailApi(accessToken, ownerEmailRfc);

        // Send confirmation receipt to the visitor via Google OAuth 2.0
        try {
          const receiptEmailRfc = this.buildRfc2822Email({
            from: `Anish Jethva <${config.googleOAuth.email}>`,
            to: `"${data.name}" <${data.email}>`,
            subject: `Receipt: Message delivered to Anish Jethva ("${data.subject}")`,
            html: receiptHtml,
          });

          await this.sendViaGmailApi(accessToken, receiptEmailRfc);
          console.log(`[EmailService] Confirmation receipt dispatched to sender (${data.email}) via Google OAuth 2.0.`);
        } catch (receiptErr: any) {
          console.warn('[EmailService] Confirmation receipt skipped:', receiptErr.message);
        }

        contactDb.updateStatus(messageId, 'delivered', true);
        return {
          success: true,
          messageId,
          timestamp: data.timestamp,
          status: 'delivered',
          emailSent: true,
          provider: 'Google OAuth 2.0 (Gmail API)',
          receiver: config.receiverEmail,
          note: `Live email delivered directly to ${config.receiverEmail} via Google OAuth 2.0 (Gmail API).`,
        };
      } catch (oauthErr: any) {
        console.error('[EmailService] Google OAuth 2.0 delivery failed:', oauthErr.message);

        // Fallback to SMTP if SMTP credentials exist
        if (config.smtp) {
          console.log('[EmailService] Attempting fallback to SMTP transport...');
          return this.sendViaSmtp(config, data, emailHtml, receiptHtml, messageId);
        }

        contactDb.updateStatus(messageId, 'failed', false, oauthErr.message);
        return {
          success: true,
          messageId,
          timestamp: data.timestamp,
          status: 'failed',
          emailSent: false,
          provider: 'Google OAuth 2.0',
          receiver: config.receiverEmail,
          error: oauthErr.message,
          note: `Message saved to portfolio database, but Google OAuth 2.0 delivery failed: ${oauthErr.message}`,
        };
      }
    }

    // 4. Secondary Fallback: SMTP Dispatch
    if (config.smtp) {
      return this.sendViaSmtp(config, data, emailHtml, receiptHtml, messageId);
    }

    // Catch-all
    contactDb.updateStatus(messageId, 'simulated', false);
    return {
      success: true,
      messageId,
      timestamp: data.timestamp,
      status: 'simulated',
      emailSent: false,
      provider: 'Dev/Mock Store',
      receiver: config.receiverEmail,
      note: 'Message stored in database.',
    };
  }

  /**
   * Helper for SMTP delivery with dual-port fallback (465 SSL and 587 STARTTLS)
   */
  private async sendViaSmtp(
    config: any,
    data: ValidatedContactBody,
    emailHtml: string,
    receiptHtml: string,
    messageId: string
  ): Promise<SendContactResult> {
    const primaryPort = config.smtp.port;
    const isPrimary465 = primaryPort === 465 || config.smtp.secure;
    const secondaryPort = isPrimary465 ? 587 : 465;
    const secondarySecure = secondaryPort === 465;

    const trySendOnPort = async (port: number, secure: boolean) => {
      const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port,
        secure,
        auth: config.smtp.auth,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail({
        from: config.fromEmail,
        to: config.receiverEmail,
        replyTo: `"${data.name}" <${data.email}>`,
        subject: `[Portfolio Contact] ${data.subject} - from ${data.name}`,
        html: emailHtml,
      });

      transporter
        .sendMail({
          from: config.fromEmail,
          to: data.email,
          subject: `Receipt: Message delivered to Anish Jethva ("${data.subject}")`,
          html: receiptHtml,
        })
        .catch((e) => console.warn('[EmailService] SMTP Confirmation receipt skipped:', e.message));
    };

    try {
      await trySendOnPort(primaryPort, config.smtp.secure);
      contactDb.updateStatus(messageId, 'delivered', true);
      return {
        success: true,
        messageId,
        timestamp: data.timestamp,
        status: 'delivered',
        emailSent: true,
        provider: 'Gmail SMTP',
        receiver: config.receiverEmail,
        note: `Live email delivered via SMTP (${config.smtp.host}:${primaryPort}) to ${config.receiverEmail}`,
      };
    } catch (primaryErr: any) {
      console.warn(`[EmailService] SMTP send on port ${primaryPort} failed: ${primaryErr.message}. Trying port ${secondaryPort}...`);

      try {
        await trySendOnPort(secondaryPort, secondarySecure);
        contactDb.updateStatus(messageId, 'delivered', true);
        return {
          success: true,
          messageId,
          timestamp: data.timestamp,
          status: 'delivered',
          emailSent: true,
          provider: 'Gmail SMTP',
          receiver: config.receiverEmail,
          note: `Live email delivered via fallback SMTP (${config.smtp.host}:${secondaryPort}) to ${config.receiverEmail}`,
        };
      } catch (secondaryErr: any) {
        console.error('[EmailService] SMTP secondary port failed:', secondaryErr.message);

        let errorExplanation = secondaryErr.message;
        if (
          primaryErr.message.includes('timeout') ||
          secondaryErr.message.includes('timeout') ||
          primaryErr.code === 'ETIMEDOUT' ||
          secondaryErr.code === 'ETIMEDOUT'
        ) {
          errorExplanation =
            'Connection timeout. Cloud hosts (like Render) block outbound SMTP ports (465/587). Please configure Google OAuth 2.0 (GOOGLE_REFRESH_TOKEN starting with 1//0...) in Render environment variables for HTTPS (Port 443) mail delivery.';
        }

        contactDb.updateStatus(messageId, 'failed', false, errorExplanation);
        return {
          success: true,
          messageId,
          timestamp: data.timestamp,
          status: 'failed',
          emailSent: false,
          provider: 'SMTP',
          receiver: config.receiverEmail,
          error: errorExplanation,
          note: `Message saved in portfolio database. ${errorExplanation}`,
        };
      }
    }
  }
}

export const emailService = new EmailService();
