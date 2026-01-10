export const metadata = {
  title: 'Bubbl Chatbot API',
  description: 'Backend API for Bubble.io chatbot integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
