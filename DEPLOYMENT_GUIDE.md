# Deployment Guide for Admin API

This guide explains how to deploy the updates we've made to fix the admin dashboard and its APIs.

## Changes Made

1. **Fixed Database Migration**
   - Created a new migration `20250524000000_fix_get_submissions_with_users.sql` to improve the admin RPC function
   - This includes better error handling for the admin role check

2. **Enhanced Edge Function**
   - Updated `admin-api` Edge Function with:
     - Better error handling and standardized responses
     - CORS support for browser requests
     - Retry capability for network failures
     - Improved validation of request parameters

3. **Improved Frontend Integration**
   - Updated `src/utils/edgeFunctions.ts` with retry capability
   - Added better error message formatting
   - Improved the AdminDashboardPage with more robust error handling

## Deployment Steps

1. **Apply Database Migrations**
   ```bash
   # Navigate to your project directory
   cd Pull-Up-Club-V1
   
   # Apply migrations to your Supabase project
   supabase db push
   ```

2. **Deploy Edge Function**
   ```bash
   # Deploy the admin-api Edge Function
   supabase functions deploy admin-api --project-ref your-project-ref
   ```

3. **Deploy Frontend**
   ```bash
   # Build the frontend
   npm run build
   
   # Deploy to Netlify or your preferred hosting
   netlify deploy --prod
   ```

## Troubleshooting

If you encounter issues with the admin dashboard:

1. **Check Authentication**: Ensure your admin user is properly set up in the `admin_roles` table.

2. **Check Network Logs**: Open browser developer tools and look for API errors in the Network tab.

3. **Check Edge Function Logs**: In the Supabase dashboard, go to Edge Functions > admin-api > Logs to see if there are any errors.

4. **Verify RPC Function**: Run the following SQL to test if the RPC function works:
   ```sql
   SELECT * FROM public.get_submissions_with_users();
   ```

5. **Try Alternative API**: If the Edge Function isn't working, you can revert to using the RPC function temporarily by modifying `adminApi.getSubmissions()` in `src/utils/edgeFunctions.ts`.

## Future Improvements

1. **Pagination**: Add pagination to the admin dashboard for better performance with large datasets.

2. **Advanced Filtering**: Add more filtering options in the admin dashboard.

3. **Bulk Operations**: Add support for approving or rejecting multiple submissions at once.

4. **Real-time Updates**: Use Supabase realtime subscriptions to update the dashboard in real-time when new submissions are made. 