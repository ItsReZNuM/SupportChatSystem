import "./globals.css";
import { iranSans } from "./fonts";
import "@/lib/fontawesome";
import QueryProvider from "@/components/queryProvider/QueryProvider";

export default function RootLayout({ children }) {
    return (
        <html lang="fa" dir="rtl">
            <body className={iranSans.className}>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
