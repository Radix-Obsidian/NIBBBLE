import { Play, Users, TrendingUp } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Play className="w-8 h-8 text-white" />,
      title: "Step-by-Step Videos",
      description: "Learn cooking techniques with our easy-to-follow video tutorials from professional chefs"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Community Driven",
      description: "Connect with fellow food lovers, share your creations, and get inspired by others"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: "Always Fresh",
      description: "Discover new recipes daily and stay up-to-date with the latest food trends"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose PantryPals?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of home cooks who are already improving their skills and sharing their passion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
