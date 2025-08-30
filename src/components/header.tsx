import Link from 'next/link';
import { BookOpenCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-card">
      <Link href="/" className="flex items-center justify-center">
        <BookOpenCheck className="h-6 w-6 text-accent" />
        <span className="sr-only">GATE CS Navigator</span>
      </Link>
      <div className="ml-4">
        <h1 className="text-xl font-bold font-headline">GATE CS Navigator</h1>
      </div>
    </header>
  );
}
