# TrafQuiz API Documentation

## Overview

This document describes the enhanced API endpoints for the TrafQuiz application.

## Base URL

- **Development**: `http://localhost:84/trafQuiz/public/api/`
- **Production**: Configure in environment settings

## Authentication

Most endpoints require authentication via session-based login.

---

## Student Progress Endpoints

### Get Student Progress

Retrieves exam history, scores, and performance metrics for a student.

**Endpoint**: `GET /students/progress`

**Parameters**:

- `id` (required): Student ID

**Response**:

```json
{
  "success": true,
  "data": {
    "examsTaken": 10,
    "averageScore": 85.5,
    "totalScore": 855,
    "recentExams": [
      {
        "id": 1,
        "exam_id": 1,
        "exam_name": "Road Signs Test",
        "score": 90,
        "completed_at": "2026-01-10T10:30:00Z",
        "total_questions": 30
      }
    ],
    "examHistory": []
  }
}
```

---

## Financial Endpoints

### Get Transactions

Retrieves payment transaction history.

**Endpoint**: `GET /finances/transactions`

**Parameters**:

- `userId` (optional): Filter by user ID (if not admin)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": "50.00",
      "payment_date": "2026-01-10T12:00:00Z",
      "transaction_id": "TXN-12345",
      "status": "completed",
      "method": "card",
      "package_name": "Light Motor Vehicles(Class 4)",
      "username": "student1",
      "student_name": "John Doe"
    }
  ]
}
```

### Get Financial Statistics

Retrieves financial analytics for administrators.

**Endpoint**: `GET /finances/stats`

**Response**:

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_revenue": "5000.00",
      "total_transactions": 50,
      "average_amount": "100.00"
    },
    "monthlyRevenue": [
      {
        "month": "2026-01",
        "revenue": "1200.00",
        "transactions": 15
      }
    ],
    "packageRevenue": [
      {
        "package_name": "Light Motor Vehicles(Class 4)",
        "sales_count": 20,
        "total_revenue": "2000.00"
      }
    ]
  }
}
```

---

## Account Management

### Delete Account

Permanently deletes a user account (requires password confirmation).

**Endpoint**: `POST /account/delete`

**Request Body**:

```json
{
  "userId": "123",
  "password": "user_password"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Error Response** (401):

```json
{
  "success": false,
  "message": "Invalid password"
}
```

---

## Payment Processing

### Process Payment

Records a payment transaction.

**Endpoints**:

- `POST /payments/process` (canonical)
- `POST /payment` (alias for backward compatibility)

**Request Body**:

```json
{
  "studentId": 1,
  "amount": 50.00,
  "packageId": 2,
  "method": "card",
  "transactionId": "TXN-UNIQUE-ID"
}
```

**Response**:

```json
{
  "success": true,
  "transactionId": "TXN-UNIQUE-ID",
  "message": "Payment processed and recorded successfully"
}
```

---

## Rate Limiting

All API endpoints are protected by rate limiting:

- **Limit**: 100 requests per minute per IP address
- **Response on limit exceeded** (429):

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

**400 Bad Request**:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

**401 Unauthorized**:

```json
{
  "success": false,
  "message": "Authentication required"
}
```

**500 Internal Server Error**:

```json
{
  "success": false,
  "message": "Internal server error occurred"
}
```

---

## Security Considerations

1. **Password Handling**: All passwords are hashed using PHP's `password_hash()` with `PASSWORD_DEFAULT`
2. **SQL Injection Protection**: All queries use prepared statements
3. **Rate Limiting**: Prevents API abuse and DDoS attacks
4. **Input Validation**: All endpoints validate required parameters
5. **Cascade Deletes**: Foreign key constraints handle related data cleanup

---

## Usage Examples

### JavaScript/TypeScript (Angular)

```typescript
// Get student progress
this.http.get(`${apiUrl}students/progress?id=${studentId}`)
  .subscribe(response => {
    console.log(response.data);
  });

// Delete account
this.http.post(`${apiUrl}account/delete`, {
  userId: userId,
  password: password
}).subscribe(response => {
  console.log('Account deleted');
});
```

### cURL

```bash
# Get student progress
curl "http://localhost:84/trafQuiz/public/api/students/progress?id=1"

# Get transactions (admin)
curl "http://localhost:84/trafQuiz/public/api/finances/transactions"

# Delete account
curl -X POST "http://localhost:84/trafQuiz/public/api/account/delete" \
  -H "Content-Type: application/json" \
  -d '{"userId": "123", "password": "mypassword"}'
```

---

## Changelog

### Version 1.1 (2026-01-10)

- Added student progress tracking endpoint
- Added financial statistics and transaction endpoints
- Implemented account deletion with password verification
- Created rate limiting middleware
- Standardized error response format
- Fixed payment endpoint mismatch

---

## Support

For issues or questions, contact the development team.
