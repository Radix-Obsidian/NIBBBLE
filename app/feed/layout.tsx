import SocialLayout from '@/app/social-layout'

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SocialLayout>{children}</SocialLayout>
}