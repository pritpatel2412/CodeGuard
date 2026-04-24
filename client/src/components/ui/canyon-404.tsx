'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

// --- Types ---
interface NotFoundProps {
    title?: string;
    subtitle?: string;
    homeText?: string;
    searchText?: string;
    errorCode?: string | number;
}

// --- Parallax Hook ---
const useMouseParallax = (...depths: number[]) => {
    const [coords, setCoords] = useState(depths.map(() => ({ x: 0, y: 0 })));

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            requestAnimationFrame(() => {
                const width = window.innerWidth;
                const height = window.innerHeight;
                // Normalized to -0.5 <-> 0.5
                const x = e.clientX / width - 0.5;
                const y = e.clientY / height - 0.5;

                setCoords(depths.map((depth) => ({
                    x: depth * x,
                    y: depth * y,
                })));
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [depths]);

    return coords;
};

// --- Cactus Component ---
const Cactus = ({ x, y, scale, className = "" }: { x: number; y: number; scale: number; className?: string }) => (
    <g
        className={`cactus transition-transform duration-300 ${className}`}
        style={{
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            transformOrigin: 'center',
            transformBox: 'fill-box'
        } as React.CSSProperties}
    >
        <path
            fill="hsl(var(--primary))"
            d="m276.5 542.8c0 0-51.3-1.1-86-35.8c-38.6-38.6-38.9-75.8-38.9-75.8v-94.2c0 0-0.3-27.7 28.6-27.7c28.9 0 28.7 27.7 28.7 27.7v69.6c0 0 2 22.9 19.5 44.1c17.4 21.1 49.1 19.4 49.1 19.4v-287.8c0 0 0.2-43.7 42-43.7c37.4 0 44.1 38.6 44.1 38.6v264.2c0 0 29.4-4.3 48.1-22.5c18.7-18.1 19.5-44 19.5-44v-103.5c0 0-2.5-31.2 27.3-31.2c28.2 0 29 27.1 29 27.1v130.1c0 0 1.5 40.8-38.9 79.4c-38.2 36.6-86.1 37.4-86.1 37.4v120.9c-14.2 1.9-28.7 2.9-43.5 2.9c-14.1 0-28-0.9-41.6-2.7z"
        />
        <path
            fill="hsl(var(--primary) / 0.8)"
            d="m330 139.3c15.4 3.9-12.7 14.1-18 29.7c-5.3 15.5-8 26-8 26v442.7q-13.7-0.7-27-2.4v-92.3c0 0-53.3-2.3-77-26c-49.3-49.3-48-81-48-81v-101c0 0 1.9-14.1 8-17c6.1-2.9 13-7 13-7c0 0-6.6 9-9 19c-2.4 10-1.6 77.9-1.6 99.7c0 21.8 17.5 47.3 39.1 65.4c31 26 74.5 26.9 74.5 26.9v-344c0 0 6.4-22.2 18.4-30.3c12-8.1 22.8-11.7 35.6-8.4zm33 351.7c0 0 13.5 1.7 54-14c50.9-19.8 71.2-79.5 71.2-79.5c0 0-8.4 51.7-43.2 83.5c-31.9 29.2-82 32-82 32zm97-250c0 0-8.2 5.1-13 19c-4.8 13.9-1.8 88.3-1.8 96.7c0 8.4-1.1 30.9-11.4 44c-12.4 15.7-24.1 19.5-24.1 19.5c0 0 9.3-4.9 14.3-18.2c5-13.3 6-24 6-24v-114c0 0 5.9-16.9 15-20c9.1-3.1 15-3 15-3z"
        />
        <path fill="currentColor" className="text-foreground/20" d="m490.9 310.7v26.8h13.9c2.5 0 4.5 2 4.5 4.5c0 2.5-2 4.5-4.5 4.5h-13.9v26.7h13.9c2.5 0 4.5 2 4.5 4.4c0 2.5-2 4.5-4.5 4.5h-13.9v5.2q0 11.1-1.8 21.6h13.1c2.5 0 4.5 1.9 4.5 4.4c0 2.5-2 4.5-4.5 4.5h-14.9c-13.4 55.1-62.2 96.4-120.9 98.4v29.5h13.9c2.4 0 4.4 2 4.4 4.5c0 2.5-2 4.5-4.4 4.5h-13.9v26.7h13.9c2.4 0 4.4 2 4.4 4.5c0 2.5-2 4.5-4.4 4.5h-13.9v44q-4.4 0.7-8.9 1.2v-144.4c0-2.5 2-4.5 4.4-4.5c2.5 0 4.5 2 4.5 4.5v16.1c64.1-2.4 115.6-55.2 115.6-119.9v-119c0-13.3-10.8-24-24-24c-13.2 0-23.9 10.7-23.9 24v104.6c0 38.3-30 69.7-67.7 72v7.6c0 2.4-2 4.4-4.5 4.4c-2.4 0-4.4-2-4.4-4.4v-271.4c0-21.1-17.2-38.2-38.2-38.2c-21.1 0-38.2 17.1-38.2 38.2v301.8c0 2.5-2 4.5-4.5 4.5c-2.4 0-4.4-2-4.4-4.5v-8.2c-38.3-1.7-69-33.3-69-72v-64.9c0-13.2-10.7-24-23.9-24c-13.3 0-24 10.8-24 24v79.2c0 65.1 52.1 118.3 116.9 120v-18.4c0-2.4 2-4.4 4.4-4.4c2.5 0 4.5 2 4.5 4.4v117q-4.5-0.5-8.9-1.2v-20.3h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.4 2-4.4 4.5-4.4h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.5 2-4.5 4.5-4.5h13.9v-23.5c-58.6-1.4-107.6-42-121.7-96.5h-18c-2.5 0-4.5-2-4.5-4.4c0-2.5 2-4.5 4.5-4.5h16c-1.4-7.6-2.1-15.5-2.1-23.5v-3.3h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.4 2-4.4 4.5-4.4h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.4 2-4.4 4.5-4.4h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.4 2-4.4 4.5-4.4h14.2c2.2-16.1 15.9-28.5 32.6-28.5c18.1 0 32.8 14.8 32.8 32.9v2.5h13.9c2.5 0 4.5 2 4.5 4.5c0 2.4-2 4.4-4.5 4.4h-13.9v26.8h13.9c2.5 0 4.5 2 4.5 4.5c0 2.4-2 4.4-4.5 4.4h-13.9v17.8c0 33.7 26.7 61.3 60.1 63v-30.2h-13.9c-2.5 0-4.5-2-4.5-4.4c0-2.5 2-4.5 4.5-4.5h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.4c0-2.5 2-4.5 4.5-4.5h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.4c0-2.5 2-4.5 4.5-4.5h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.4 2-4.4 4.5-4.4h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.4 2-4.4 4.5-4.4h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.4 2-4.4 4.5-4.4h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.5 2-4.4 4.5-4.4h13.9v-26.8h-13.9c-2.5 0-4.5-2-4.5-4.5c0-2.5 2-4.5 4.5-4.5h14.1c2.2-23.9 22.4-42.6 46.9-42.6c26 0 47.1 21.1 47.1 47.1v13.4h13.9c2.4 0 4.4 2 4.4 4.5c0 2.4-2 4.4-4.4 4.4h-13.9v26.8h13.9c2.4 0 4.4 2 4.4 4.5c0 2.4-2 4.4-4.4 4.4h-13.9v26.8h13.9c2.4 0 4.4 2 4.4 4.5c0 2.4-2 4.4-4.4 4.4h-13.9v26.8h13.9c2.4 0 4.4 2 4.4 4.5c0 2.5-2 4.5-4.4 4.5h-13.9v26.7h13.9c2.4 0 4.4 2 4.4 4.5c0 2.5-2 4.5-4.4 4.5h-13.9v26.7h13.9c2.4 0 4.4 2 4.4 4.5c0 2.5-2 4.5-4.4 4.5h-13.9v26.8h13.9c2.4 0 4.4 2 4.4 4.4c0 2.5-2 4.5-4.4 4.5h-13.9v18.2c32.8-2.3 58.7-29.7 58.7-63v-8.8h-13.9c-2.4 0-4.4-2-4.4-4.4c0-2.5 2-4.5 4.4-4.5h13.9v-26.8h-13.9c-2.4 0-4.4-2-4.4-4.5c0-2.4 2-4.4 4.4-4.4h13.9v-26.8h-13.9c-2.4 0-4.4-2-4.4-4.5c0-2.4 2-4.4 4.4-4.4h13.9v-15.5c0-18.2 14.8-32.9 32.9-32.9c17.4 0 31.6 13.5 32.8 30.5h14c2.5 0 4.5 2 4.5 4.5c0 2.4-2 4.4-4.5 4.4h-13.9v26.8h13.9c2.5 0 4.5 2 4.5 4.5c0 2.5-2 4.5-4.5 4.5c0-0.1-13.9-0.1-13.9-0.1z"
        />
    </g>
);

// --- Main Page Component ---
export default function Canyon404({
    title = "Lost in the Canyon",
    subtitle = "Sorry, there's nothing to see here but code cacti :(",
    homeText = "go back home",
    errorCode = "404"
}: NotFoundProps) {

    const [p1, p2, p3, p4, p5, p6, p7] = useMouseParallax(-240, -150, -80, -20, 80, 150, 300);

    return (
        <div className="relative w-full min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden">
            {/* 1. Text Container */}
            <div className="relative z-[10] text-center mb-4 px-4 pointer-events-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-foreground text-[4rem] md:text-[5rem] font-black mb-4 tracking-tighter"
                >
                    {title}
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground font-medium tracking-wide mb-6"
                >
                    {subtitle}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Link href="/">
                        <a className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                            {homeText}
                        </a>
                    </Link>
                </motion.div>
            </div>

            {/* 2. Canyon SVG Parallax Engine */}
            <div className="absolute inset-0 z-[1] w-full h-full pointer-events-none select-none">
                <svg
                    viewBox='0 0 2000 720'
                    className='w-full h-full bg-muted/30'
                    preserveAspectRatio='xMidYMid slice'
                >
                    {/* Distant Peaks Path 1 */}
                    <path
                        style={{ transform: `translate(${p3.x}px,${p3.y}px)` }}
                        strokeWidth={5}
                        stroke="hsl(var(--border))"
                        fill="hsl(var(--muted))"
                        d="m1831 198l-8 565l-95 3v-576.3zm-441-42v633.1h-257v-622.1zm-340 36v597.3h-201.7v-596.3zm-246 20v531.7h-53v-534.7zm-136-20v575.1h-153.4v-576.3zm-348 3v574.7h-159v-566.8z"
                    />

                    {/* Sky Path 2 */}
                    <path
                        style={{ transform: `translate(${p3.x}px,${p3.y}px)` }}
                        fill="hsl(var(--background))"
                        d="m-203.5 227v-467.6h2433.1v553.6l-399.6-71l-102 29l-335-76l-258 80l-85-30l-202 32l-45-35l-50 19l-84-35l-154 61l-194-58l-160 58z"
                    />

                    {/* Group 1: Far Distance Cacti (p1) */}
                    <g style={{ transform: `translate(${p1.x}px,${p1.y}px)`, opacity: 0.1 }}>
                        <Cactus x={0} y={-350} scale={0.1} />
                        <Cactus x={300} y={-320} scale={0.1} />
                        <Cactus x={520} y={-360} scale={0.08} />
                        <Cactus x={800} y={-330} scale={0.1} />
                        <Cactus x={1000} y={-380} scale={0.08} />
                        <Cactus x={1150} y={-350} scale={0.1} />
                        <Cactus x={1400} y={-360} scale={0.1} />
                    </g>

                    {/* Group 2: Mid Distance Cacti (p2) */}
                    <g style={{ transform: `translate(${p2.x}px,${p2.y}px)`, opacity: 0.2 }}>
                        <Cactus x={80} y={-300} scale={0.15} />
                        <Cactus x={380} y={-280} scale={0.15} />
                        <Cactus x={600} y={-310} scale={0.1} />
                        <Cactus x={700} y={-290} scale={0.15} />
                        <Cactus x={1100} y={-320} scale={0.1} />
                        <Cactus x={1250} y={-300} scale={0.15} />
                        <Cactus x={1500} y={-310} scale={0.15} />
                    </g>

                    {/* Group 3: Canyon Top Cacti (p3) */}
                    <g style={{ transform: `translate(${p3.x}px,${p3.y}px)`, opacity: 0.3 }}>
                        <Cactus x={-110} y={-200} scale={0.2} />
                        <Cactus x={180} y={-180} scale={0.25} />
                        <Cactus x={800} y={-190} scale={0.2} />
                        <Cactus x={500} y={-230} scale={0.15} />
                        <Cactus x={1300} y={-220} scale={0.15} />
                        <Cactus x={1450} y={-200} scale={0.2} />
                    </g>

                    {/* Layer: Depth Fog Path */}
                    <path
                        style={{ transform: `translate(${p3.x}px,${p3.y}px)`, filter: 'blur(80px)' }}
                        fill="hsl(var(--muted) / 0.5)"
                        d='m-300,400 H2400 V700 H0 z'
                    />

                    {/* Layer: THE BIG 404 (p4) */}
                    <text
                        style={{
                            transform: `translate(${p4.x}px,${p4.y}px)`,
                            filter: 'drop-shadow(0 0 50px hsl(var(--primary) / 0.1))'
                        }}
                        x='1000' y='550'
                        textAnchor='middle'
                        fill="hsl(var(--muted-foreground) / 0.15)"
                        fontSize="660px"
                        fontWeight="900"
                    >
                        {errorCode}
                    </text>

                    {/* Layer: Foreground Canyon Floor (p5) */}
                    <path
                        style={{ transform: `translate(${p5.x}px,${p5.y}px)` }}
                        fill="hsl(var(--background))"
                        d="m2195 396v531.1h-2437.2v-538.1l359.2 60l96-22l63 44l169-40l83 39l348-47l147 28l125-32l75 47l75-21l221 28l263-75l109 31z"
                    />

                    {/* Group 5: Near Cacti (p5) */}
                    <g style={{ transform: `translate(${p5.x}px,${p5.y}px)` }}>
                        <Cactus x={0} y={80} scale={0.4} />
                        <Cactus x={1000} y={100} scale={0.45} />
                        <Cactus x={1450} y={80} scale={0.4} />
                    </g>

                    {/* Group 6: Very Near Blurry Cacti (p6) */}
                    <g style={{ transform: `translate(${p6.x}px,${p6.y}px)`, filter: 'blur(4px) brightness(0.8)' }}>
                        <Cactus x={100} y={180} scale={0.5} />
                        <Cactus x={700} y={200} scale={0.55} />
                        <Cactus x={1350} y={250} scale={0.5} />
                    </g>

                    {/* Group 7: Extreme Foreground Blurry Cacti (p7) */}
                    <g style={{ transform: `translate(${p7.x}px,${p7.y}px)`, filter: 'blur(8px) brightness(0.6)' }}>
                        <Cactus x={0} y={320} scale={0.6} />
                        <Cactus x={400} y={280} scale={0.65} />
                        <Cactus x={1400} y={350} scale={0.6} />
                    </g>
                </svg>
            </div>
        </div>
    );
}
