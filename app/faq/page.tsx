'use client';

import { Header, Footer } from '@/app/components';
import { Button } from '@/app/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';

// FAQ data
const faqs = [
  {
    question: "What is PantryPals?",
    answer: "PantryPals is a social recipe platform that connects home cooks, food creators, and culinary enthusiasts. You can discover recipes, share your own creations, and build a community around your love for cooking."
  },
  {
    question: "Is PantryPals free to use?",
    answer: "Yes! PantryPals is completely free to use. You can browse recipes, create an account, and start sharing your culinary journey without any cost."
  },
  {
    question: "How do I create a recipe?",
    answer: "After signing up, you can create recipes by clicking the 'Create' button in the header. You'll be able to add ingredients, instructions, cooking times, and photos to make your recipe come to life."
  },
  {
    question: "Can I save recipes I like?",
    answer: "Absolutely! You can like and save recipes to your personal collection. This makes it easy to find your favorite recipes later and build your own recipe library."
  },
  {
    question: "How do I follow other creators?",
    answer: "You can follow other users by visiting their profile pages. This will keep you updated on their latest recipes and cooking adventures."
  },
  {
    question: "What types of recipes can I find?",
    answer: "PantryPals features recipes from all cuisines and skill levels - from quick weeknight dinners to elaborate weekend projects. You'll find everything from traditional dishes to modern fusion recipes."
  },
  {
    question: "Is my content safe?",
    answer: "Yes, we take content safety seriously. All user-generated content is moderated, and we have community guidelines in place to ensure a positive environment for everyone."
  },
  {
    question: "How do I get help if I need it?",
    answer: "You can reach out to our support team through the feedback form or contact us directly. We're here to help make your cooking journey as smooth as possible."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 mb-20">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Everything you need to know about PantryPals
          </p>
          <Button size="xl">
            <a href="/signin" className="w-full h-full flex items-center justify-center">
              Get Started Free
            </a>
          </Button>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community and start your culinary journey today
          </p>
          <Button size="xl">
            <a href="/signin" className="w-full h-full flex items-center justify-center">
              Get Started Free
            </a>
          </Button>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}
