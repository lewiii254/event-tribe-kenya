# Admin User Setup Guide

## Overview
This guide explains how to set up the admin user for EventTribe Kenya.

## Admin User Email
The system is configured to automatically grant admin privileges to the following email address:
- **Email**: `ngondimarklewis@gmail.com`
- **Password**: You will create a secure password during initial signup

**Security Note**: As an admin account with elevated privileges, ensure you create a strong password following the security guidelines in this document.

## How It Works

### Automatic Admin Role Assignment
The system includes a database trigger that automatically assigns the admin role when a user with the specified email address signs up. This is implemented in the migration file:
- Location: `supabase/migrations/20251017203000_setup_admin_user.sql`

### Two Scenarios

#### 1. New User Signup
If the admin user doesn't exist yet:
1. Navigate to the authentication page: `/auth`
2. Click "Sign up" or "Create Account"
3. Enter:
   - Username: (your choice, e.g., "marklewis")
   - Email: `ngondimarklewis@gmail.com`
   - Password: (create a secure password - minimum 6 characters)
4. Submit the form
5. The system will automatically create the user profile and assign the admin role
6. You can now access the admin panel at `/admin`

**Important**: Choose a strong password during signup. Password requirements:
- **Minimum**: 6 characters (enforced by system)
- **Recommended for Admin**: 12+ characters for enhanced security
- Must include:
  - Uppercase and lowercase letters
  - Numbers
  - Special characters (!@#$%^&*)
- Avoid common words or predictable patterns
- Consider using a passphrase for better security and memorability

#### 2. Existing User
If a user with email `ngondimarklewis@gmail.com` already exists:
- The migration automatically grants admin privileges to this user
- Just log in with the existing credentials
- Navigate to `/admin` to access the admin panel

## Accessing the Admin Panel

Once logged in with admin credentials:
1. Navigate to `/admin` in your browser
2. Or click the "Admin Panel" link in the navigation (if visible)

## Admin Panel Features

The admin panel allows you to:

### User Management
- View all registered users
- Assign roles (admin, organizer, or user) to users
- See user registration dates and current roles

### Event Management
- View all events across the platform
- Delete events that violate policies or are inappropriate
- Monitor event metrics (organizer, date, booking count)

## Security Notes

### Password Security
1. **Strong Password Requirements**: Admin accounts should use passwords with:
   - **Minimum 12 characters** (even though system minimum is 6)
   - Mix of uppercase, lowercase, numbers, and special characters
   - No dictionary words, personal information, or common patterns
   - Unique password not used elsewhere
2. **Password Management**: Use a reputable password manager (e.g., 1Password, LastPass, Bitwarden) to:
   - Generate strong, random passwords
   - Securely store admin credentials
   - Enable secure sharing if needed

### Account Security
3. **Two-Factor Authentication**: Enable 2FA through your authentication provider if available
4. **Regular Password Updates**: Change admin password periodically (every 90 days recommended)
5. **Access Monitoring**: Regularly review admin access logs for suspicious activity

### System Security
6. **Role-Based Access**: Only users with the admin role can access the admin panel
7. **Row Level Security**: The database enforces row-level security policies to protect user data
8. **Principle of Least Privilege**: Only assign admin role to users who genuinely need it
9. **Session Management**: Always log out from shared or public devices

## Troubleshooting

### "Access Denied" Error
If you see "Access denied. Admin privileges required":
1. Ensure you're logged in with the correct email (`ngondimarklewis@gmail.com`)
2. Verify the migration has been applied to your database
3. Check the database `user_roles` table to confirm the admin role is assigned

### Migration Not Applied
If the admin role isn't being assigned automatically:
1. Check if the migration file exists: `supabase/migrations/20251017203000_setup_admin_user.sql`
2. Apply migrations manually using: `supabase db push` (if using Supabase CLI)
3. Or verify migrations are applied in your Supabase dashboard

### Already Have an Account
If you already registered with the admin email (`ngondimarklewis@gmail.com`):
- Just log in with your existing account password
- The migration will automatically grant you admin privileges
- Navigate to `/admin` to verify access

**Note**: Contact the original account owner if you don't have access to the existing account.

## Additional Admin Users

To add more admin users:
1. Log in to the admin panel with the primary admin account
2. Navigate to the "Users & Roles" tab
3. Select the user from the dropdown
4. Select "Admin" as the role
5. Click "Assign Role"

## Support

For issues with admin access or the admin panel:
- Check the browser console for error messages
- Review server logs for authentication errors
- Contact the development team for assistance




