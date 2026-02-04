import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const StatsPanel = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("http://localhost:8000/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                // Silently fail or log debug
                // console.debug("Stats fetch failed");
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!stats) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-6 right-6 w-64 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden"
        >
            {/* Header */}
            <div className="bg-red-700 p-2 text-center">
                <h3 className="text-[10px] uppercase tracking-widest text-white font-bold">
                    Success Metrics
                </h3>
            </div>

            <div className="p-4 space-y-3">
                {/* Reliability */}
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <span>🛡️</span> Reliability
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                        {stats.reliability}%
                    </span>
                </div>

                {/* Energy */}
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <span>⚡</span> Energy
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                        {stats.energy_saved}
                    </span>
                </div>

                {/* Satisfaction */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-2 font-bold text-gray-600">😊 Pax</span>
                        <span className="font-bold text-gray-800">{Math.round(stats.satisfaction)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${stats.satisfaction > 90 ? 'bg-green-500' : stats.satisfaction < 80 ? 'bg-red-500' : 'bg-yellow-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.satisfaction}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Vetoes */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        Physics Vetoes
                    </span>
                    <span className="font-mono text-sm font-bold text-red-600">
                        {stats.veto_count}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default StatsPanel;
