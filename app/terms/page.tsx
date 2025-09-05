import { Header, Footer } from '@/app/components';
import { Button } from '@/app/components/ui/button';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 mb-20">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <Button size="xl">
            <a href="/signin" className="w-full h-full flex items-center justify-center">
              Get Started Free
            </a>
          </Button>
        </section>

        {/* Terms Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using NIBBBLE, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed">
                NIBBBLE is a social recipe platform that allows users to discover, create, and share recipes. 
                Our service includes recipe browsing, user-generated content, community features, and cooking resources.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. 
                You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User-Generated Content</h2>
              <p className="text-gray-600 leading-relaxed">
                Users may submit recipes, photos, and other content. You retain ownership of your content, 
                but grant NIBBBLE a license to use, display, and distribute your content on our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Community Guidelines</h2>
              <p className="text-gray-600 leading-relaxed">
                All users must follow our community guidelines. Content that is inappropriate, harmful, 
                or violates our policies may be removed. We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data</h2>
              <p className="text-gray-600 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                use, and protect your personal information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers</h2>
              <p className="text-gray-600 leading-relaxed">
                NIBBBLE provides recipes and cooking information for educational purposes. 
                We are not responsible for the accuracy of recipes or any outcomes from following them. 
                Always use proper food safety practices.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                NIBBBLE shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of the service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes 
                and continued use of the service constitutes acceptance of the new terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our feedback form 
                or support channels.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start sharing your culinary creations with food lovers around the world
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
