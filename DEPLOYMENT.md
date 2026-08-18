# Life RPG OS - Production Deployment Guide

## Pre-Deployment Checklist

### Environment Setup
- [ ] Create `.env.production` with all required variables
- [ ] Set `NODE_ENV=production`
- [ ] Enable Vercel analytics
- [ ] Configure Sentry DSN for error tracking
- [ ] Set up SMTP for email notifications
- [ ] Configure push notification VAPID keys

### Database Setup (Supabase)
- [ ] Run all SQL migrations from `supabase-schema.sql`
- [ ] Run `supabase-day4.sql` for achievement system
- [ ] Run `supabase-day5-referral.sql` for referral system
- [ ] Run `supabase-day6-admin.sql` for admin tables and functions
- [ ] Verify all RLS policies are enabled
- [ ] Test auth flow end-to-end
- [ ] Backup production database before launch

### Security Review
- [ ] Review all RLS policies
- [ ] Verify CRON_SECRET is unique and strong
- [ ] Enable Supabase API rate limiting
- [ ] Configure CORS settings
- [ ] Review service role key permissions
- [ ] Set up API key rotation schedule
- [ ] Enable HTTPS-only for production

### Performance Optimization
- [ ] Enable Next.js Image Optimization
- [ ] Configure CDN for static assets
- [ ] Review and test bundle size (target < 200KB gzip)
- [ ] Enable PWA caching strategies
- [ ] Set up database query monitoring
- [ ] Configure Redis for session/cache if needed

### Monitoring & Analytics
- [ ] Set up error tracking (Sentry or similar)
- [ ] Configure application performance monitoring (APM)
- [ ] Set up user analytics
- [ ] Create monitoring dashboard
- [ ] Set up alerting for critical errors
- [ ] Configure uptime monitoring

### API Routes Security
- [ ] Review rate limiting on all endpoints
- [ ] Verify authentication on protected routes
- [ ] Test API error handling
- [ ] Document API endpoints
- [ ] Set up API monitoring

## Required Environment Variables

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=Life RPG OS

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key

# Cron Jobs
CRON_SECRET=your-secure-secret-min-32-chars

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-token

# Optional: Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-key
VAPID_PRIVATE_KEY=your-key

# Optional: Email
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your-email@provider.com
SMTP_PASSWORD=your-password
```

## Deployment Steps (Vercel)

### 1. Initial Setup
```bash
npm install -g vercel
vercel login
vercel project add (or link existing)
```

### 2. Environment Variables
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CRON_SECRET
# ... add all other env vars
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Verify Deployment
- [ ] Check homepage loads
- [ ] Verify auth flow works
- [ ] Test dashboard functionality
- [ ] Confirm API routes respond
- [ ] Check admin dashboard access
- [ ] Verify cron jobs are registered

## Post-Deployment

### Monitoring
1. Watch error logs in Sentry
2. Monitor database performance in Supabase dashboard
3. Check Vercel analytics for performance issues
4. Review error logs in app_config and error_logs table

### Cron Jobs Verification
The following cron jobs should be set up in Vercel:
- `/api/cron/daily-reminder` - Daily at 14:00 UTC
- `/api/cron/daily-metrics` - Daily at 23:00 UTC
- `/api/cron/weekly-snapshot` - Weekly at Monday 00:00 UTC

Verify cron jobs are firing:
```sql
-- Check system_metrics table for recent entries
SELECT * FROM public.system_metrics 
ORDER BY recorded_at DESC 
LIMIT 10;
```

## Rate Limiting

API rate limits are set per IP address:
- **Default**: 60 requests per minute
- **Burst limit**: 100 requests
- **Window**: 60 seconds

To adjust, update `src/lib/rateLimit.ts`

## Database Maintenance

### Daily Tasks
- Monitor error_logs table
- Check system_metrics for anomalies
- Review user feedback

### Weekly Tasks
- Backup database
- Review error trends
- Audit admin actions

### Monthly Tasks
- Update dependencies
- Review performance metrics
- Plan feature releases

## Rollback Plan

If deployment fails:
1. Revert to previous commit: `git revert <commit>`
2. Verify locally: `npm run build && npm run dev`
3. Redeploy: `vercel --prod`
4. Check Supabase migrations (rollback if needed)
5. Verify all services are healthy

## Support & Troubleshooting

### Common Issues

**503 Service Unavailable**
- Check Supabase service status
- Verify environment variables
- Review Vercel deployment logs

**Auth not working**
- Verify Supabase URL and keys
- Check RLS policies
- Review browser console for errors

**Admin dashboard empty**
- Verify system_metrics table has data
- Check cron jobs are running
- Verify admin user flag is set

**Slow performance**
- Check database query performance
- Review Vercel Analytics
- Consider query optimization

## Contact & Escalation

For production issues:
1. Check error logs in Sentry
2. Review database health in Supabase
3. Check Vercel deployment status
4. Escalate to platform team if needed
