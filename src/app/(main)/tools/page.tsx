import Link from 'next/link';

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Tools</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        <Link
          href="/ide"
          className="block p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-2 dark:text-white">IDE</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Your personal coding environment.
          </p>
        </Link>

        <Link
          href="/fyp"
          className="block p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-2 dark:text-white">FYP Feed</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Personalized learning feed powered by AI.
          </p>
        </Link>

        <Link
          href="/research-assistant"
          className="block p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-2 dark:text-white">Research Assistant</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Your AI-powered research assistant.
          </p>
        </Link>
      </div>
    </div>
  );
}
