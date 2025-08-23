"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { CountUp } from '@/components/blocks/CountUp';
import { FloatingIcon } from '@/components/blocks/FloatingIcon';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ParameterCard {
  name: string;
  score: number;
  justification: string;
  icon: any;
}

interface ParameterCarouselProps {
  parameters: ParameterCard[];
}

function ParameterCarousel({ parameters }: ParameterCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isAutoScrolling] = useState(true);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll functionality
  const startAutoScroll = useCallback(() => {
    if (!api || !isAutoScrolling || isUserInteracting) return;
    
    autoScrollRef.current = setTimeout(() => {
      if (api && isAutoScrolling && !isUserInteracting) {
        const nextIndex = (current + 1) % parameters.length;
        api.scrollTo(nextIndex);
      }
    }, 3000); // Auto-scroll every 3 seconds
  }, [api, current, isAutoScrolling, isUserInteracting, parameters.length]);

  // Stop auto-scroll when user interacts
  const handleUserInteraction = useCallback(() => {
    setIsUserInteracting(true);
    
    // Clear existing timeout
    if (userInteractionTimeoutRef.current) {
      clearTimeout(userInteractionTimeoutRef.current);
    }
    
    // Reset user interaction after 5 seconds of no interaction
    userInteractionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 5000);
  }, []);

  // Handle carousel events
  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const newCurrent = api.selectedScrollSnap();
      setCurrent(newCurrent);
      
      // Restart auto-scroll after selection
      if (isAutoScrolling && !isUserInteracting) {
        startAutoScroll();
      }
    };

    const handlePointerDown = () => {
      handleUserInteraction();
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };

    const handlePointerUp = () => {
      // Restart auto-scroll after interaction ends
      if (isAutoScrolling && !isUserInteracting) {
        startAutoScroll();
      }
    };

    api.on("select", handleSelect);
    api.on("pointerDown", handlePointerDown);
    api.on("pointerUp", handlePointerUp);

    return () => {
      api.off("select", handleSelect);
      api.off("pointerDown", handlePointerDown);
      api.off("pointerUp", handlePointerUp);
    };
  }, [api, isAutoScrolling, isUserInteracting, startAutoScroll, handleUserInteraction]);

  // Start auto-scroll when component mounts or when auto-scroll is enabled
  useEffect(() => {
    if (isAutoScrolling && !isUserInteracting) {
      startAutoScroll();
    }

    return () => {
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, isUserInteracting, startAutoScroll]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current);
      }
      if (userInteractionTimeoutRef.current) {
        clearTimeout(userInteractionTimeoutRef.current);
      }
    };
  }, []);

  const getScoreColor = (score: number) => {
    if (score <= 25) return "from-red-400 to-red-500";
    if (score <= 50) return "from-orange-400 to-orange-500";
    if (score <= 75) return "from-yellow-400 to-yellow-500";
    return "from-green-400 to-green-500";
  };

  const getScoreBadge = (score: number) => {
    if (score <= 25) return { text: "Poor", variant: "destructive" as const };
    if (score <= 50) return { text: "Fair", variant: "secondary" as const };
    if (score <= 75) return { text: "Good", variant: "outline" as const };
    return { text: "Excellent", variant: "default" as const };
  };

  // Static gradient that mimics the animated gradient but without animation
  const getStaticGradientStyle = (score: number) => {
    let colors;
    if (score <= 25) colors = ["#EF4444", "#F87171", "#FCA5A5"];
    else if (score <= 50) colors = ["#F59E0B", "#FCD34D", "#FEF3C7"];
    else if (score <= 75) colors = ["#EAB308", "#FDE047", "#FEFCE8"];
    else colors = ["#10B981", "#34D399", "#6EE7B7"];

    return {
      background: `radial-gradient(circle at 20% 80%, ${colors[0]}15 0%, transparent 50%), 
                   radial-gradient(circle at 80% 20%, ${colors}15 0%, transparent 50%), 
                   radial-gradient(circle at 40% 40%, ${colors}10 0%, transparent 50%)`,
    };
  };

  return (
    <div className="w-full py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-base-content">Detailed Analysis</h2>
            <p className="text-base-content/60">Scroll through each parameter to see detailed insights</p>
          </div>
          
          <div className="relative">
            <Carousel 
              setApi={setApi} 
              className="w-full cursor-grab active:cursor-grabbing"
              opts={{
                align: "start",
                loop: true,
                skipSnaps: false,
                dragFree: false,
                containScroll: "trimSnaps",
                slidesToScroll: 1,
                breakpoints: {
                  '(min-width: 768px)': { slidesToScroll: 1 },
                  '(min-width: 1024px)': { slidesToScroll: 1 }
                }
              }}
            >
              <CarouselContent className="-ml-2">
                {parameters.map((param, index) => (
                  <CarouselItem 
                    key={index} 
                    className="pl-2 basis-1/3 md:basis-1/3 lg:basis-1/3"
                    onMouseEnter={handleUserInteraction}
                    onTouchStart={handleUserInteraction}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Card className="h-full bg-base-100/90 backdrop-blur-sm border-base-300/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group overflow-hidden relative">
                        {/* Static Gradient Background - Same style as AnimatedGradient but without animation */}
                        <div 
                          className="absolute inset-0 rounded-xl"
                          style={getStaticGradientStyle(param.score)}
                        />
                        
                        {/* Content Layer */}
                        <div className="relative z-10 h-full flex flex-col">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-base-100/80 backdrop-blur-sm border border-base-300/50 flex items-center justify-center shadow-sm">
                                <FloatingIcon icon={param.icon} className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-base-content/90 leading-tight">
                                  {param.name}
                                </h3>
                                <Badge 
                                  variant={getScoreBadge(param.score).variant}
                                  className="text-xs mt-1"
                                >
                                  {getScoreBadge(param.score).text}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0 flex-1 flex flex-col">
                            <div className="space-y-4 flex-1">
                              {/* Score Display */}
                              <div className="text-center">
                                <div className="relative">
                                  <CountUp 
                                    from={0} 
                                    to={param.score} 
                                    duration={1.5}
                                    className="text-2xl font-bold text-primary"
                                    suffix="%"
                                  />
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                                </div>
                                <p className="text-xs text-base-content/60 mt-1">Performance Score</p>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-base-content/60">
                                  <span>0%</span>
                                  <span>100%</span>
                                </div>
                                <div className="w-full h-2.5 bg-base-300/50 rounded-full overflow-hidden shadow-inner">
                                  <motion.div 
                                    className={`h-full bg-gradient-to-r ${getScoreColor(param.score)} shadow-sm`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${param.score}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                  />
                                </div>
                              </div>
                              
                              {/* Justification */}
                              <div className="flex-1 flex flex-col">
                                <div className="bg-base-100/80 backdrop-blur-sm border border-base-300/50 rounded-lg p-3 flex-1">
                                  <p className="text-xs text-base-content/80 leading-relaxed line-clamp-3">
                                    {param.justification}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            
            {/* Carousel indicators */}
            <div className="flex justify-center mt-4 gap-1">
              {parameters.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === current 
                      ? 'bg-primary w-4' 
                      : 'bg-base-300 hover:bg-base-400'
                  }`}
                  onClick={() => {
                    api?.scrollTo(index);
                    handleUserInteraction();
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ParameterCarousel };
