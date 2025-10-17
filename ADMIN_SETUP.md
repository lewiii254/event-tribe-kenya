# Admin User Setup Guide

## Overview
This guide explains how to set up the admin user for EventTribe Kenya.

## Admin User Credentials
The system is configured to automatically grant admin privileges to the following email address:
- **Email**: `ngondimarklewis@gmail.com`
- **Password**: `mark2006`

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
   - Password: `mark2006`
4. Submit the form
5. The system will automatically create the user profile and assign the admin role
6. You can now access the admin panel at `/admin`

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

1. **Change Default Password**: After first login, consider changing the default password to something more secure
2. **Role-Based Access**: Only users with the admin role can access the admin panel
3. **Row Level Security**: The database enforces row-level security policies to protect user data

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
If you already registered with this email:
- Just log in with your existing password
- The migration will automatically grant you admin privileges
- Navigate to `/admin` to verify access

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
