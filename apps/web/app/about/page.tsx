export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            About SharpWork
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Connecting Nigerians with verified, reliable artisans for everyday needs.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              At SharpWork, our mission is to simplify the process of finding and hiring trustworthy artisans in Nigeria. We understand the frustration of unreliable service and aim to bring transparency, security, and quality to every home repair and maintenance job.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Work</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We leverage technology to bridge the gap between skilled professionals and those who need their services. With our secure escrow payment system, customers can be confident that their money is safe until the job is completed to their satisfaction, while artisans are guaranteed payment for their hard work.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li><strong>Trust:</strong> All our artisans undergo a rigorous verification process.</li>
              <li><strong>Quality:</strong> We expect and encourage high standards of work.</li>
              <li><strong>Security:</strong> Secure payments protect both the customer and the artisan.</li>
              <li><strong>Reliability:</strong> We are committed to making sure jobs are done right and on time.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
