import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function LandingPage() {
  // State to track which card is being hovered
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Card data
  const cards = [
    {
      id: 'forge',
      title: 'The Forge',
      image: '/forge.jpg',
      description: 'Access curated learning resources to build your programming skills from the ground up.',
      link: '/forge',
      buttonText: 'Explore Resources'
    },
    {
      id: 'crucible',
      title: 'The Crucible',
      image: '/crucible.jpg',
      description: 'Test your skills with challenging problems designed to push your limits.',
      link: '/crucible',
      buttonText: 'Solve Problems'
    },
    {
      id: 'arena',
      title: 'The Arena',
      image: '/arena.jpg',
      description: 'Compete with peers in coding competitions and climb the leaderboard.',
      link: '/arena',
      buttonText: 'Enter Arena'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 text-primary font-heading"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Built for the Builder Within You
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-text-secondary max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            The ultimate platform for college students to learn, build, and showcase their programming skills.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/learn-more" className="btn btn-outline">
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-16 px-4 bg-background-secondary">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary font-heading">Our Ecosystem</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map(card => (
              <motion.div 
                key={card.id}
                className="relative h-80 rounded-lg overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onHoverStart={() => setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                {/* Background Image */}
                <img 
                  src={card.image} 
                  alt={card.title} 
                  className="w-full h-full object-cover"
                />
                
                {/* Title Badge */}
                <div className="absolute top-4 left-4">
                  <motion.div
                    className="px-3 py-2 rounded-lg bg-background/30 backdrop-blur-md"
                    animate={{ opacity: hoveredCard === card.id ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-bold text-white font-heading drop-shadow-lg">
                      {card.title}
                    </h3>
                  </motion.div>
                </div>
                
                {/* Animated Circle Reveal */}
                <AnimatePresence>
                  {hoveredCard === card.id && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Circular expanding background */}
                      <motion.div
                        className="absolute w-[300%] h-[300%] rounded-full"
                        style={{
                          background: 'hsla(203, 58%, 25%, 0.95)',
                          backdropFilter: 'blur(8px)',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
                      />
                      
                      {/* Content */}
                      <motion.div 
                        className="relative z-10 text-center p-6 w-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <h3 className="text-2xl font-bold mb-4 text-white font-heading">
                          {card.title}
                        </h3>
                        <p className="text-white mb-6">
                          {card.description}
                        </p>
                        <Link 
                          to={card.link} 
                          className="btn border-none text-white"
                          style={{ backgroundColor: 'hsla(202, 57%, 60%, 1)' }}
                        >
                          {card.buttonText}
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-primary font-heading">Why Choose ZEMON?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="p-6 border border-border rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold mb-3 text-primary font-heading">Personalized Learning</h3>
              <p className="text-text-secondary">
                Adaptive learning paths tailored to your skill level and career goals.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="p-6 border border-border rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-3 text-primary font-heading">Real-World Projects</h3>
              <p className="text-text-secondary">
                Build a portfolio with projects that solve actual industry problems.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="p-6 border border-border rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-3 text-primary font-heading">Community Support</h3>
              <p className="text-text-secondary">
                Connect with peers and mentors to accelerate your learning journey.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              className="p-6 border border-border rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-3 text-primary font-heading">AI-Powered Assistance</h3>
              <p className="text-text-secondary">
                Get intelligent feedback and hints when you're stuck on a problem.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div 
              className="p-6 border border-border rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <h3 className="text-xl font-bold mb-3 text-primary font-heading">College Integration</h3>
              <p className="text-text-secondary">
                Resources aligned with your college curriculum to boost academic performance.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div 
              className="p-6 border border-border rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-3 text-primary font-heading">Career Opportunities</h3>
              <p className="text-text-secondary">
                Connect with employers looking for talented programmers like you.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-background-secondary mt-auto">
        <div className="container mx-auto text-center">
          <p className="text-text-secondary">
            © {new Date().getFullYear()} ZEMON. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 