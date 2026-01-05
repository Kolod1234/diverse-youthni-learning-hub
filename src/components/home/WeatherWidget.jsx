import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user location and fetch weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            );
            const data = await response.json();
            setWeather(data.current_weather);
          } catch (error) {
            console.error('Weather fetch error:', error);
          } finally {
            setLoading(false);
          }
        },
        () => setLoading(false)
      );
    }
  }, []);

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
          <div className="h-8 bg-slate-700 rounded w-16"></div>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  const WeatherIcon = weather.temperature > 20 ? Sun : weather.weathercode > 50 ? CloudRain : Cloud;

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-1">Weather</p>
          <p className="text-3xl font-bold text-white">{Math.round(weather.temperature)}°C</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Wind className="w-3 h-3" />
            {weather.windspeed} km/h
          </p>
        </div>
        <WeatherIcon className="w-12 h-12 text-blue-400" />
      </div>
    </Card>
  );
}