import { useState } from 'react';
import { Camera, MapPin, Mic, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

interface IssueReportFormProps {
  onSubmit: (issue: any) => void;
}

export function IssueReportForm({ onSubmit }: IssueReportFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    photos: [] as string[],
    voiceNote: null as string | null,
  });

  const [isRecording, setIsRecording] = useState(false);

  const categories = [
    'Road & Traffic',
    'Water & Sanitation',
    'Electricity',
    'Waste Management',
    'Public Safety',
    'Parks & Recreation',
    'Building & Construction',
    'Other'
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Simulate photo upload - in real app, would upload to server
      const newPhotos = Array.from(files).map((_, index) => 
        `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&h=200&fit=crop&crop=center`
      );
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 3) // Max 3 photos
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Simulate voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setFormData(prev => ({ ...prev, voiceNote: 'voice-recording.mp3' }));
      }, 3000);
    }
  };

  const getCurrentLocation = () => {
    // Simulate getting current location
    setFormData(prev => ({
      ...prev,
      location: 'Current Location: Connaught Place, New Delhi'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const issue = {
      ...formData,
      id: Date.now().toString(),
      status: 'submitted',
      timestamp: new Date().toISOString(),
      priority: 'medium',
      upvotes: 0
    };
    onSubmit(issue);
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      photos: [],
      voiceNote: null,
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Report an Issue</h2>
        <p className="text-muted-foreground">Help improve your community by reporting civic issues</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Issue Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Issue Title *</Label>
          <Input
            id="title"
            placeholder="Brief description of the issue"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="h-12 text-base"
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Select issue category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="text-base py-3">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Detailed Description *</Label>
          <Textarea
            id="description"
            placeholder="Provide detailed information about the issue"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-24 text-base"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="flex gap-2">
            <Input
              id="location"
              placeholder="Enter address or landmark"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="h-12 text-base flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={getCurrentLocation}
              className="h-12 px-4"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>Photos (Optional)</Label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img 
                    src={photo} 
                    alt={`Issue photo ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            {formData.photos.length < 3 && (
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  className="h-12"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photos ({formData.photos.length}/3)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Voice Note */}
        <div className="space-y-2">
          <Label>Voice Note (Optional)</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              onClick={handleVoiceRecord}
              className="h-12"
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? 'Recording... (3s)' : 'Record Voice Note'}
            </Button>
            {formData.voiceNote && (
              <Badge variant="secondary" className="px-3 py-1">
                Voice note recorded
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-4 w-4 p-0"
                  onClick={() => setFormData(prev => ({ ...prev, voiceNote: null }))}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 text-base"
          disabled={!formData.title || !formData.description || !formData.category}
        >
          <Upload className="w-4 h-4 mr-2" />
          Submit Report
        </Button>
      </form>
    </Card>
  );
}