import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Cloud, Sun, CloudRain, Wind, CloudSnow, Droplets, Gauge, AlertTriangle, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { activateOnKey } from '@/lib/a11y';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&forecast_days=3`
              );
              const data = await response.json();
              
              // Get location name
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const geoData = await geoResponse.json();
              
              setWeather({ ...data, location: geoData.address?.city || geoData.address?.town || 'Unknown' });
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
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 relative overflow-hidden cursor-pointer">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
          <div className="h-8 bg-slate-700 rounded w-16"></div>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  const getWeatherDetails = (code) => {
    if (code >= 71 && code <= 77) {
      return { icon: CloudSnow, bg: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80', name: 'Snowy' };
    } else if (code >= 51 || (code >= 61 && code <= 67)) {
      return { icon: CloudRain, bg: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&q=80', name: 'Rainy' };
    } else if (code >= 80) {
      return { icon: CloudRain, bg: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&q=80', name: 'Stormy' };
    } else if (weather.current.temperature_2m > 20 && code < 3) {
      return { icon: Sun, bg: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=600&q=80', name: 'Sunny' };
    } else if (code < 3) {
      return { icon: Cloud, bg: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&q=80', name: 'Cloudy' };
    }
    return { icon: Cloud, bg: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&q=80', name: 'Clear' };
  };

  const { icon: WeatherIcon, bg: backgroundImage, name: weatherName } = getWeatherDetails(weather.current.weather_code);
  const currentHour = new Date().getHours();

  return (
    <>
      <Card role="button" tabIndex={0} onKeyDown={activateOnKey} 
        onClick={() => setShowDetails(true)}
        className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
      >
        <div className="absolute inset-0 opacity-30">
          <img src={backgroundImage} alt={weatherName} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80" />
        
        <div className="relative">
          <p className="text-xs text-slate-300 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Weather
          </p>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-3xl font-bold text-white">{Math.round(weather.current.temperature_2m)}°C</p>
              <p className="text-sm text-slate-300">{weatherName}</p>
            </div>
            <WeatherIcon className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-red-400" />
              {Math.round(weather.daily.temperature_2m_max[0])}°
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-blue-400" />
              {Math.round(weather.daily.temperature_2m_min[0])}°
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              {Math.round(weather.current.wind_speed_10m)} km/h
            </span>
          </div>
        </div>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              {weather.location} Weather
              <span className="text-xs text-slate-400 ml-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Updated {new Date().toLocaleTimeString()}
              </span>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Temperature</span>
                    <WeatherIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold">{Math.round(weather.current.temperature_2m)}°C</p>
                  <p className="text-xs text-slate-500 mt-1">Feels like {Math.round(weather.current.temperature_2m - 2)}°C</p>
                </Card>

                <Card className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Precipitation</span>
                    <Droplets className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold">{weather.current.precipitation || 0} mm</p>
                  <p className="text-xs text-slate-500 mt-1">Last hour</p>
                </Card>

                <Card className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Wind Speed</span>
                    <Wind className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold">{Math.round(weather.current.wind_speed_10m)} km/h</p>
                  <p className="text-xs text-slate-500 mt-1">10m height</p>
                </Card>

                <Card className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Humidity</span>
                    <Droplets className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold">{weather.current.relative_humidity_2m}%</p>
                  <p className="text-xs text-slate-500 mt-1">Relative</p>
                </Card>
              </div>

              <Card className="p-4 bg-slate-800 border-slate-700">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  3-Day Forecast
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map(day => {
                    const date = new Date();
                    date.setDate(date.getDate() + day);
                    const dayDetails = getWeatherDetails(weather.daily.weather_code[day]);
                    const DayIcon = dayDetails.icon;
                    return (
                      <div key={day} className="text-center p-3 bg-slate-900 rounded-lg">
                        <p className="text-xs text-slate-400 mb-2">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <DayIcon className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                        <p className="text-sm font-semibold">{Math.round(weather.daily.temperature_2m_max[day])}° / {Math.round(weather.daily.temperature_2m_min[day])}°</p>
                        <p className="text-xs text-slate-500 mt-1">{weather.daily.precipitation_sum[day] || 0}mm rain</p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="hourly" className="space-y-4">
              <Card className="p-4 bg-slate-800 border-slate-700">
                <h3 className="font-semibold mb-3">Next 24 Hours</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {weather.hourly.temperature_2m.slice(currentHour, currentHour + 24).map((temp, idx) => {
                    const hour = (currentHour + idx) % 24;
                    const hourDetails = getWeatherDetails(weather.hourly.weather_code[currentHour + idx]);
                    const HourIcon = hourDetails.icon;
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded">
                        <span className="text-sm text-slate-400 w-16">{hour}:00</span>
                        <HourIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-semibold w-16 text-right">{Math.round(temp)}°C</span>
                        <span className="text-xs text-slate-500 w-16 text-right">{weather.hourly.precipitation_probability[currentHour + idx]}% rain</span>
                        <span className="text-xs text-slate-500 w-20 text-right">{Math.round(weather.hourly.wind_speed_10m[currentHour + idx])} km/h</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Pressure</span>
                  </div>
                  <p className="text-2xl font-bold">{Math.round(weather.current.pressure_msl)} hPa</p>
                  <p className="text-xs text-slate-500 mt-1">Mean sea level</p>
                </Card>

                <Card className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Humidity</span>
                  </div>
                  <p className="text-2xl font-bold">{weather.current.relative_humidity_2m}%</p>
                  <p className="text-xs text-slate-500 mt-1">Relative humidity</p>
                </Card>

                <Card className="p-4 bg-slate-800 border-slate-700 col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Wind className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Wind Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Current Speed</p>
                      <p className="text-xl font-bold">{Math.round(weather.current.wind_speed_10m)} km/h</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Max Today</p>
                      <p className="text-xl font-bold">{Math.round(Math.max(...weather.hourly.wind_speed_10m.slice(0, 24)))} km/h</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-yellow-900/20 border-yellow-700 col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold text-yellow-400">Weather Info</span>
                  </div>
                  <p className="text-sm text-slate-300">Live weather data provided by Open-Meteo API. Updates every 5 minutes.</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}