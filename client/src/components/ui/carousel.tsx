import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BorderGlow } from './border-glow';

interface CarouselItemData {
  title: string;
  description: string;
  id: number | string;
  icon: React.ReactNode;
}

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

function CarouselItem({ 
  item, 
  index, 
  itemWidth, 
  trackItemOffset, 
  x, 
  transition 
}: { 
  item: CarouselItemData, 
  index: number, 
  itemWidth: number, 
  trackItemOffset: number, 
  x: any, 
  transition: any 
}) {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const outputRange = [45, 0, -45]; // Reduced rotation for cleaner look
  const rotateY = useTransform(x, range, outputRange, { clamp: false });
  const opacity = useTransform(x, range, [0.5, 1, 0.5]);
  const scale = useTransform(x, range, [0.9, 1, 0.9]);

  return (
    <div className="shrink-0 h-full flex items-center justify-center" style={{ width: itemWidth }}>
      <div className="relative flex flex-col items-center justify-center p-8 h-full w-full bg-card/40 border border-border/40 backdrop-blur-md rounded-[32px] shadow-sm transition-all duration-300 hover:border-border/60">
        <motion.div
          className="flex flex-col items-center justify-center w-full h-full"
          style={{
            rotateY,
            opacity,
            scale,
          }}
          transition={transition}
        >
          <div className="mb-6 relative">
            {/* Removed the intense blur glow */}
            <div className="relative z-10 p-4 rounded-2xl bg-primary/10 text-primary border border-primary/10 shadow-inner">
              {item.icon}
            </div>
          </div>
          <div className="text-center relative z-10">
            <h3 className="text-2xl font-bold mb-3 tracking-tight text-foreground">{item.title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed font-medium px-4 max-w-[320px]">{item.description}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export interface CarouselProps {
  items: CarouselItemData[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
}

export function Carousel({
  items,
  baseWidth = 400,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = true
}: CarouselProps) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;
  
  const itemsForRender = useMemo(() => {
    if (!loop) return items;
    if (items.length === 0) return [];
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);

  const [position, setPosition] = useState(loop ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return undefined;
    if (pauseOnHover && isHovered) return undefined;

    const timer = setInterval(() => {
      setPosition(prev => prev + 1);
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

  useEffect(() => {
    const startingPosition = loop ? 1 : 0;
    setPosition(startingPosition);
    x.set(-startingPosition * trackItemOffset);
  }, [items.length, loop, trackItemOffset, x]);

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }
    
    if (position === itemsForRender.length - 1) {
      setIsJumping(true);
      setPosition(1);
      x.set(-trackItemOffset);
      requestAnimationFrame(() => setIsJumping(false));
    } else if (position === 0) {
      setIsJumping(true);
      setPosition(items.length);
      x.set(-items.length * trackItemOffset);
      requestAnimationFrame(() => setIsJumping(false));
    }
    setIsAnimating(false);
  };

  const handleDragEnd = (_: any, info: any) => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;

    if (direction === 0) return;

    setPosition(prev => {
      const next = prev + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };

  const activeIndex = items.length === 0 ? 0 : loop ? (position - 1 + items.length) % items.length : Math.min(position, items.length - 1);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden w-full h-[400px] flex flex-col items-center justify-center"
    >
      <motion.div
        className="flex"
        drag={isAnimating ? false : 'x'}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItem
            key={`${item?.id ?? index}-${index}`}
            item={item}
            index={index}
            itemWidth={itemWidth}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>
      
      <div className="mt-8 flex gap-2">
        {items.map((_, index) => (
          <motion.button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              activeIndex === index ? "bg-primary w-4" : "bg-muted-foreground/30"
            )}
            onClick={() => setPosition(loop ? index + 1 : index)}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
