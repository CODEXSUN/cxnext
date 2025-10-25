// app/components/Footer.tsx
'use client'

import { ArrowUp } from "lucide-react";

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-primary text-primary-foreground py-4">
            <div className="mx-auto px-4 flex justify-between items-center text-sm">
                <div>&copy; {new Date().getFullYear()} Codexsun. All rights reserved.</div>
                <button
                    onClick={scrollToTop}
                    className="p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors focus:outline-none"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-5 w-5" />
                </button>
            </div>
        </footer>
    );
}