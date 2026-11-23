import "./globals.css";

export const metadata = {
  title: "Student Navigator — Navigate Your Future",
  description: "Explore engineering colleges across India. Compare verified placement reports, locations, branches, and opportunities.",
  openGraph: {
    title: "Student Navigator — Navigate Your Future",
    description: "Compare engineering colleges and make your next move with confidence.",
    siteName: "Student Navigator",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
