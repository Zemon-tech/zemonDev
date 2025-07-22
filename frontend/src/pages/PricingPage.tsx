import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    features: [
      'Access to The Forge',
      'Solve public Crucible problems',
      'Join public Arena events',
      'Community support',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9/mo',
    features: [
      'All Starter features',
      'Unlimited problem attempts',
      'Private Arena competitions',
      'AI-powered hints',
      'Priority support',
    ],
    highlight: true,
  },
  {
    name: 'Campus',
    price: 'Contact Us',
    features: [
      'All Pro features',
      'Custom integrations',
      'Admin dashboard',
      'Onboarding & training',
    ],
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-primary font-heading mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Pricing
      </motion.h1>
      <motion.p
        className="text-lg text-text-secondary mb-12 text-center max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Choose the plan that fits your journey. Start for free, upgrade anytime.
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <motion.div
            key={plan.name}
            className={`rounded-lg shadow-lg border border-border bg-background-secondary flex flex-col ${plan.highlight ? 'ring-2 ring-primary' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-primary font-heading mb-2">{plan.name}</h2>
              <div className="text-3xl font-extrabold text-primary mb-4">{plan.price}</div>
              <ul className="mb-6 space-y-2 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="text-text-secondary flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span> {f}
                  </li>
                ))}
              </ul>
              <button className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'} w-full mt-auto`}>
                {plan.price === 'Contact Us' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 