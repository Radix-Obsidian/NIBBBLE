import SocialLayout from '@/app/social-layout'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SocialLayout>{children}</SocialLayout>
}