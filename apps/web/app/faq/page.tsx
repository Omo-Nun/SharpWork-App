'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "How does the escrow payment system work?",
    answer: "When you hire an artisan, your payment is held securely in escrow. It is only released to the artisan once the job is completed and you have approved the work. This ensures your money is safe and you get the quality you paid for."
  },
  {
    question: "How do you verify your artisans?",
    answer: "We have a thorough verification process that includes identity checks, background screening, and skill assessments. We also collect and monitor reviews from previous customers to ensure ongoing quality."
  },
  {
    question: "What if I am not satisfied with the work?",
    answer: "If you are unsatisfied, you can raise a dispute before releasing the escrow payment. Our support team will mediate and ensure the issue is resolved fairly, either through a refund or by having the artisan fix the problem."
  },
  {
    question: "How do I become an artisan on SharpWork?",
    answer: "You can sign up on our platform and complete your profile. Our team will contact you for the verification process. Once verified, you can start receiving job requests from customers."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Have questions? We're here to help.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007A52] focus-visible:ring-inset"
                >
                  <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="text-[#007A52] flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                  )}
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Still have questions? <a href="/contact" className="text-[#007A52] font-semibold hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
}
