'use client';

import Link from 'next/link';

const IOT_TOPICS = [
    {
        title: 'Introduction to IoT',
        icon: 'ph-bold ph-wifi-high',
        color: 'text-orange-400',
        gradient: 'from-orange-500 to-amber-500',
        items: [
            'Definition and concept of Internet of Things',
            'History and evolution of IoT',
            'IoT architecture and layers',
            'Difference between IoT and M2M',
            'IoT ecosystem components',
        ],
    },
    {
        title: 'IoT Devices & Sensors',
        icon: 'ph-bold ph-cpu',
        color: 'text-cyan-400',
        gradient: 'from-cyan-500 to-blue-500',
        items: [
            'Types of sensors: Temperature, Humidity, Motion, Light',
            'Actuators and their role in IoT',
            'Microcontrollers: Arduino, Raspberry Pi, ESP32',
            'Single Board Computers (SBC)',
            'Wearable IoT devices',
        ],
    },
    {
        title: 'Communication Protocols',
        icon: 'ph-bold ph-broadcast',
        color: 'text-purple-400',
        gradient: 'from-purple-500 to-indigo-500',
        items: [
            'MQTT (Message Queuing Telemetry Transport)',
            'CoAP (Constrained Application Protocol)',
            'HTTP/HTTPS in IoT',
            'Bluetooth, Zigbee, Z-Wave',
            'LoRaWAN and NB-IoT',
        ],
    },
    {
        title: 'IoT Applications',
        icon: 'ph-bold ph-buildings',
        color: 'text-emerald-400',
        gradient: 'from-emerald-500 to-green-500',
        items: [
            'Smart Home automation',
            'Healthcare and wearable health monitors',
            'Industrial IoT (IIoT) and Smart Manufacturing',
            'Smart Agriculture and precision farming',
            'Smart Cities: traffic, waste, energy management',
        ],
    },
    {
        title: 'IoT Security',
        icon: 'ph-bold ph-shield-check',
        color: 'text-red-400',
        gradient: 'from-red-500 to-rose-500',
        items: [
            'Security challenges in IoT',
            'Common vulnerabilities and attacks',
            'Authentication and encryption methods',
            'Secure communication protocols',
            'Privacy concerns and data protection',
        ],
    },
    {
        title: 'Cloud & Data in IoT',
        icon: 'ph-bold ph-cloud',
        color: 'text-sky-400',
        gradient: 'from-sky-500 to-blue-500',
        items: [
            'Cloud computing for IoT',
            'IoT data collection and storage',
            'Big Data analytics in IoT',
            'Edge computing vs Cloud computing',
            'Real-time data processing',
        ],
    },
];

export default function IoTPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#0f172a] overflow-y-auto">
            <header className="sticky top-0 z-50 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                            Internet of Things
                        </h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">O Level — Module 4</p>
                    </div>
                    <Link href="/" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all">
                        ← Home
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {IOT_TOPICS.map((topic) => (
                        <div key={topic.title} className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-orange-500/20 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <i className={`${topic.icon} text-2xl ${topic.color}`} />
                                <h2 className="text-base font-bold text-white">{topic.title}</h2>
                            </div>
                            <ul className="space-y-2">
                                {topic.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${topic.gradient} shrink-0`} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
