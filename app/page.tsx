import { Poppins } from 'next/font/google';

const font = Poppins({
  subsets: ['latin'],
  weight: ['600'],
});

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center bg-sky-500">
      <div className="space-y-6 text-center"></div>
    </main>
  );
}
