export const metadata = {
  title: 'TerraMarket',
  description: 'E-commerce Marketplace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


