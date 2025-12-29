import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, CheckCircle, ArrowRight, Save, FileText, 
  Clock, Calendar, Award, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function YouthWorkWorkbook() {
  const [user, setUser] = useState(null);
  const [selectedQualification, setSelectedQualification] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [currentSection, setCurrentSection] = useState('overview');
  const [workbookData, setWorkbookData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: qualifications = [] } = useQuery({
    queryKey: ['youth-work-qualifications'],
    queryFn: () => base44.entities.YouthWorkQualification.filter({ is_published: true }, 'order', 50),
  });

  const saveProgressMutation = useMutation({
    mutationFn: (data) => {
      // Save workbook progress to database (you can create a WorkbookProgress entity)
      return fetch('/api/save', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      toast.success('Progress saved successfully!');
    },
  });

  const handleSave = () => {
    saveProgressMutation.mutate({
      user_email: user?.email,
      qualification_id: selectedQualification?.id,
      unit_index: selectedUnit,
      data: workbookData,
      last_section: currentSection,
    });
  };

  const updateWorkbookData = (key, value) => {
    setWorkbookData(prev => ({ ...prev, [key]: value }));
  };

  const selectedQual = qualifications.find(q => q.id === selectedQualification);
  const unit = selectedQual?.curriculum?.[selectedUnit];

  if (!selectedQualification) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Youth Work Interactive Workbook
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete your OCN Youth Work qualification with our digital workbook
            </p>
          </motion.div>

          <div className="grid gap-4">
            {qualifications.map((qual, idx) => (
              <motion.div
                key={qual.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300"
                  onClick={() => setSelectedQualification(qual.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          {qual.level}
                        </Badge>
                        <span className="text-sm text-gray-600">{qual.credit_value} Credits</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{qual.title}</h3>
                      <p className="text-gray-600">{qual.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {qual.curriculum?.length || 0} Units
                      </p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-purple-600" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedUnit === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button
            variant="outline"
            onClick={() => setSelectedQualification(null)}
            className="mb-6"
          >
            ← Back to Qualifications
          </Button>

          <div className="bg-gradient-to-r from-purple-700 to-pink-700 text-white rounded-2xl p-8 mb-8">
            <Badge className="bg-white text-purple-700 mb-4">{selectedQual?.level}</Badge>
            <h1 className="text-3xl font-bold mb-2">{selectedQual?.title}</h1>
            <p className="text-purple-100">{selectedQual?.description}</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Unit to Begin</h2>

          <div className="grid gap-4">
            {selectedQual?.curriculum?.map((unit, idx) => (
              <Card
                key={idx}
                className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300"
                onClick={() => setSelectedUnit(idx)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline">Unit {idx + 1}</Badge>
                      <Badge variant="outline">{unit.credits} Credits</Badge>
                      <Badge variant="outline">{unit.level}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{unit.unit_title}</h3>
                    {unit.unit_code && (
                      <p className="text-sm text-gray-500 mb-3">Code: {unit.unit_code}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {unit.learning_outcomes?.length || 0} Learning Outcomes
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-purple-600 flex-shrink-0 mt-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Workbook Interface
  const progress = Object.keys(workbookData).length / 10 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedUnit(null)}
          >
            ← Back to Units
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
        </div>

        {/* Workbook Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-t-2xl p-1">
          <div className="bg-gradient-to-r from-purple-800 to-purple-900 text-white rounded-t-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="bg-white text-purple-700 mb-3">
                  Unit {selectedUnit + 1} of {selectedQual?.curriculum?.length}
                </Badge>
                <h1 className="text-2xl font-bold mb-2">{unit?.unit_title}</h1>
                <p className="text-purple-200 text-sm">Code: {unit?.unit_code}</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-lg p-3">
                  <Award className="w-6 h-6 mb-1 mx-auto" />
                  <p className="text-sm font-semibold">{unit?.credits} Credits</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 border-x-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Your Progress</span>
            <span className="text-sm font-semibold text-purple-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="border-2 border-purple-200">
          <Tabs value={currentSection} onValueChange={setCurrentSection}>
            <TabsList className="w-full justify-start bg-purple-50 border-b-2 border-purple-200 rounded-none p-0">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:border-b-4 data-[state=active]:border-purple-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="learning" className="data-[state=active]:bg-white data-[state=active]:border-b-4 data-[state=active]:border-purple-600">
                Learning Outcomes
              </TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:bg-white data-[state=active]:border-b-4 data-[state=active]:border-purple-600">
                Activities
              </TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-white data-[state=active]:border-b-4 data-[state=active]:border-purple-600">
                Evidence
              </TabsTrigger>
              <TabsTrigger value="reflection" className="data-[state=active]:bg-white data-[state=active]:border-b-4 data-[state=active]:border-purple-600">
                Reflection
              </TabsTrigger>
            </TabsList>

            <div className="p-8">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-600">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Learning Outcomes
                    </h3>
                    <ul className="space-y-2">
                      {unit?.learning_outcomes?.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span className="text-sm">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                      <Clock className="w-8 h-8 text-blue-600 mb-2" />
                      <p className="text-sm text-gray-600">Estimated Time</p>
                      <p className="text-xl font-bold text-gray-900">4-6 weeks</p>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                      <Award className="w-8 h-8 text-green-600 mb-2" />
                      <p className="text-sm text-gray-600">Credits</p>
                      <p className="text-xl font-bold text-gray-900">{unit?.credits}</p>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                      <FileText className="w-8 h-8 text-purple-600 mb-2" />
                      <p className="text-sm text-gray-600">Level</p>
                      <p className="text-xl font-bold text-gray-900">{unit?.level}</p>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Learning Outcomes Tab */}
              <TabsContent value="learning" className="mt-0">
                <div className="space-y-6">
                  <div className="bg-purple-800 text-white rounded-t-xl p-4">
                    <h3 className="font-bold">Assessment Criteria</h3>
                  </div>
                  <div className="border-2 border-purple-200 rounded-b-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-purple-50">
                        <tr>
                          <th className="text-left p-3 border-b-2 border-purple-200">Learning Outcome</th>
                          <th className="text-left p-3 border-b-2 border-purple-200">Assessment Criteria</th>
                          <th className="text-center p-3 border-b-2 border-purple-200 w-32">Achieved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unit?.learning_outcomes?.map((outcome, idx) => (
                          <tr key={idx} className="border-b border-purple-100">
                            <td className="p-3 align-top">
                              <Badge variant="outline" className="mb-2">LO {idx + 1}</Badge>
                              <p className="text-sm">{outcome}</p>
                            </td>
                            <td className="p-3">
                              <Textarea
                                placeholder="Describe how you will demonstrate this outcome..."
                                value={workbookData[`criteria_${idx}`] || ''}
                                onChange={(e) => updateWorkbookData(`criteria_${idx}`, e.target.value)}
                                className="min-h-[100px]"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={workbookData[`achieved_${idx}`] || false}
                                onChange={(e) => updateWorkbookData(`achieved_${idx}`, e.target.checked)}
                                className="w-5 h-5 text-purple-600"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="mt-0">
                <div className="space-y-6">
                  <div className="bg-purple-800 text-white rounded-t-xl p-4">
                    <h3 className="font-bold">Activity Planning & Delivery</h3>
                  </div>
                  
                  <Card className="p-6 border-2 border-purple-200">
                    <h4 className="font-semibold mb-4">Activity Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activity Title
                        </label>
                        <Input
                          placeholder="Enter activity title..."
                          value={workbookData.activity_title || ''}
                          onChange={(e) => updateWorkbookData('activity_title', e.target.value)}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                          </label>
                          <Input
                            type="date"
                            value={workbookData.activity_date || ''}
                            onChange={(e) => updateWorkbookData('activity_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration
                          </label>
                          <Input
                            placeholder="e.g., 2 hours"
                            value={workbookData.activity_duration || ''}
                            onChange={(e) => updateWorkbookData('activity_duration', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activity Description
                        </label>
                        <Textarea
                          placeholder="Describe the activity in detail..."
                          value={workbookData.activity_description || ''}
                          onChange={(e) => updateWorkbookData('activity_description', e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resources Required
                        </label>
                        <Textarea
                          placeholder="List all resources needed..."
                          value={workbookData.activity_resources || ''}
                          onChange={(e) => updateWorkbookData('activity_resources', e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Evidence Tab */}
              <TabsContent value="evidence" className="mt-0">
                <div className="space-y-6">
                  <div className="bg-purple-800 text-white rounded-t-xl p-4">
                    <h3 className="font-bold">Evidence Collection</h3>
                  </div>

                  <Card className="p-6 border-2 border-purple-200">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Evidence Type
                        </label>
                        <Select
                          value={workbookData.evidence_type || ''}
                          onValueChange={(value) => updateWorkbookData('evidence_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select evidence type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="observation">Observation Report</SelectItem>
                            <SelectItem value="witness">Witness Testimony</SelectItem>
                            <SelectItem value="product">Product Evidence</SelectItem>
                            <SelectItem value="professional">Professional Discussion</SelectItem>
                            <SelectItem value="portfolio">Portfolio Work</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Evidence Description
                        </label>
                        <Textarea
                          placeholder="Describe your evidence and how it demonstrates competence..."
                          value={workbookData.evidence_description || ''}
                          onChange={(e) => updateWorkbookData('evidence_description', e.target.value)}
                          className="min-h-[150px]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Link to Learning Outcomes
                        </label>
                        <Textarea
                          placeholder="Explain which learning outcomes this evidence covers..."
                          value={workbookData.evidence_outcomes || ''}
                          onChange={(e) => updateWorkbookData('evidence_outcomes', e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Reflection Tab */}
              <TabsContent value="reflection" className="mt-0">
                <div className="space-y-6">
                  <div className="bg-purple-800 text-white rounded-t-xl p-4">
                    <h3 className="font-bold">Personal Reflection</h3>
                  </div>

                  <Card className="p-6 border-2 border-purple-200">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          What went well?
                        </h4>
                        <Textarea
                          placeholder="Reflect on what worked well in your practice..."
                          value={workbookData.reflection_well || ''}
                          onChange={(e) => updateWorkbookData('reflection_well', e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          What challenges did you face?
                        </h4>
                        <Textarea
                          placeholder="Describe any difficulties or challenges..."
                          value={workbookData.reflection_challenges || ''}
                          onChange={(e) => updateWorkbookData('reflection_challenges', e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          What would you do differently?
                        </h4>
                        <Textarea
                          placeholder="Consider how you could improve your practice..."
                          value={workbookData.reflection_improve || ''}
                          onChange={(e) => updateWorkbookData('reflection_improve', e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          How has this developed your practice?
                        </h4>
                        <Textarea
                          placeholder="Reflect on your professional development..."
                          value={workbookData.reflection_development || ''}
                          onChange={(e) => updateWorkbookData('reflection_development', e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedUnit(Math.max(0, selectedUnit - 1))} disabled={selectedUnit === 0}>
            ← Previous Unit
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedUnit(Math.min(selectedQual.curriculum.length - 1, selectedUnit + 1))}
            disabled={selectedUnit === selectedQual.curriculum.length - 1}
          >
            Next Unit →
          </Button>
        </div>
      </div>
    </div>
  );
}