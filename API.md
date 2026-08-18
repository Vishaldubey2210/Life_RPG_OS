# API Reference & Rate Limiting

## Authentication

All protected endpoints require a valid Supabase JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

All API endpoints have rate limiting enabled:
- **Default:** 60 requests per minute per IP
- **Burst:** Up to 100 requests allowed
- **Window:** 60-second rolling window

Rate limit headers returned with each response:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1629876543
```

### Rate Limit Exceeded
When rate limit is exceeded:
- **Status:** 429 Too Many Requests
- **Response:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in X seconds.",
  "retryAfter": 42
}
```

## Public Endpoints

### GET /
Homepage and public landing page.

### GET /auth/callback
OAuth callback handler for authentication flow.

## Protected Endpoints (Requires Auth)

### POST /api/coach/weekly-report
Generate AI-powered weekly coaching report.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "report": {
    "summary": "string",
    "insights": ["string"],
    "recommendations": ["string"],
    "score": 85,
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Rate Limit:** Standard (60/min)

---

### POST /api/notifications/read
Mark one or more notifications as read.

**Request Body:**
```json
{
  "notificationIds": ["uuid", "uuid"]
}
```

**Response:**
```json
{
  "success": true,
  "updated": 2
}
```

---

### POST /api/push/subscribe
Register device for push notifications.

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "string",
      "auth": "string"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "uuid"
}
```

---

### POST /api/push/send
Send notification to user (admin only).

**Request Body:**
```json
{
  "userId": "uuid",
  "title": "string",
  "body": "string",
  "icon": "string",
  "badge": "string"
}
```

---

### GET /api/analytics/insights
Get user analytics insights.

**Query Parameters:**
- `period`: "week" | "month" | "all"
- `userId`: optional, defaults to current user

**Response:**
```json
{
  "totalXp": 5000,
  "levelProgress": 45,
  "currentStreak": 14,
  "totalHabits": 8,
  "completionRate": 87,
  "topStat": "STR",
  "achievements": 12,
  "recentActivity": [
    {
      "habitName": "Morning Workout",
      "completedAt": "2024-01-15T07:30:00Z",
      "xpEarned": 50
    }
  ]
}
```

---

## Admin Endpoints

Require `is_admin = true` on user profile.

### GET /admin
Admin overview dashboard with KPIs.

### GET /admin/users
List all users with pagination.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 50)
- `search`: string (search by name/email)
- `status`: "active" | "suspended" | "admin"

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "displayName": "string",
      "level": 15,
      "xp": 5000,
      "streak": 7,
      "createdAt": "2024-01-10T00:00:00Z",
      "isAdmin": false,
      "isSuspended": false
    }
  ],
  "total": 234,
  "page": 1,
  "pageSize": 50
}
```

### PATCH /admin/users/:userId
Update user status (suspend/admin).

**Request Body:**
```json
{
  "isAdmin": false,
  "isSuspended": false
}
```

---

### GET /admin/feedback
List user feedback.

**Query Parameters:**
- `status`: "open" | "reviewing" | "acknowledged" | "closed"
- `type`: "bug" | "feature_request" | "general" | "complaint"
- `limit`: number (default: 50)

**Response:**
```json
{
  "feedback": [
    {
      "id": "uuid",
      "userId": "uuid",
      "type": "bug",
      "title": "string",
      "body": "string",
      "status": "open",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### PATCH /admin/feedback/:feedbackId
Update feedback status.

**Request Body:**
```json
{
  "status": "acknowledged"
}
```

---

### GET /admin/metrics
Get system metrics.

**Query Parameters:**
- `period`: "1d" | "7d" | "30d" (default: "7d")

**Response:**
```json
{
  "metrics": {
    "totalUsers": 1250,
    "dailyActiveUsers": 350,
    "totalCompletions": 8900,
    "averageXpPerUser": 4200,
    "averageStreak": 8.5,
    "errorRate": 0.2,
    "responseTime": 145
  },
  "trends": [
    {
      "date": "2024-01-15",
      "users": 1240,
      "dau": 340,
      "completions": 850
    }
  ]
}
```

---

## Cron Endpoints

Require `CRON_SECRET` header for verification.

### GET /api/cron/daily-reminder
Send daily habit reminders to users.

**Headers Required:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "success": true,
  "notificationsSent": 342,
  "timestamp": "2024-01-15T14:00:00Z"
}
```

**Schedule:** 14:00 UTC daily (9:30 AM IST)

---

### GET /api/cron/daily-metrics
Calculate and store daily metrics.

**Response:**
```json
{
  "success": true,
  "metricsRecorded": 6,
  "data": {
    "totalUsers": 1250,
    "activeUsers7d": 350,
    "completionsToday": 420,
    "xpEarnedToday": 12500,
    "avgActiveStreak": 8.5,
    "errors24h": 3
  }
}
```

**Schedule:** 23:00 UTC daily

---

### GET /api/cron/weekly-snapshot
Generate weekly snapshots and reports.

**Response:**
```json
{
  "success": true,
  "snapshotsGenerated": 350,
  "coachingReportsGenerated": 45,
  "timestamp": "2024-01-16T00:00:00Z"
}
```

**Schedule:** Monday 00:00 UTC weekly

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Verify JWT token |
| 403 | Forbidden | User lacks required permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Check error logs |
| 503 | Service Unavailable | Supabase or Vercel down |

## Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": "error_type",
  "message": "Human readable error message",
  "details": { /* optional debugging info */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Webhooks

Supabase Realtime updates are available for:
- User profile changes
- Habit completions
- Achievement unlocks
- Party activity
- Achievement badges earned

Subscribe via Supabase client:
```typescript
supabase
  .channel('user_changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'profiles'
  }, (payload) => {
    console.log('User updated:', payload)
  })
  .subscribe()
```

## Rate Limit Best Practices

1. **Implement exponential backoff** for retries
2. **Cache responses** when possible
3. **Batch requests** to reduce calls
4. **Monitor headers** for remaining quota
5. **Spread requests** over time (avoid bursts)
6. **Use Supabase caching** for read-heavy operations

## Support

For API issues:
1. Check response headers for rate limit status
2. Review error logs in Sentry
3. Check error_logs table in database
4. Contact team for escalation

---

**Last Updated:** 2024-01-15
**API Version:** 1.0
