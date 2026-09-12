export interface EmailConfig {
  provider: 'google_oauth' | 'gmail_smtp' | 'smtp' | 'dev_mock';
  receiverEmail: string;
  fromEmail: string;
  googleOAuth?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    email: string;
  };
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  diagnosticDetails?: {
    hasGoogleOAuth: boolean;
    googleEmail?: string;
    hasGoogleClientId?: boolean;
    hasGoogleClientSecret?: boolean;
    hasGoogleRefreshToken?: boolean;
    googleRefreshTokenIsUrl?: boolean;
    googleOAuthIssue?: string;
    hasSmtpConfig: boolean;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    hasSmtpPass?: boolean;
    isSecure?: boolean;
    isGmail: boolean;
    detectedProvider: string;
    reason: string;
  };
}

const cleanEnv = (val?: string): string => {
  if (!val) return '';
  let cleaned = val.trim();
  // Remove wrapping quotes or backticks
  cleaned = cleaned.replace(/^["'`]|["'`]$/g, '').trim();
  // If user pasted in KEY=VALUE format into the environment variable field
  if (cleaned.includes('=') && /^[A-Z_a-z]+=/i.test(cleaned)) {
    cleaned = cleaned.split('=').slice(1).join('=').trim();
    cleaned = cleaned.replace(/^["'`]|["'`]$/g, '').trim();
  }
  return cleaned;
};

export const getEmailConfig = (): EmailConfig => {
  const receiverEmail =
    cleanEnv(process.env.CONTACT_RECEIVER_EMAIL) ||
    cleanEnv(process.env.RECEIVER_EMAIL) ||
    'anish.jethva2006@gmail.com';

  const customFrom = cleanEnv(process.env.EMAIL_FROM) || cleanEnv(process.env.SMTP_FROM);

  const googleClientId = cleanEnv(process.env.GOOGLE_CLIENT_ID);
  const googleClientSecret = cleanEnv(process.env.GOOGLE_CLIENT_SECRET);
  const googleRefreshToken = cleanEnv(process.env.GOOGLE_REFRESH_TOKEN);
  const googleEmail = cleanEnv(process.env.GOOGLE_EMAIL) || receiverEmail;

  // Check if refresh token was mistakenly entered as an OAuth Playground URL
  const refreshTokenIsUrl =
    googleRefreshToken.startsWith('http://') ||
    googleRefreshToken.startsWith('https://') ||
    googleRefreshToken.includes('playground') ||
    googleRefreshToken.includes('google.com');

  let googleIssue = '';
  if (googleRefreshToken && refreshTokenIsUrl) {
    googleIssue =
      'GOOGLE_REFRESH_TOKEN is set to a URL ("' +
      googleRefreshToken.slice(0, 32) +
      '...") instead of an OAuth Refresh Token string. A Google refresh token begins with "1//0...".';
  } else if (googleRefreshToken && !googleRefreshToken.startsWith('1//0') && !googleRefreshToken.startsWith('1/')) {
    googleIssue = 'GOOGLE_REFRESH_TOKEN may be invalid (valid Google OAuth 2.0 refresh tokens begin with "1//0...").';
  }

  const hasFullGoogleOAuth = Boolean(
    googleClientId && googleClientSecret && googleRefreshToken && !refreshTokenIsUrl
  );

  const rawHost = cleanEnv(process.env.SMTP_HOST);
  const smtpUser = cleanEnv(process.env.SMTP_USER);
  const smtpPass = cleanEnv(process.env.SMTP_PASS);
  const rawPort = cleanEnv(process.env.SMTP_PORT);

  // Default to smtp.gmail.com if host is not specified but credentials exist
  const smtpHost = rawHost || (smtpUser ? 'smtp.gmail.com' : '');
  const isGmail = smtpHost.includes('gmail');
  const port = rawPort ? parseInt(rawPort, 10) : isGmail ? 465 : 587;
  const isSecure = cleanEnv(process.env.SMTP_SECURE) === 'true' || port === 465;

  const hasSmtp = Boolean(smtpHost && smtpUser && smtpPass);
  const smtpConfigObj = hasSmtp
    ? {
        host: smtpHost,
        port,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }
    : undefined;

  // 1. Primary Dispatch Transport: Google OAuth 2.0 (Gmail API)
  if (hasFullGoogleOAuth) {
    const from = customFrom || `Portfolio Contact <${googleEmail}>`;
    return {
      provider: 'google_oauth',
      receiverEmail,
      fromEmail: from,
      googleOAuth: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        refreshToken: googleRefreshToken,
        email: googleEmail,
      },
      smtp: smtpConfigObj,
      diagnosticDetails: {
        hasGoogleOAuth: true,
        googleEmail,
        hasGoogleClientId: true,
        hasGoogleClientSecret: true,
        hasGoogleRefreshToken: true,
        googleRefreshTokenIsUrl: false,
        googleOAuthIssue: googleIssue || undefined,
        hasSmtpConfig: hasSmtp,
        smtpHost: smtpHost || 'smtp.gmail.com',
        smtpPort: port,
        smtpUser: smtpUser || undefined,
        hasSmtpPass: Boolean(smtpPass),
        isSecure,
        isGmail,
        detectedProvider: 'Google OAuth 2.0 (Gmail API)',
        reason: `Google OAuth 2.0 is active for ${googleEmail}. Messages are dispatched via Google OAuth 2.0 directly through the Gmail API.`,
      },
    };
  }

  // 2. Secondary Fallback: Gmail SMTP (App Password)
  if (hasSmtp) {
    const from = customFrom || `Portfolio Contact <${smtpUser}>`;
    const providerName = isGmail ? 'Gmail SMTP (App Password)' : `SMTP (${smtpHost}:${port})`;

    return {
      provider: isGmail ? 'gmail_smtp' : 'smtp',
      receiverEmail,
      fromEmail: from,
      smtp: smtpConfigObj,
      diagnosticDetails: {
        hasGoogleOAuth: false,
        googleEmail,
        hasGoogleClientId: Boolean(googleClientId),
        hasGoogleClientSecret: Boolean(googleClientSecret),
        hasGoogleRefreshToken: Boolean(googleRefreshToken),
        googleRefreshTokenIsUrl: refreshTokenIsUrl,
        googleOAuthIssue:
          googleIssue ||
          (googleRefreshToken
            ? undefined
            : 'Google OAuth incomplete. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN (1//0...).'),
        hasSmtpConfig: true,
        smtpHost,
        smtpPort: port,
        smtpUser,
        hasSmtpPass: true,
        isSecure,
        isGmail,
        detectedProvider: providerName,
        reason: isGmail
          ? `Gmail SMTP is active for ${smtpUser} as a fallback.`
          : `Custom SMTP is active via ${smtpHost}:${port} for ${smtpUser}.`,
      },
    };
  }

  // 3. Dev / Mock fallback transport when credentials are not yet configured
  return {
    provider: 'dev_mock',
    receiverEmail,
    fromEmail: customFrom || `Portfolio Contact <${receiverEmail}>`,
    diagnosticDetails: {
      hasGoogleOAuth: false,
      googleEmail,
      hasGoogleClientId: Boolean(googleClientId),
      hasGoogleClientSecret: Boolean(googleClientSecret),
      hasGoogleRefreshToken: Boolean(googleRefreshToken),
      googleRefreshTokenIsUrl: refreshTokenIsUrl,
      googleOAuthIssue:
        googleIssue ||
        'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are required for Google OAuth 2.0 mail delivery.',
      hasSmtpConfig: false,
      smtpHost: smtpHost || 'smtp.gmail.com',
      smtpPort: port,
      smtpUser: smtpUser || undefined,
      hasSmtpPass: Boolean(smtpPass),
      isSecure,
      isGmail,
      detectedProvider: 'Dev/Mock Store',
      reason:
        'Google OAuth 2.0 credentials not yet set. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN (1//0...) to enable live Google OAuth 2.0 email dispatch.',
    },
  };
};
