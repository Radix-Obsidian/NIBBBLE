import SocialLayout from '@/app/social-layout'

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SocialLayout>{children}</SocialLayout>
}