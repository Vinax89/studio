import Link from 'next/link';
export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">NurseFinAI</h1>
      <p className="mt-2">Get started by linking a bank account.</p>
      <Link href="/link" className="inline-block mt-4 rounded-lg bg-black text-white px-4 py-2">Link an account</Link>
    </main>
  );
}
