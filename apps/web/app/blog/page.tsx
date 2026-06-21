export default function BlogPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            SharpWork Blog
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Tips, guides, and stories from the world of home maintenance and skilled artistry.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder Blog Posts */}
          {[1, 2, 3, 4, 5, 6].map((post) => (
            <article key={post} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
              <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                <span>Image Placeholder</span>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-[#007A52] mb-1">Home Repair</p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    5 Essential Plumbing Tips for Every Homeowner
                  </h3>
                  <p className="text-gray-600 line-clamp-3">
                    Discover simple yet effective ways to maintain your home's plumbing system and prevent costly emergencies before they happen.
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">Author</span>
                    <div className="h-10 w-10 rounded-full bg-gray-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <div className="flex space-x-1 text-sm text-gray-500">
                      <time dateTime="2026-06-20">Jun 20, 2026</time>
                      <span aria-hidden="true">&middot;</span>
                      <span>5 min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
