# Debugging 404 User Not Found Error

## Current Issue
- User tries OTP verification → Gets redirected to `/user/6`
- Frontend tries to fetch user 6 → Backend returns 404 (User not found)
- This means **user_id 6 doesn't exist in your database**

## Root Causes to Check

### 1. **OTP Endpoint Returns Non-Existent User ID**
The backend `/otp/verify-otp` endpoint is returning a `user_id` that doesn't exist in the `users` table.

**Check:**
```sql
-- In your database:
SELECT * FROM users;  -- List all users
SELECT * FROM users WHERE user_id = 6;  -- Check if user 6 exists
```

**If no users exist:**
- Your `users` table is empty
- You need to seed test data first

---

### 2. **Missing Token/User Storage**
When OTP verification succeeds, the frontend now saves:
```javascript
localStorage.setItem("user", JSON.stringify(res));
localStorage.setItem("token", res.token);
```

**Check in Browser:**
1. Open DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Look for `user` and `token`
4. Verify `token` is a valid JWT string

---

### 3. **Backend OTP Logic Issue**
Your backend `/otp/verify-otp` endpoint might have an issue. Check your backend code:

```javascript
// Should verify if user exists BEFORE returning user_id
exports.verifyOtp = async (req, res) => {
  // 1. Check if OTP matches
  // 2. Find user in database by email/voterId
  // 3. ONLY return user if they exist
  // 4. If not found → Return error (don't return non-existent user_id)
};
```

---

## Debugging Steps

### Step 1: Check Database Content
```bash
# Connect to your database and run:
SELECT COUNT(*) FROM users;  -- How many users?
SELECT * FROM users LIMIT 5;  -- Show first 5 users
```

### Step 2: Test OTP Endpoint Directly
```bash
curl -X POST https://e-voting-backend-u9dk.onrender.com/otp/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com", "otp":"123456"}'
```

### Step 3: Check Browser Console
After trying to verify OTP, check:
- Console logs show: `🔐 OTP VERIFY RESPONSE:` 
- What `user_id` is being returned?
- What's in the response object?

### Step 4: Check Backend Logs
Go to Render.com dashboard → Your backend service → **Logs**
- Look for errors when `/otp/verify-otp` is called
- Look for database query errors

---

## Solution Options

### Option A: Seed Test Users
If database is empty, add test data:
```sql
INSERT INTO users (user_id, name, email, voter_id) 
VALUES (6, 'Test User', 'test@example.com', '001');
```

### Option B: Fix Backend OTP Logic
Ensure `/otp/verify-otp` returns only users that actually exist:
```javascript
// Check user exists in DB first
const user = await pool.query(
  "SELECT user_id, name, email FROM users WHERE email=$1",
  [email]
);

if (!user.rows.length) {
  return res.status(404).json({ success: false, message: "User not found" });
}

// Only return user_id if user exists
return res.json({ 
  success: true, 
  user_id: user.rows[0].user_id,
  // ... other data
});
```

---

## Quick Test
1. Manually create a user in database with `user_id = 6`
2. Try OTP verification again
3. If it works → Issue is data/seeding
4. If it still fails → Issue is backend logic

---

## Commands to Run

**In your terminal:**
```bash
# Check your backend logs
# 1. Go to Render.com
# 2. Click your backend service
# 3. Scroll to "Logs" section
# 4. Look for recent errors

# OR check local backend logs if running locally
npm run dev  # Your backend
```
