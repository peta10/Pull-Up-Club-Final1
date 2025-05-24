# Admin API Edge Function

This Edge Function provides a centralized API for admin operations in the Pull-Up Club app. It's designed to reduce cold starts by handling multiple operations within a single function, using URL path-based routing.

## Endpoints

The API provides the following endpoints:

### GET /admin-api/get-submissions

Gets all submissions with associated user information.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "video_url": "https://example.com/video.mp4",
    "pull_up_count": 10,
    "actual_pull_up_count": 9,
    "status": "pending",
    "notes": null,
    "submitted_at": "2023-05-15T12:34:56Z",
    "approved_at": null,
    "created_at": "2023-05-15T12:34:56Z",
    "updated_at": "2023-05-15T12:34:56Z",
    "platform": "youtube",
    "email": "user@example.com",
    "full_name": "John Doe",
    "age": 30,
    "gender": "Male",
    "region": "New York",
    "club_affiliation": "Gym Heroes"
  }
]
```

### POST /admin-api/approve-submission

Approves a submission and sets the actual pull-up count.

**Request Body:**
```json
{
  "submissionId": "uuid",
  "actualCount": 10
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "uuid",
    "status": "approved",
    "actual_pull_up_count": 10,
    "approved_at": "2023-05-16T10:20:30Z",
    "...": "other submission fields"
  }
}
```

### POST /admin-api/reject-submission

Rejects a submission with optional notes.

**Request Body:**
```json
{
  "submissionId": "uuid",
  "notes": "Form is incorrect, please keep your chin above the bar"
}
```

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": "uuid",
    "status": "rejected",
    "notes": "Form is incorrect, please keep your chin above the bar",
    "...": "other submission fields"
  }
}
```

### GET /admin-api/get-users

Gets all user profiles.

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "age": 30,
    "gender": "Male",
    "is_paid": true,
    "...": "other profile fields"
  }
]
```

### GET /admin-api/get-stats

Gets admin dashboard statistics.

**Response:**
```json
{
  "submissions": {
    "pending": 5,
    "approved": 20,
    "rejected": 3,
    "total": 28
  },
  "users": {
    "total": 50,
    "paid": 30,
    "free": 20
  },
  "subscriptions": {
    "active": 30,
    "past_due": 2,
    "canceled": 5,
    "total": 37
  }
}
```

## Authentication & Authorization

All endpoints require:
1. An authenticated user (JWT in the Authorization header)
2. The user must have an admin role (checked against the `admin_roles` table)

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "timestamp": "2023-05-15T12:34:56Z"
}
```

Common HTTP status codes:
- 400: Bad Request (missing parameters)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (not an admin)
- 404: Not Found (unknown route)
- 500: Internal Server Error (execution failure)

## Development

To deploy the function:

```bash
supabase functions deploy admin-api --project-ref your-project-ref
```

To test locally:

```bash
supabase functions serve admin-api
```

## Frontend Integration

Use the `adminApi` utility from `src/utils/edgeFunctions.ts` to call this API from the frontend. 