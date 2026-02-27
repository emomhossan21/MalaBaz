import React from 'react';

export default function FAQ() {
  const faqs = [
    {
      question: "What is MALABAZ?",
      answer: "MALABAZ is a premium e-commerce platform in Bangladesh offering high-quality products across various categories, ensuring the best shopping experience."
    },
    {
      question: "How can I place an order?",
      answer: "Simply browse our products, add your desired items to the cart, proceed to checkout, enter your shipping details, and select your preferred payment method."
    },
    {
      question: "Do you offer Cash on Delivery (COD)?",
      answer: "Yes, we offer Cash on Delivery (COD) all over Bangladesh. For some locations outside Dhaka, a small advance payment may be required to confirm the order."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery inside Dhaka usually takes 1-2 business days, while delivery outside Dhaka takes 3-5 business days."
    },
    {
      question: "Can I track my order?",
      answer: "Yes! Once your order is dispatched, you will receive a tracking link via SMS or email to monitor your package's status."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a hassle-free return policy. If you receive a damaged or incorrect product, you can request a return or exchange within 3 days of delivery. Please visit our Returns & Exchanges page for more details."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach out to us via the 'Contact Us' page or directly message us through the 'Returns & Exchanges' support chat if you have an account."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black mb-8 dark:text-white text-center">Frequently Asked Questions</h1>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold mb-3 dark:text-white">{faq.question}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
