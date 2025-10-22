# Secure Project-Based Encryption Setup

## Overview

The enhanced encryption system now uses **key derivation** instead of storing encryption keys directly in the database. This significantly improves security by ensuring that even if someone gains access to your database, they cannot decrypt the data without the master secret.

## How It Works

1. **Master Secret**: A single secret stored outside the database (environment variable, config file, external key management system)
2. **Project Salts**: Random salts generated per project and stored in the database
3. **Key Derivation**: Encryption keys are derived using PBKDF2(master_secret + project_salt)

Even if an attacker gains access to your database, they only see:
- Encrypted data
- Random salts (which are useless without the master secret)

## Configuration

### Option 1: Environment Variable (Recommended for Production)
```bash
# Set the master secret as an environment variable
export JUSTFLOW_ENCRYPTION_MASTER_SECRET="your-very-long-and-secure-master-secret-here"
```

### Option 2: Configuration File
```yaml
# In your backend config.yaml
encryption:
  master_secret: "your-very-long-and-secure-master-secret-here"
  # Fallback key for legacy data (optional)
  key: "legacy-key-for-backward-compatibility"
```

## Master Secret Requirements

- **Length**: Minimum 32 characters, recommended 64+ characters
- **Randomness**: Use a cryptographically secure random generator
- **Characters**: Include letters, numbers, and symbols
- **Uniqueness**: Must be unique per JustFlow installation

### Generate a Secure Master Secret

```bash
# Option 1: Using OpenSSL
openssl rand -base64 64

# Option 2: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Option 3: Using Go
go run -c "package main; import (\"crypto/rand\", \"encoding/base64\", \"fmt\"); func main() { b := make([]byte, 64); rand.Read(b); fmt.Println(base64.URLEncoding.EncodeToString(b)) }"
```

## Security Benefits

1. **Database Compromise Protection**: Even with full database access, encrypted data remains secure
2. **Per-Project Isolation**: Each project uses a unique derived key
3. **Key Rotation**: Changing the master secret or project salt rotates all encryption
4. **Audit Trail**: Key derivation can be logged and monitored
5. **Compliance**: Meets most regulatory requirements for encryption key management

## Migration from Legacy System

The system maintains backward compatibility:

1. **New Projects**: Automatically use the secure key derivation system
2. **Existing Projects**: Continue working with existing keys until migrated
3. **Gradual Migration**: Projects can be migrated one by one using the key rotation feature

## Best Practices

### Storage
- **Never** store the master secret in the database
- Use environment variables or external key management systems
- Rotate the master secret periodically (quarterly/annually)
- Keep secure backups of the master secret

### Access Control
- Limit access to the master secret to essential personnel only
- Use separate master secrets for different environments (dev/staging/prod)
- Log all access to encryption keys

### Monitoring
- Monitor for unusual encryption/decryption patterns
- Alert on encryption failures
- Regular security audits of key management processes

## Troubleshooting

### "Master secret not configured" Error
1. Ensure the master secret is set in your configuration
2. Restart the backend service after setting the secret
3. Check environment variable spelling

### "Failed to decrypt" Errors
1. Verify the master secret hasn't changed
2. Check if the project salt was corrupted
3. Consider falling back to legacy key mode temporarily

### Performance Considerations
- Key derivation adds ~1-2ms per operation
- Consider caching derived keys in memory for high-throughput scenarios
- Monitor CPU usage during bulk encryption operations

## Example Implementation

```go
// Environment variable
masterSecret := os.Getenv("JUSTFLOW_ENCRYPTION_MASTER_SECRET")
```
