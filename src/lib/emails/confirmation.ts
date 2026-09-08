/**
 * Premium Responsive Email Confirmation Template for Life RPG OS
 * Compatible with Gmail, Apple Mail, Outlook, and mobile clients.
 */

export const confirmationEmail = ({
  name = 'Adventurer',
  confirmationUrl = '{{ .ConfirmationURL }}',
}: {
  name?: string
  confirmationUrl?: string
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activate Your Life RPG OS Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2B2823;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F6F4EE; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E6E2D8; box-shadow: 0 8px 30px rgba(43, 40, 35, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; background-color: #FAF8F5; border-bottom: 1px solid #EFECE6;">
              <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width: 44px; height: 44px; background: #5B57F0; border-radius: 12px; text-align: center; vertical-align: middle; color: #FFFFFF; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(91, 87, 240, 0.3);">
                    ⚔️
                  </td>
                </tr>
              </table>
              <h1 style="margin: 14px 0 4px 0; font-size: 22px; font-weight: 800; color: #2B2823; letter-spacing: -0.02em;">
                Life RPG OS
              </h1>
              <p style="margin: 0; font-size: 13px; color: #787368; font-weight: 500;">
                Turn your daily habits into an epic adventure
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="margin: 0 0 14px 0; font-size: 20px; font-weight: 700; color: #2B2823; line-height: 1.3;">
                Welcome, ${name}! Activate your hero account.
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #5C574E;">
                Your character sheet is ready to be initialized. Please confirm your email address to enter the realm and start tracking quests, earning XP, and building your real-life stats.
              </p>

              <!-- Quest Objective Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #EDECFD; border: 1px solid #D6D3FA; border-left: 4px solid #5B57F0; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #5B57F0;">
                      Active Objective:
                    </p>
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #2B2823; line-height: 1.4;">
                      Confirm Email Address &amp; Unlock Level 1 Character Sheet
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Big Clickable CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${confirmationUrl}" target="_blank" style="display: inline-block; padding: 16px 38px; background-color: #5B57F0; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 999px; box-shadow: 0 6px 20px rgba(91, 87, 240, 0.35); text-align: center; letter-spacing: -0.01em;">
                      Verify &amp; Activate Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 13px; color: #8A857A; text-align: center;">
                This activation link is valid for 24 hours.
              </p>

              <!-- Fallback Plain URL -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #EFECE6;">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px 0; font-size: 12px; color: #8A857A;">
                      Button not working? Copy and paste this URL into your browser:
                    </p>
                    <p style="margin: 0; font-size: 12px; word-break: break-all;">
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
            <td style="padding: 24px 36px; background-color: #FAF8F5; border-top: 1px solid #EFECE6; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #8A857A;">
                Life RPG OS &bull; Gamify your daily progress
              </p>
              <p style="margin: 0; font-size: 11px; color: #A8A399;">
                If you did not request this account, you can safely ignore this email.
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
