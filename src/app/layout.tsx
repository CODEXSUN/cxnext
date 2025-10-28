// app/layout.tsx

import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/global/auth/AuthContext";
import React from "react";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "CODEXSUN - ERP SOFTWARE",
    description: "Software Made Simple",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}
            // <-- **Add the attribute on the server** (it will be ignored on client)
              cz-shortcut-listen="true">

        <AuthProvider>
            <main>{children}</main>
        </AuthProvider>
        </body>
        </html>
    );
}