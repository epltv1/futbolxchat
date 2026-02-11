export const metadata = {
  title: 'Streaming Chat',
  description: 'Live Chat for Streaming',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
