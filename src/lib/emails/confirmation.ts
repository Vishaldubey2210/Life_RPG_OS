/**
 * Ultra-Premium Signup Confirmation Email Template for Life RPG OS
 * Compatible with Gmail, Apple Mail, Outlook, and mobile clients.
 */

export interface ConfirmationEmailParams {
  name?: string
  confirmationUrl?: string
}

export const confirmationEmail = ({
  name = 'Adventurer',
  confirmationUrl = '{{ .ConfirmationURL }}',
}: ConfirmationEmailParams = {}): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Activate Your Life RPG OS Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2B2823;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F6F4EE; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #E6E2D8; box-shadow: 0 12px 40px rgba(43, 40, 35, 0.07); overflow: hidden;">
          
          <!-- Header with RPG Emblem -->
          <tr>
            <td style="padding: 40px 40px 24px 40px; text-align: center; background: linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%); border-bottom: 1px solid #EFECE6;">
              <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width: 52px; height: 52px; background: linear-gradient(135deg, #5B57F0 0%, #4338CA 100%); border-radius: 16px; text-align: center; vertical-align: middle; color: #FFFFFF; font-size: 24px; box-shadow: 0 8px 20px rgba(91, 87, 240, 0.35);">
                    ⚔️
                  </td>
                </tr>
              </table>
              <h1 style="margin: 16px 0 4px 0; font-size: 24px; font-weight: 800; color: #2B2823; letter-spacing: -0.03em;">
                Life RPG OS
              </h1>
              <p style="margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #8A857A;">
                Level Up Your Reality
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 40px 32px 40px;">
              <!-- Badge -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 18px;">
                <tr>
                  <td style="background-color: #EDECFD; border-radius: 999px; padding: 5px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #5B57F0;">
                    ⚔️ Quest #1 &bull; Account Verification
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 12px 0; font-size: 21px; font-weight: 700; color: #2B2823; line-height: 1.35; letter-spacing: -0.02em;">
                Welcome, ${name}! Activate your character sheet.
              </h2>
              
              <p style="margin: 0 0 22px 0; font-size: 15px; line-height: 1.65; color: #5C574E;">
                Your journey in <strong style="color: #2B2823;">Life RPG OS</strong> begins now. Verify your email address to unlock your Level 1 character sheet, start tracking daily habits, and earn XP for your real-life achievements.
              </p>

              <!-- Quest Objective Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 22px 0; background-color: #FAF8F5; border: 1px solid #E6E2D8; border-left: 4px solid #5B57F0; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #5B57F0;">
                      🎯 Active Objective:
                    </p>
                    <p style="margin: 0; font-size: 13.5px; font-weight: 600; line-height: 1.45; color: #2B2823;">
                      Verify Email Address &amp; Claim +50 Starter XP
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Big Primary CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 26px 0;">
                <tr>
                  <td align="center">
                    <a href="${confirmationUrl}" target="_blank" style="display: inline-block; padding: 16px 44px; background: linear-gradient(135deg, #5B57F0 0%, #4F46E5 100%); color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 999px; box-shadow: 0 8px 24px rgba(91, 87, 240, 0.35); text-align: center; letter-spacing: -0.01em;">
                      Verify &amp; Activate Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 13px; color: #8A857A; text-align: center; line-height: 1.5;">
                This activation link is valid for 24 hours. If you did not create this account, you can safely disregard this email.
              </p>

              <!-- Fallback Direct Link -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #EFECE6;">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #8A857A;">
                      Button not working? Copy and paste this URL into your browser:
                    </p>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; word-break: break-all;">
                      <a href="${confirmationUrl}" style="color: #5B57F0; text-decoration: underline;">
                        ${confirmationUrl}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 26px 40px; background-color: #FAF8F5; border-top: 1px solid #EFECE6; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #2B2823;">
                ⚔️ Life RPG OS
              </p>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #8A857A;">
                Gamify your habits, conquer your goals, level up in real life.
              </p>
              <p style="margin: 0; font-size: 11px; color: #A8A399;">
                &copy; Life RPG OS. All rights reserved. &bull; Adventure Awaits
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
