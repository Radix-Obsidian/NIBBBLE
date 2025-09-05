# 🎯 Waitlist System Setup Guide

## ✅ **What's Been Implemented**

Your waitlist system is now connected to **Supabase** for persistent data storage! Here's what you have:

### **🗄️ Database Integration**
- **Supabase table**: `waitlist_entries` with all necessary fields
- **Persistent storage**: Data survives server restarts
- **Type-safe**: Full TypeScript integration
- **Secure**: Row Level Security (RLS) enabled

### **🔧 Admin Management**
- **Admin panel**: `/admin/waitlist`
- **Filter options**: All, Pending, Approved, Rejected, Creators, Cookers
- **One-click approval**: Approve/reject applications instantly
- **Real-time updates**: Changes reflect immediately

### **🛡️ Security Features**
- **RLS policies**: Users can only see their own entries
- **Service role access**: Admin operations use secure service key
- **Email validation**: Prevents duplicate applications

## 🚀 **Setup Instructions**

### **Step 1: Create the Database Table**

**Option A: Run the Setup Script**
```bash
cd scripts
node setup-waitlist-db.js
```

**Option B: Manual Setup (Recommended)**
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/create-waitlist-schema.sql`
4. Click **Run** to execute

### **Step 2: Verify Environment Variables**
Make sure these are in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Step 3: Test the System**
1. **Start your development server**: `npm run dev`
2. **Submit a test application**: Go to `/creators/waitlist` or `/cookers/beta`
3. **Check the admin panel**: Visit `/admin/waitlist`
4. **Approve the application**: Click "Approve" in the admin panel
5. **Test access**: Try signing in with the approved email

## 📊 **How It Works**

### **User Flow**
1. **User visits landing page** → Sees CTAs for both user types
2. **Clicks "Join Waitlist"** → Fills out detailed form
3. **Submits application** → Data saved to Supabase
4. **Admin approves** → Status updated in database
5. **User signs in** → WaitlistGate checks Supabase status
6. **Access granted** → Full access to NIBBBLE features

### **Admin Flow**
1. **Visit `/admin/waitlist`** → See all applications
2. **Filter by type/status** → Find specific applications
3. **Click "Approve/Reject"** → Status updated in Supabase
4. **User gets notified** → Through the WaitlistGate component

## 🔍 **Database Schema**

The `waitlist_entries` table includes:
- **Basic info**: email, name, type (creator/cooker)
- **Creator fields**: social_handle, cooking_experience, specialty, etc.
- **Cooker fields**: kitchen_setup, cooking_goals, frequency, etc.
- **Status tracking**: pending, approved, rejected
- **Timestamps**: submitted_at, approved_at, rejected_at

## 🛠️ **Troubleshooting**

### **Common Issues**

**"Supabase admin client not available"**
- Check your `SUPABASE_SERVICE_ROLE_KEY` environment variable
- Make sure it's set in `.env.local`

**"Table doesn't exist"**
- Run the SQL schema creation script
- Check Supabase dashboard for the `waitlist_entries` table

**"Permission denied"**
- Verify RLS policies are set up correctly
- Check that service role key has proper permissions

### **Testing the System**
1. **Submit test applications** from both creator and cooker forms
2. **Check admin panel** to see entries appear
3. **Approve/reject applications** and verify status changes
4. **Test sign-in flow** with approved emails

## 🎉 **You're All Set!**

Your waitlist system is now:
- ✅ **Persistent** - Data stored in Supabase
- ✅ **Scalable** - Can handle thousands of applications
- ✅ **Secure** - Proper authentication and authorization
- ✅ **Manageable** - Easy admin interface
- ✅ **Type-safe** - Full TypeScript integration

**Next steps**: Start collecting waitlist applications and managing approvals through the admin panel!
