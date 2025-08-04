"use client";

import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CountUp } from '@/components/blocks/CountUp';
import { FloatingIcon } from '@/components/blocks/FloatingIcon';

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

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="w-full py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-base-content">Detailed Analysis</h2>
            <p className="text-base-content/60">Scroll through each parameter to see detailed insights</p>
          </div>
          
          <div className="relative">
            <Carousel 
              setApi={setApi} 
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {parameters.map((param, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="p-4 bg-gradient-to-br from-base-100/80 to-base-200/40 backdrop-blur-sm border border-base-300/50 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full">
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <FloatingIcon icon={param.icon} className="w-6 h-6 text-primary" />
                          </div>
                          <h3 className="text-sm font-semibold text-base-content/90 leading-tight line-clamp-2">{param.name}</h3>
                          <div className="w-full">
                            <div className="flex items-center justify-center mb-2">
                              <CountUp 
                                from={0} 
                                to={param.score} 
                                duration={1.5}
                                className="text-xl font-bold text-primary"
                                suffix="%"
                              />
                            </div>
                            <div className="w-full h-2 bg-base-300/50 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full bg-gradient-to-r ${param.score <= 25 ? "from-red-400 to-red-500" : param.score <= 50 ? "from-orange-400 to-orange-500" : param.score <= 75 ? "from-yellow-400 to-yellow-500" : "from-green-400 to-green-500"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${param.score}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover tooltip */}
                        <div className="hidden group-hover:block absolute top-full left-0 right-0 mt-2 p-3 bg-base-100/95 backdrop-blur-md border border-base-300 rounded-lg shadow-xl z-10 text-xs max-w-xs">
                          <div className="font-medium text-base-content mb-1">{param.name}</div>
                          <div className="text-base-content/70">{param.justification}</div>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <CarouselPrevious className="left-4 bg-base-100/80 backdrop-blur-sm border-base-300 hover:bg-base-200" />
              <CarouselNext className="right-4 bg-base-100/80 backdrop-blur-sm border-base-300 hover:bg-base-200" />
            </Carousel>
            
            {/* Carousel indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {parameters.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === current 
                      ? 'bg-primary w-6' 
                      : 'bg-base-300 hover:bg-base-400'
                  }`}
                  onClick={() => api?.scrollTo(index)}
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