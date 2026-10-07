import "./globals.css";
export const metadata = {title:"Panta Intelligence",description:"Prediction-market intelligence powered by Panta"};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
