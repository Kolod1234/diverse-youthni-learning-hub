import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button, Card, CardContent as MuiCardContent, CardHeader as MuiCardHeader, TextField, Box, Typography } from '@mui/material';
const Input = ({ className, ...props }) => <TextField fullWidth size="small" className={className} {...props} />;
const Textarea = ({ className, ...props }) => <TextField fullWidth multiline rows={4} className={className} {...props} />;
const CardContent = ({ children, className, ...props }) => <MuiCardContent className={className} {...props}>{children}</MuiCardContent>;
const CardHeader = ({ children, className, ...props }) => <MuiCardHeader className={className} title={null} {...props}>{children}</MuiCardHeader>;
const CardTitle = ({ children, className }) => <Typography variant="h6" fontWeight={700} className={className}>{children}</Typography>;
const CardDescription = ({ children, className }) => <Typography variant="body2" color="text.secondary" className={className}>{children}</Typography>;
const Label = ({ children, className, htmlFor, ...props }) => <label htmlFor={htmlFor} className={className || 'block text-sm font-medium text-foreground mb-1'} {...props}>{children}</label>;
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SlideshowIcon from '@mui/icons-material/Slideshow';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Loader2 = _w(HourglassEmptyIcon), Plus = _w(AddIcon), X = _w(CloseIcon), ExternalLink = _w(OpenInNewIcon), Presentation = _w(SlideshowIcon);
import { toast } from 'sonner';

export default function CommunityEventSlides() {
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDate: '',
    eventLocation: '',
    description: '',
    organizer: '',
    agenda: ['']
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgendaChange = (index, value) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index] = value;
    setFormData(prev => ({ ...prev, agenda: newAgenda }));
  };

  const addAgendaItem = () => {
    setFormData(prev => ({ ...prev, agenda: [...prev.agenda, ''] }));
  };

  const removeAgendaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const handleGenerate = async () => {
    if (!formData.eventTitle) {
      toast.error('Please enter an event title');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCommunityEventSlides', {
        eventTitle: formData.eventTitle,
        eventDate: formData.eventDate,
        eventLocation: formData.eventLocation,
        description: formData.description,
        organizer: formData.organizer,
        agenda: formData.agenda.filter(item => item.trim() !== '')
      });

      if (response.data.success) {
        setGeneratedUrl(response.data.presentationUrl);
        toast.success('Community event slides created successfully!');
      } else {
        toast.error(response.data.error || 'Failed to create slides');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      eventTitle: '',
      eventDate: '',
      eventLocation: '',
      description: '',
      organizer: '',
      agenda: ['']
    });
    setGeneratedUrl(null);
  };

  return (
    <div className="min-h-screen bg-background dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Presentation className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-foreground dark:text-white">
              Community Event Slides
            </h1>
          </div>
          <p className="text-muted-foreground dark:text-gray-300">
            Create beautiful Google Slides presentations for your community events
          </p>
        </div>

        {generatedUrl ? (
          <Card className="shadow-lg">
            <CardHeader className="bg-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Presentation Created Successfully!
              </CardTitle>
              <CardDescription className="text-green-50">
                Your community event slides are ready
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-foreground dark:text-gray-300 mb-3">
                  Click the button below to open and edit your presentation in Google Slides
                </p>
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Slides
                </a>
              </div>
              <Button onClick={resetForm} variant="outline" className="w-full">
                Create Another Presentation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Fill in the details for your community event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title *</Label>
                <Input
                  id="eventTitle"
                  placeholder="e.g., Community Summer Festival"
                  value={formData.eventTitle}
                  onChange={(e) => handleChange('eventTitle', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    placeholder="e.g., June 15, 2024"
                    value={formData.eventDate}
                    onChange={(e) => handleChange('eventDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Location</Label>
                  <Input
                    id="eventLocation"
                    placeholder="e.g., Community Center"
                    value={formData.eventLocation}
                    onChange={(e) => handleChange('eventLocation', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your community event..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizer">Organized By</Label>
                <Input
                  id="organizer"
                  placeholder="e.g., Community Youth Center"
                  value={formData.organizer}
                  onChange={(e) => handleChange('organizer', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Agenda Items</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addAgendaItem}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                {formData.agenda.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Agenda item ${index + 1}`}
                      value={item}
                      onChange={(e) => handleAgendaChange(index, e.target.value)}
                    />
                    {formData.agenda.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeAgendaItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Slides...
                  </>
                ) : (
                  <>
                    <Presentation className="w-4 h-4 mr-2" />
                    Create Slides
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}