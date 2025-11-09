import { Bebas_Neue, Montserrat } from 'next/font/google';

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-montserrat'
});
export const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-bebas'
});
