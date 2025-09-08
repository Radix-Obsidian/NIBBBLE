import SocialLayout from '@/app/social-layout'

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SocialLayout>{children}</SocialLayout>
}