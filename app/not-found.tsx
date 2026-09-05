import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="text-8xl font-bold" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        404
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
