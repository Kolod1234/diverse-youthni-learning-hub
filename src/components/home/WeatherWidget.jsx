import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, Wind, CloudSnow, CloudDrizzle } from 'lucide-react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
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
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 relative overflow-hidden">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
          <div className="h-8 bg-slate-700 rounded w-16"></div>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  const getWeatherDetails = () => {
    const temp = weather.temperature;
    const code = weather.weathercode;
    
    if (code >= 71 && code <= 77) {
      return { icon: CloudSnow, bg: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80', name: 'Snowy' };
    } else if (code >= 51 || (code >= 61 && code <= 67)) {
      return { icon: CloudRain, bg: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&q=80', name: 'Rainy' };
    } else if (code >= 80) {
      return { icon: CloudRain, bg: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&q=80', name: 'Stormy' };
    } else if (temp > 20 && code < 3) {
      return { icon: Sun, bg: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=600&q=80', name: 'Sunny' };
    } else if (code < 3) {
      return { icon: Cloud, bg: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&q=80', name: 'Cloudy' };
    }
    return { icon: Cloud, bg: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&q=80', name: 'Clear' };
  };

  const { icon: WeatherIcon, bg: backgroundImage, name: weatherName } = getWeatherDetails();

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <img src={backgroundImage} alt={weatherName} className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80" />
      
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-300 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Weather
          </p>
          <p className="text-3xl font-bold text-white">{Math.round(weather.temperature)}°C</p>
          <p className="text-sm text-slate-300 mt-1">{weatherName}</p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Wind className="w-3 h-3" />
            {weather.windspeed} km/h
          </p>
        </div>
        <WeatherIcon className="w-16 h-16 text-white drop-shadow-lg" />
      </div>
    </Card>
  );
}