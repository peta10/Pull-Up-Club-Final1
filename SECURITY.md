# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within Pull-Up Club, please send an email to [security@pullupclub.com]. All security vulnerabilities will be promptly addressed.

Please do not publicly disclose the issue until it has been addressed by our team.

## Security Measures

1. **Environment Variables**
   - All sensitive credentials are stored in environment variables
   - Production credentials are managed through secure vaults
   - Development uses separate credentials from production

2. **Database Security**
   - Row Level Security (RLS) enabled on all tables
   - Prepared statements used to prevent SQL injection
   - Regular security audits and updates

3. **API Security**
   - JWT authentication required for protected endpoints
   - Rate limiting implemented
   - CORS policies in place

4. **Frontend Security**
   - CSP headers implemented
   - XSS protection enabled
   - CSRF tokens required for forms

5. **Infrastructure**
   - Regular security updates
   - Automated vulnerability scanning
   - Backup and disaster recovery procedures in place

## Version Control Security

- No credentials should ever be committed to the repository
- Pre-commit hooks check for sensitive data
- Regular security audits of dependencies

## Responsible Disclosure

We kindly ask that:

1. You do not exploit the vulnerability
2. You do not reveal the vulnerability to others
3. You provide sufficient information to reproduce the vulnerability
4. You allow reasonable time for the vulnerability to be fixed before any disclosure 