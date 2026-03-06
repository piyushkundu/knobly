import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'IoT — Internet of Things Guide | Sensors, Arduino, Applications',
    description: 'Internet of Things (IoT) complete guide — IoT architecture, sensors, actuators, Arduino, Raspberry Pi, smart devices, applications, aur protocols. Hindi + English mein.',
    keywords: ['IoT', 'Internet of Things', 'IoT Hindi', 'Arduino', 'Raspberry Pi', 'IoT sensors', 'smart devices', 'O-Level IoT', 'M4-R5'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
