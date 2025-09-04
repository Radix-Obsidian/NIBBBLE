'use client';

export function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: "Find Recipes",
      description: "Choose from a wide range of recipes based on your preferences and dietary needs.",
      image: "💻",
      color: "bg-blue-100"
    },
    {
      id: 2,
      title: "Order ingredients online",
      description: "Cook your favorite meals with simply fresh ingredients. And have them delivered straight to your door.",
      image: "🛒",
      color: "bg-green-100"
    },
    {
      id: 3,
      title: "Cooking and enjoyment",
      description: "Follow our easy-to-use recipe steps to enjoy your new creations.",
      image: "👩‍🍳",
      color: "bg-orange-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Explore How Our Recipe Wonderland Works!
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.id} className="text-center">
              {/* Step Number */}
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF375F] to-[#FFD84D] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">0{step.id}</span>
              </div>
              
              {/* Step Image */}
              <div className={`${step.color} w-32 h-32 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <span className="text-5xl">{step.image}</span>
              </div>
              
              {/* Step Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
