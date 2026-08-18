import { Resend } from 'resend'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return null
  }
  return new Resend(process.env.RESEND_API_KEY).emails.send({
    from: 'Life RPG OS <noreply@life-rpg-os.com>',
    to,
    subject,
    html,
  })
}
