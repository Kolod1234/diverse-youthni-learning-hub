import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function CourseBasicInfo({ courseData, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...courseData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">Course Title *</Label>
        <Input
          id="title"
          value={courseData?.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., GCSE Mathematics Foundation"
          className="mt-2"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={courseData?.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Course overview and summary"
          rows={4}
          className="w-full border border-input rounded-md p-3 mt-2"
        />
      </div>

      {/* Instructor */}
      <div>
        <Label htmlFor="instructor">Instructor Name</Label>
        <Input
          id="instructor"
          value={courseData?.instructor || ''}
          onChange={(e) => handleChange('instructor', e.target.value)}
          placeholder="e.g., John Smith"
          className="mt-2"
        />
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={courseData?.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full border border-input rounded-md p-2 mt-2"
        >
          <option value="">Select a category</option>
          <option value="mathematics">Mathematics</option>
          <option value="english">English</option>
          <option value="science">Science</option>
          <option value="history">History</option>
          <option value="geography">Geography</option>
        </select>
      </div>

      {/* Level */}
      <div>
        <Label htmlFor="level">Level</Label>
        <select
          id="level"
          value={courseData?.level || 'beginner'}
          onChange={(e) => handleChange('level', e.target.value)}
          className="w-full border border-input rounded-md p-2 mt-2"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Duration */}
      <div>
        <Label htmlFor="duration">Duration (hours)</Label>
        <Input
          id="duration"
          type="number"
          min="0"
          value={courseData?.duration_hours || ''}
          onChange={(e) => handleChange('duration_hours', parseFloat(e.target.value))}
          placeholder="e.g., 40"
          className="mt-2"
        />
      </div>

      {/* Exam Board (for GCSE) */}
      <div>
        <Label htmlFor="exam_board">Exam Board</Label>
        <select
          id="exam_board"
          value={courseData?.exam_board || ''}
          onChange={(e) => handleChange('exam_board', e.target.value)}
          className="w-full border border-input rounded-md p-2 mt-2"
        >
          <option value="">Select exam board</option>
          <option value="CCEA">CCEA</option>
          <option value="AQA">AQA</option>
          <option value="Edexcel">Edexcel</option>
          <option value="OCR">OCR</option>
        </select>
      </div>

      {/* SCORM Metadata */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">SCORM Metadata</h3>
        
        <div>
          <Label htmlFor="scorm_identifier">Unique Identifier</Label>
          <Input
            id="scorm_identifier"
            value={courseData?.scorm_identifier || `course_${Date.now()}`}
            readOnly
            disabled
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">Auto-generated SCORM identifier</p>
        </div>
      </div>
    </div>
  );
}