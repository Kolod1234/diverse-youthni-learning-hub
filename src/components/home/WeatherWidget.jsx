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
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  const WeatherIcon = weather.temperature > 20 ? Sun : weather.weathercode > 50 ? CloudRain : Cloud;

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Weather</p>
          <p className="text-3xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Wind className="w-3 h-3" />
            {weather.windspeed} km/h
          </p>
        </div>
        <WeatherIcon className="w-12 h-12 text-blue-600" />
      </div>
    </Card>
  );
}