import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { logger } from './logger'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASSWORD
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = Number(process.env.SMTP_PORT) || 587
  const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser || 'noreply@liferpg.os'
  const fromName = process.env.SMTP_FROM_NAME || 'Life RPG OS'
  const resendApiKey = process.env.RESEND_API_KEY

  // 1. Primary: Use Gmail / Custom SMTP if configured
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ''), // clean any spaces from app password
        },
      })

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''),
      })

      logger.info('Email sent successfully via SMTP', { to, messageId: info.messageId })
      return { success: true, messageId: info.messageId }
    } catch (smtpError) {
      logger.error('SMTP email dispatch failed', smtpError, { to, smtpUser, smtpHost })
      // Fall through to Resend if available
    }
  }

  // 2. Secondary: Resend API fallback
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey)
      const result = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        html,
      })
      logger.info('Email sent successfully via Resend', { to, id: result.data?.id })
      return { success: true, messageId: result.data?.id }
    } catch (resendError) {
      logger.error('Resend email dispatch failed', resendError, { to })
    }
  }

  logger.warn('No active email transport available — skipping dispatch', { to, subject })
  return null
}
