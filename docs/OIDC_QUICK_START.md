# OIDC Quick Start Guide

## What's New?

JustFlow now supports OIDC authentication with providers like Keycloak, Google, and GitHub. Users can log in using their existing accounts from these providers.

## Quick Setup Steps

### 1. Choose Your OIDC Provider

Pick one of:
- **Keycloak** (self-hosted) - Full control, enterprise ready
- **Google** (free) - Easy setup, widely used
- **GitHub** (free) - Great for developer users
- **Any OIDC-compliant provider** - Custom implementations supported

### 2. Register Your Application

Follow the provider's guide to get credentials:

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:3000/auth/oidc/callback/google`

**GitHub:**
1. Go to GitHub → Settings → Developer settings → OAuth apps
2. Add Authorization callback URL: `http://localhost:3000/auth/oidc/callback/github`

**Keycloak:**
1. Create realm and OIDC client in Keycloak
2. Set redirect URI: `http://localhost:3000/auth/oidc/callback/keycloak`

### 3. Update Configuration

Edit `services/backend/config/config.yaml`:

```yaml
oidc:
  enabled: true
  redirect_url: "http://localhost:3000"  # Your app URL
  
  providers:
    google:  # Choose providers you want to enable
      client_id: "YOUR_GOOGLE_CLIENT_ID"
      client_secret: "YOUR_GOOGLE_CLIENT_SECRET"
      discovery_url: "https://accounts.google.com"
      scopes:
        - openid
        - profile
        - email
```

### 4. Run Database Migration

The migration runs automatically, but you can trigger it manually:

```bash
cd services/backend
go run main.go --migrate  # If your app supports this
```

This adds two columns to the users table:
- `oidc_provider` - Provider name
- `oidc_provider_user_id` - Provider's user ID

### 5. Restart Your Application

```bash
# Backend
cd services/backend
go run main.go

# Frontend
cd services/frontend
npm run dev
```

### 6. Test It Out

1. Go to login page
2. Click a provider button (Google, GitHub, Keycloak)
3. Authenticate with provider
4. You should be logged in!

## Configuration Examples

### Google

```yaml
google:
  client_id: "123456789-abc.apps.googleusercontent.com"
  client_secret: "GOCSPX-abc123"
  discovery_url: "https://accounts.google.com"
  scopes:
    - openid
    - profile
    - email
```

### GitHub

```yaml
github:
  client_id: "Ive12345abcde"
  client_secret: "1234567890abcdefghij1234567890"
  discovery_url: "https://github.com"  # Note: GitHub has limited OIDC support
  scopes:
    - openid
    - profile
    - email
```

### Keycloak (Self-hosted)

```yaml
keycloak:
  client_id: "justflow"
  client_secret: "abc123def456"
  discovery_url: "https://keycloak.example.com/realms/master"
  scopes:
    - openid
    - profile
    - email
```

## Features

✅ **Multiple Providers** - Configure multiple OIDC providers  
✅ **User Management** - Automatic user creation/linking  
✅ **JWT Tokens** - Secure JWT-based authentication  
✅ **Email Verification** - Respects provider's email_verified claim  
✅ **Flexible Configuration** - YAML or environment variables  

## Environment Variables

Instead of config.yaml, use environment variables:

```bash
export BACKEND_OIDC_ENABLED=true
export BACKEND_OIDC_REDIRECT_URL=http://localhost:3000
# Provider configs must be in YAML for now
```

## Troubleshooting

**"Invalid redirect URL"**
- Ensure your `redirect_url` config matches your actual app URL
- Check provider's whitelist includes your callback URL

**"Failed to verify ID token"**
- Verify `discovery_url` is correct
- Check network connectivity to provider
- Ensure `client_id` matches provider configuration

**"User not found" after login**
- Database migration may not have run
- Check if `oidc_provider` column exists in users table
- Check application logs for details

## Architecture

### Login Flow

```
User → Click Provider Button → Backend: /auth/oidc/authorize/:provider
→ Redirect to Provider → User Authenticates → Provider: Callback to /auth/oidc/callback/:provider
→ Backend: Verify Token → Create/Update User → Return JWT
→ Frontend: Store Token → Redirect to Dashboard
```

### User Creation Logic

1. First time with OIDC provider → Create new user
2. Existing email + first OIDC login → Link OIDC to existing account
3. Same OIDC account again → Recognize and log in

## Next Steps

After setup, you can:

1. **Customize User Creation** - Edit `findOrCreateOIDCUser()` in `handlers/auths/oidc.go`
2. **Add More Providers** - Edit `config.yaml` and restart
3. **Implement State Validation** - Add proper state token verification
4. **Add Logout** - Implement OIDC RP-Initiated Logout
5. **Link Multiple Providers** - Allow users to link multiple accounts

## Documentation

See `OIDC_IMPLEMENTATION.md` for:
- Detailed architecture overview
- Complete API reference
- Security considerations
- Future enhancement ideas
- Provider-specific setup details

## Need Help?

Check the logs:
```bash
# Backend logs for OIDC errors
tail -f /var/log/justflow/backend.log

# Browser console for frontend errors
# Press F12 in browser → Console tab
```

Common issues are usually related to:
- Configuration typos
- Provider URL mismatches
- Missing environment variables
- Redirect URI not whitelisted
