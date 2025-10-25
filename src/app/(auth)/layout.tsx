// app/(web)/layout.tsx

export default function WebLayout({
                                      children,
                                  }: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <main>{children}</main>
        </div>
    );
}