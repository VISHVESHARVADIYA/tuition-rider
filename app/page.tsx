export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Tuition Rider
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Connect with qualified tutors and excel in your studies
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/auth/login"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </a>
            <a
              href="/auth/register"
              className="px-8 py-3 bg-slate-200 text-gray-900 font-semibold rounded-lg hover:bg-slate-300 transition"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
