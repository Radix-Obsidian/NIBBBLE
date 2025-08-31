'use client'

import { ProfileManagement } from '@/app/components/profile/profile-management'

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
      <ProfileManagement />
    </div>
  )
}
