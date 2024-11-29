import { Roboto } from 'next/font/google';
import 'normalize.css';
import '@styles/GlobalStyles.scss';
import { MapProvider } from '@/components/MapProvider';

const roboto = Roboto({
    subsets: ['latin'],
    weight: ['100', '300', '400', '500', '700', '900'],
    display: 'swap',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={roboto.className}>
                <MapProvider>{children}</MapProvider>
            </body>
        </html>
    );
}
