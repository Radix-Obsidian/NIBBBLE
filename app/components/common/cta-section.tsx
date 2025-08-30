import { Button } from '../ui/button';

export function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Ready to Start Your Cooking Journey?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join our community of passionate cooks and food lovers today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl">
            Get Started Free
          </Button>
          <Button variant="outline" size="xl">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
