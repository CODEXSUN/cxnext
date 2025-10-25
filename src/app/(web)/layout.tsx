// app/(web)/layout.tsx

import {WebMenu} from "@/components/menu/web/web-menu";
import Footer from "@/components/blocks/Footer";

export default function WebLayout({
                                      children,
                                  }: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <WebMenu/>
            <main>{children}</main>
            <Footer />
        </div>
    );
}