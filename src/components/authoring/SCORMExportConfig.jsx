import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Package } from 'lucide-react';

export default function SCORMExportConfig({ courseData, lessons, quizzes, onExport }) {
  const [config, setConfig] = useState({
    scormVersion: '2004',
    includeResources: true,
    includeQuizzes: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(config);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>Configure your SCORM package</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SCORM Version */}
          <div>
            <label className="block text-sm font-medium mb-2">SCORM Version</label>
            <div className="space-y-2">
              {['1.2', '2004'].map((version) => (
                <label key={version} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scormVersion"
                    value={version}
                    checked={config.scormVersion === version}
                    onChange={(e) => setConfig({ ...config, scormVersion: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span>
                    SCORM {version}
                    {version === '2004' && <span className="text-xs text-gray-500"> (Recommended)</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Include Options */}
          <div>
            <label className="block text-sm font-medium mb-2">Include in Package</label>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={config.includeResources}
                onChange={(e) => setConfig({ ...config, includeResources: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Course resources & media</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeQuizzes}
                onChange={(e) => setConfig({ ...config, includeQuizzes: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Assessments & quizzes</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Package Contents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Lessons:</span>
            <span className="font-medium">{lessons.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Assessments:</span>
            <span className="font-medium">{quizzes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Learning Objectives:</span>
            <span className="font-medium">{courseData?.learning_objectives?.length || 0}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-gray-600">SCORM Version:</span>
            <span className="font-medium">{config.scormVersion}</span>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting}
        size="lg"
        className="w-full flex items-center justify-center gap-2"
      >
        <Package className="w-5 h-5" />
        {isExporting ? 'Creating Package...' : 'Export SCORM Package'}
      </Button>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> The exported SCORM package can be imported into any LMS (Moodle, Canvas, Blackboard, etc.) that supports SCORM 1.2 or 2004 standards.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}