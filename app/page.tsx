import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Tourist App</h1>
      <p className="text-gray-500">Choose your role to continue</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/facility/login"
          className="text-center py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Facility Login
        </Link>
        <Link
          href="/user/login"
          className="text-center py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          User Login
        </Link>
        <Link
          href="/driver/login"
          className="text-center py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Driver Login
        </Link>
      </div>
    </main>
  );
}
