'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ArtisanProfilePage({ params }: { params: { artisanId: string } }) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API endpoint to submit UGC moderation report
    console.log('Reporting artisan', params.artisanId, 'for:', reportReason);
    setReportSubmitted(true);
    setTimeout(() => setIsReporting(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="h-32 bg-[#0D2B5E]"></div>
        <div className="px-6 py-4 sm:flex sm:items-center sm:justify-between relative">
          <div className="sm:flex sm:space-x-5">
            <div className="flex-shrink-0 -mt-16 sm:-mt-16 relative">
              <img className="mx-auto h-24 w-24 rounded-full border-4 border-white shadow-md object-cover" src={`https://ui-avatars.com/api/?name=Artisan+${params.artisanId}&background=0D2B5E&color=fff`} alt="Artisan Profile" />
            </div>
            <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">John Doe</p>
              <p className="text-sm font-medium text-gray-600">Professional Plumber</p>
              <div className="mt-1 flex items-center justify-center sm:justify-start">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-[#007A52]">
                  Verified Artisan
                </span>
                <span className="ml-2 flex items-center text-sm text-yellow-500">
                  ★ 4.8 (120 reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-center sm:mt-0 gap-3">
            <Link 
              href={`/book/${params.artisanId}`}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#F56500] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#F56500]/90 focus:outline-none"
            >
              Book Now
            </Link>
            <button 
              onClick={() => setIsReporting(true)}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              Report
            </button>
          </div>
        </div>
      </div>

      {/* About & Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About Me</h2>
            <p className="text-gray-600">
              I am a certified plumber with over 10 years of experience in residential and commercial plumbing. 
              I specialize in leak detection, pipe repair, and full bathroom installations. Dedicated to providing 
              high-quality service and customer satisfaction.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Portfolio</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium text-gray-900">Lagos, Ikeja</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Jobs Completed</dt>
                <dd className="font-medium text-gray-900">145</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Member Since</dt>
                <dd className="font-medium text-gray-900">2023</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsReporting(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              {!reportSubmitted ? (
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Report / Block User</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">Please provide a reason for reporting this artisan. Our moderation team will review this report shortly.</p>
                    <form onSubmit={handleReport}>
                      <textarea
                        required
                        rows={4}
                        className="w-full rounded-md border-gray-300 border p-2 focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm"
                        placeholder="Describe the issue..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                      ></textarea>
                      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                          Submit Report
                        </button>
                        <button type="button" onClick={() => setIsReporting(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Report Submitted</h3>
                  <p className="text-sm text-gray-500 mt-2">Thank you. We have received your report.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
