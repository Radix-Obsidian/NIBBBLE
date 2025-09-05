import { Brain, Target, Zap, ShoppingCart, Users, TrendingUp, ChefHat, Package, Wrench } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: "Complete Cooking Experiences",
      description: "Not just recipes, but end-to-end cooking journeys. From ingredient sourcing to technique mastery, we create complete cooking experiences tailored to your kitchen"
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Success Prediction Engine",
      description: "Know before you cook if you'll succeed. Our AI analyzes your profile and predicts cooking outcomes with 94% accuracy"
    },
    {
      icon: <Package className="w-8 h-8 text-white" />,
      title: "Integrated Grocery Delivery",
      description: "Seamless ingredient sourcing with real-time availability, pricing, and delivery from local stores. Your cooking experience starts with perfect ingredients"
    },
    {
      icon: <Wrench className="w-8 h-8 text-white" />,
      title: "Kitchen Equipment Recommendations",
      description: "AI-powered equipment suggestions based on your cooking style, space, and budget. Get the right tools for your culinary journey"
    },
    {
      icon: <ChefHat className="w-8 h-8 text-white" />,
      title: "Built-in Technique Instruction",
      description: "Master cooking fundamentals with integrated technique tutorials. Every recipe includes the skills you need to succeed"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      title: "Creator Economy Platform",
      description: "Verified chefs and home cooks earn based on cooking success rates, not just views. Quality content that actually works in real kitchens"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The Shopify for Home Cooks
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            NIBBBLE creates complete cooking experiences, not just recipe collections. 
            From grocery delivery to equipment recommendations and technique instruction, 
            we're building the foundational infrastructure for successful home cooking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF375F] to-[#FFD84D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
        
        {/* Infrastructure Comparison */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why "Shopify for Home Cooks"?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Just as Shopify provides the complete infrastructure for e-commerce success, 
              NIBBBLE provides the complete infrastructure for cooking success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Traditional Recipe Platforms</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Just recipe sharing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">No ingredient sourcing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">No equipment guidance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">No technique instruction</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Entertainment-focused metrics</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">NIBBBLE Complete Experience</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Complete cooking experiences</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Integrated grocery delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Equipment recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Built-in technique instruction</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Success-based creator economy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
