

## Plan: Three Features

### 1. User Forgot Password — Email-based Reset Flow

Currently, the forgot password flow in `UserLogin.tsx` finds the account by username/email and immediately lets the user set a new password (no email verification). The user wants a proper flow:

**Changes to `src/components/UserLogin.tsx`:**
- Step 1: User enters email/username → find account
- Step 2: Simulate sending a "reset link" to the user's email (show a confirmation screen with masked email). Add a "Continue to Reset" button (since we can't actually send emails from the local SQLite system, we simulate the flow).
- Step 3: User enters new password + confirm → update in DB → redirect back to login with success toast

This is largely what exists but we'll add an intermediate "email sent" confirmation step to make it feel like a real email flow.

### 2. Admin Password Fallback After 5 Failed OTP Attempts

Currently, after too many OTP failures the admin gets locked for 2 minutes. The user wants: after 5 total failed OTP attempts, show a password input field instead, with the hardcoded password `vishnu@1923` for both admins.

**Changes to `src/components/AdminLogin.tsx`:**
- Track a cumulative `failCount` state across OTP verification attempts
- After 5 failed OTP attempts, switch UI to show a password input field instead of OTP inputs
- Validate against hardcoded password `vishnu@1923`
- On success, proceed with the same session setup as OTP verification

### 3. Chat History Search

Add a search bar to the `ChatBubbleWidget` so users can filter/find past messages.

**Changes to `src/components/ChatBubbleWidget.tsx`:**
- Add a search state and a search input (toggle via a Search icon in the header)
- When search text is entered, filter displayed messages to only those containing the search term (case-insensitive), highlighting matches
- Show a result count and allow clearing the search
- Search applies to both user and assistant messages

### Files to Modify
1. `src/components/UserLogin.tsx` — add email-sent confirmation step to forgot password
2. `src/components/AdminLogin.tsx` — add password fallback after 5 failed OTP attempts
3. `src/components/ChatBubbleWidget.tsx` — add search functionality for chat history

