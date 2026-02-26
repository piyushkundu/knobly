import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Step 1: Get user's approximate location from IP
        const geoRes = await fetch('http://ip-api.com/json/?fields=lat,lon,city', {
            signal: AbortSignal.timeout(4000),
        });
        const geo = await geoRes.json();
        const lat = geo.lat || 28.6;  // Default: Delhi
        const lon = geo.lon || 77.2;
        const city = geo.city || '';

        // Step 2: Get weather from Open-Meteo (100% free, no API key)
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
            { signal: AbortSignal.timeout(4000) }
        );
        const weather = await weatherRes.json();
        const current = weather.current;

        return NextResponse.json({
            temp: current?.temperature_2m != null ? Math.round(current.temperature_2m) : null,
            code: current?.weather_code ?? 1,
            city: city,
        });
    } catch {
        return NextResponse.json({ temp: null, code: 1, city: '' });
    }
}
