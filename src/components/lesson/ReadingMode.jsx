import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, SkipForward, SkipBack } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReadingMode({ content }) {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !voice) {
        setVoice(availableVoices[0]);
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;
  }, []);

  const startReading = () => {
    if (!content) return;
    
    const synth = window.speechSynthesis;
    const text = typeof content === 'string' ? content : content.textContent;
    
    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.voice = voice;
    newUtterance.rate = rate;
    
    newUtterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
    };
    
    setUtterance(newUtterance);
    synth.speak(newUtterance);
    setIsReading(true);
  };

  const pauseReading = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeReading = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {!isReading ? (
            <Button size="sm" onClick={startReading} className="gap-2">
              <Volume2 className="w-4 h-4" />
              Read Aloud
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button size="sm" onClick={resumeReading} className="gap-2">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              ) : (
                <Button size="sm" onClick={pauseReading} className="gap-2">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={stopReading}>
                <VolumeX className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Speed:</span>
            <Slider
              value={[rate]}
              onValueChange={([val]) => setRate(val)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-24"
            />
            <span className="text-sm font-medium w-8">{rate}x</span>
          </div>

          <Select value={voice?.name} onValueChange={(name) => {
            const selected = voices.find(v => v.name === name);
            setVoice(selected);
          }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.slice(0, 10).map((v) => (
                <SelectItem key={v.name} value={v.name}>
                  {v.name.split(' ')[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}