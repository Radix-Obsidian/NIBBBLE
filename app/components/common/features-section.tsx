import { Brain, Target, Zap, ShoppingCart, Users, TrendingUp, ChefHat, Package, Wrench } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: "Complete Cooking Experiences",
      description: "Not just recipes, but end-to-end cooking journeys. From ingredient sourcing to technique mastery, we create complete cooking experiences tailored to your kitchen",
      color: "from-[#f97316] to-[#d97706]"
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Success Prediction Engine",
      description: "Know before you cook if you'll succeed. Our AI analyzes your profile and predicts cooking outcomes with 94% accuracy",
      color: "from-[#10b981] to-[#059669]"
    },
    {
      icon: <Package className="w-8 h-8 text-white" />,
      title: "Integrated Grocery Delivery",
      description: "Seamless ingredient sourcing with real-time availability, pricing, and delivery from local stores. Your cooking experience starts with perfect ingredients",
      color: "from-[#ef4444] to-[#dc2626]"
    },
    {
      icon: <Wrench className="w-8 h-8 text-white" />,
      title: "Kitchen Equipment Recommendations",
      description: "AI-powered equipment suggestions based on your cooking style, space, and budget. Get the right tools for your culinary journey",
      color: "from-[#f59e0b] to-[#d97706]"
    },
    {
      icon: <ChefHat className="w-8 h-8 text-white" />,
      title: "Built-in Technique Instruction",
      description: "Master cooking fundamentals with integrated technique tutorials. Every recipe includes the skills you need to succeed",
      color: "from-[#8b5cf6] to-[#7c3aed]"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: "Creator Economy Platform",
      description: "Verified chefs and home cooks earn based on cooking success rates, not just views. Quality content that actually works in real kitchens",
      color: "from-[#06b6d4] to-[#0891b2]"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#f9fafb] via-white to-[#f3f4f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#111827] mb-4 font-['Poppins']">
            🍳 NIBBBLE — AI Recipes That Adapt to You
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover, save, and shop recipes that actually work in your kitchen. Like TikTok, you scroll. 
            Like Pinterest, you save. Like Shopify, you earn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#111827] mb-4 text-center font-['Poppins']">{feature.title}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#111827] mb-4 font-['Poppins']">
              Ready to Cook Smarter?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Shape the future of home cooking. Join our community of early adopters and help us build recipes that guarantee success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg">
                Get Early Access
              </button>
              <button className="border-2 border-gray-300 hover:border-[#f97316] text-gray-700 hover:text-[#f97316] px-8 py-4 rounded-lg font-semibold transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
