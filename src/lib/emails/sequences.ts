/**
 * Automated Lifecycle Email Sequences
 * Light Creative Design System
 */

export const day3NudgeEmail = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Streak Alert — Life RPG OS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B2823;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F6F4EE; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E6E2D8; box-shadow: 0 8px 30px rgba(43, 40, 35, 0.06); overflow: hidden;">
          
          <tr>
            <td style="padding: 32px 36px 20px; text-align: center; background-color: #FAF8F5; border-bottom: 1px solid #EFECE6;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background-color: #FEECEB; color: #DC2626; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                ⚔️ Quest Alert
              </span>
              <h1 style="margin: 12px 0 0; font-size: 22px; font-weight: 800; color: #2B2823;">
                ${name}, your streak is waiting.
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #5C574E;">
                Most players who don&apos;t complete their first quest within 3 days never build the habit. Your character is still at <strong>Level 1</strong> with untouched stats.
              </p>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #FEECEB; border-left: 4px solid #DC2626; border-radius: 10px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #DC2626; text-transform: uppercase;">
                      Don&apos;t Break the Momentum
                    </p>
                    <p style="margin: 0; font-size: 13.5px; color: #2B2823;">
                      One completed habit today earns your first XP drop and prevents HP loss.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://life-rpg-os-chi.vercel.app'}/quests" target="_blank" style="display: inline-block; padding: 15px 36px; background-color: #5B57F0; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 999px; box-shadow: 0 4px 14px rgba(91, 87, 240, 0.35);">
                      Complete Your First Quest &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px; background-color: #FAF8F5; text-align: center; border-top: 1px solid #EFECE6;">
              <p style="margin: 0; font-size: 11px; color: #8A857A;">Life RPG OS &bull; Level up your real life</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export const day7ReportEmail = (name: string, stats: {
  questsCompleted: number
  xpEarned: number
  level: number
  streak: number
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly RPG Battle Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B2823;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F6F4EE; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E6E2D8; box-shadow: 0 8px 30px rgba(43, 40, 35, 0.06); overflow: hidden;">
          
          <tr>
            <td style="padding: 32px 36px 20px; text-align: center; background-color: #FAF8F5; border-bottom: 1px solid #EFECE6;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background-color: #EDECFD; color: #5B57F0; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                📊 Weekly Report
              </span>
              <h1 style="margin: 12px 0 4px; font-size: 22px; font-weight: 800; color: #2B2823;">
                Week 1 Battle Summary
              </h1>
              <p style="margin: 0; font-size: 13px; color: #787368;">Here is how ${name} performed this week</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 36px;">
              <table role="presentation" width="100%" border="0" cellspacing="8" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%" style="background-color: #FAF8F5; border: 1px solid #EAE6DD; border-radius: 14px; padding: 18px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: #5B57F0;">${stats.questsCompleted}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #6E6A61; margin-top: 4px;">Quests Finished</div>
                  </td>
                  <td width="50%" style="background-color: #FAF8F5; border: 1px solid #EAE6DD; border-radius: 14px; padding: 18px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: #D97706;">+${stats.xpEarned}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #6E6A61; margin-top: 4px;">Total XP</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="background-color: #FAF8F5; border: 1px solid #EAE6DD; border-radius: 14px; padding: 18px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: #059669;">Lv. ${stats.level}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #6E6A61; margin-top: 4px;">Current Level</div>
                  </td>
                  <td width="50%" style="background-color: #FAF8F5; border: 1px solid #EAE6DD; border-radius: 14px; padding: 18px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 800; color: #DC2626;">${stats.streak} Days</div>
                    <div style="font-size: 12px; font-weight: 600; color: #6E6A61; margin-top: 4px;">Active Streak</div>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 10px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://life-rpg-os-chi.vercel.app'}/dashboard" target="_blank" style="display: inline-block; padding: 15px 36px; background-color: #5B57F0; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 999px; box-shadow: 0 4px 14px rgba(91, 87, 240, 0.35);">
                      Open Character Sheet &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px; background-color: #FAF8F5; text-align: center; border-top: 1px solid #EFECE6;">
              <p style="margin: 0; font-size: 11px; color: #8A857A;">Life RPG OS &bull; Level up your real life</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export const day30ComebackEmail = (name: string, level: number, xp: number) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Character Awaits — Life RPG OS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F4EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B2823;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F6F4EE; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E6E2D8; box-shadow: 0 8px 30px rgba(43, 40, 35, 0.06); overflow: hidden;">
          
          <tr>
            <td style="padding: 32px 36px 20px; text-align: center; background-color: #FAF8F5; border-bottom: 1px solid #EFECE6;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background-color: #FEF3C7; color: #D97706; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                👑 Return to Realm
              </span>
              <h1 style="margin: 12px 0 0; font-size: 22px; font-weight: 800; color: #2B2823;">
                ${name}, your hero is waiting.
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #5C574E;">
                You are currently at <strong>Level ${level}</strong> with <strong>${xp} XP</strong> banked. Your past progress is safe and waiting for your return.
              </p>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #EDECFD; border-left: 4px solid #5B57F0; border-radius: 10px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #5B57F0; text-transform: uppercase;">
                      Resume Your Habit Quests
                    </p>
                    <p style="margin: 0; font-size: 13.5px; color: #2B2823;">
                      Pick up right where you left off. Start a new streak today.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://life-rpg-os-chi.vercel.app'}/dashboard" target="_blank" style="display: inline-block; padding: 15px 36px; background-color: #5B57F0; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 999px; box-shadow: 0 4px 14px rgba(91, 87, 240, 0.35);">
                      Resume Journey &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px; background-color: #FAF8F5; text-align: center; border-top: 1px solid #EFECE6;">
              <p style="margin: 0; font-size: 11px; color: #8A857A;">Life RPG OS &bull; Level up your real life</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
