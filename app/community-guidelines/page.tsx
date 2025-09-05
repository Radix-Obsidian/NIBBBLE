import { Header, Footer } from '@/app/components';
import { Button } from '@/app/components/ui/button';
import { Users, Heart, Shield, Star, Smile } from 'lucide-react';

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 mb-20">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Community Guidelines
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Building a positive and inclusive cooking community together
          </p>
          <Button size="xl">
            <a href="/signin" className="w-full h-full flex items-center justify-center">
              Get Started Free
            </a>
          </Button>
        </section>

        {/* Guidelines Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                NIBBBLE is a community where food lovers can share their passion for cooking, 
                discover new recipes, and connect with like-minded individuals. We believe in fostering 
                a supportive, creative, and respectful environment for everyone.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Values</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Heart className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Respect & Kindness</h3>
                    <p className="text-gray-600 text-sm">Treat everyone with respect and kindness</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Creativity</h3>
                    <p className="text-gray-600 text-sm">Celebrate culinary creativity and innovation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Safety</h3>
                    <p className="text-gray-600 text-sm">Prioritize food safety and best practices</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Smile className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Inclusivity</h3>
                    <p className="text-gray-600 text-sm">Welcome all cultures and cooking styles</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Encourage</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Sharing original recipes and cooking experiences</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Providing helpful feedback and constructive comments</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Celebrating diverse cuisines and cooking traditions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Supporting fellow cooks in their culinary journey</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Sharing food safety tips and best practices</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Don&apos;t Allow</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Hate speech, harassment, or bullying of any kind</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Spam, misleading content, or commercial promotion</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Content that promotes unsafe cooking practices</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Copyright infringement or plagiarism</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Personal information sharing without consent</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Guidelines</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Recipes</h3>
                  <p className="text-gray-600">
                    Ensure your recipes are original or properly credited. Include clear instructions, 
                    accurate measurements, and food safety considerations.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Photos & Videos</h3>
                  <p className="text-gray-600">
                    Share high-quality, appetizing images and videos. Ensure they&apos;re your own work 
                    or you have permission to use them.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Comments & Interactions</h3>
                  <p className="text-gray-600">
                    Be constructive and supportive in your comments. Ask questions respectfully 
                    and share your experiences positively.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporting & Enforcement</h2>
              <p className="text-gray-600 leading-relaxed">
                If you encounter content that violates our guidelines, please report it using the flag button. 
                Our moderation team reviews all reports and takes appropriate action. 
                Repeated violations may result in account suspension or termination.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Help</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about these guidelines or need help with a specific situation, 
                please reach out to our support team. We&apos;re here to help maintain a positive community experience.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Join Our Amazing Community
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
