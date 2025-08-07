export const metadata = {
  title: "G Network Services Advertising Panel",
  description: "Advertising panel app for customers to upload and display media content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white text-black">
      <body>{children}</body>
    </html>
  );
}
