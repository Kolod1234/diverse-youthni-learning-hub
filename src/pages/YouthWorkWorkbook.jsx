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
    <div className="min-h-screen bg-gray-50">
      {/* Decorative Border */}
      <div className="fixed left-0 top-0 bottom-0 w-16 bg-gradient-to-b from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 opacity-90 hidden lg:block" />
      <div className="fixed right-0 top-0 bottom-0 w-16 bg-gradient-to-b from-purple-500 via-indigo-500 via-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-90 hidden lg:block" />
      
      <div className="lg:px-20 px-4">
        <div className="max-w-5xl mx-auto py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedUnit(null)}
              className="border-2"
            >
              ← Back to Units
            </Button>
            <Button onClick={handleSave} className="bg-[#5B2C6F] hover:bg-[#4A2359] text-white shadow-lg">
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </div>

          {/* Workbook Header */}
          <div className="relative mb-6">
            {/* Yellow accent strip */}
            <div className="absolute -left-4 lg:-left-12 top-0 bottom-0 w-8 bg-gradient-to-b from-yellow-400 to-amber-500" />
            
            <div className="bg-[#5B2C6F] text-white shadow-xl relative overflow-hidden">
              {/* Geometric pattern overlay */}
              <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white transform rotate-45 translate-x-16 -translate-y-16" />
                <div className="absolute bottom-0 right-16 w-24 h-24 bg-white transform rotate-12" />
              </div>
              
              <div className="relative p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="inline-block bg-amber-400 text-[#5B2C6F] px-4 py-1 rounded-full mb-4 font-bold text-sm">
                      Unit {selectedUnit + 1} of {selectedQual?.curriculum?.length}
                    </div>
                    <h1 className="text-3xl font-bold mb-3">{unit?.unit_title}</h1>
                    <p className="text-purple-200 text-sm mb-2">Assessment Criteria</p>
                    <p className="text-white font-mono text-xs bg-white/10 inline-block px-3 py-1 rounded">
                      Code: {unit?.unit_code}
                    </p>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 ml-4">
                    <Award className="w-8 h-8 mb-2 mx-auto text-amber-400" />
                    <p className="text-2xl font-bold">{unit?.credits}</p>
                    <p className="text-xs text-purple-200">Credits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white shadow-md relative mb-6">
            <div className="absolute -left-4 lg:-left-12 top-0 bottom-0 w-8 bg-gradient-to-b from-amber-500 to-yellow-400" />
            <div className="p-6 border-l-4 border-[#5B2C6F]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-900">Your Progress</span>
                <span className="text-lg font-bold text-[#5B2C6F]">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white shadow-xl relative">
            <div className="absolute -left-4 lg:-left-12 top-0 bottom-0 w-8 bg-gradient-to-b from-yellow-400 to-amber-500" />
            
            <Tabs value={currentSection} onValueChange={setCurrentSection}>
              <TabsList className="w-full justify-start bg-[#5B2C6F] rounded-none p-0 h-auto">
                <TabsTrigger value="overview" className="data-[state=active]:bg-amber-400 data-[state=active]:text-[#5B2C6F] text-white font-semibold px-6 py-4 rounded-none data-[state=active]:shadow-lg">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="learning" className="data-[state=active]:bg-amber-400 data-[state=active]:text-[#5B2C6F] text-white font-semibold px-6 py-4 rounded-none data-[state=active]:shadow-lg">
                  Learning Outcomes
                </TabsTrigger>
                <TabsTrigger value="activities" className="data-[state=active]:bg-amber-400 data-[state=active]:text-[#5B2C6F] text-white font-semibold px-6 py-4 rounded-none data-[state=active]:shadow-lg">
                  Activities
                </TabsTrigger>
                <TabsTrigger value="evidence" className="data-[state=active]:bg-amber-400 data-[state=active]:text-[#5B2C6F] text-white font-semibold px-6 py-4 rounded-none data-[state=active]:shadow-lg">
                  Evidence
                </TabsTrigger>
                <TabsTrigger value="reflection" className="data-[state=active]:bg-amber-400 data-[state=active]:text-[#5B2C6F] text-white font-semibold px-6 py-4 rounded-none data-[state=active]:shadow-lg">
                  Reflection
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-8 mt-0">
                <div className="bg-purple-50 rounded-lg p-6 border-l-8 border-[#5B2C6F] mb-6">
                  <h3 className="font-bold text-[#5B2C6F] mb-4 flex items-center gap-2 text-lg">
                    <Target className="w-6 h-6" />
                    Learning Outcomes
                  </h3>
                  <ul className="space-y-3">
                    {unit?.learning_outcomes?.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-800">
                        <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-[#5B2C6F]">{idx + 1}</span>
                        </div>
                        <span className="text-sm leading-relaxed">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-5 border-2 border-[#5B2C6F] bg-white shadow-md">
                    <Clock className="w-10 h-10 text-[#5B2C6F] mb-3" />
                    <p className="text-xs font-semibold text-gray-600 uppercase">Estimated Time</p>
                    <p className="text-2xl font-bold text-[#5B2C6F]">4-6 weeks</p>
                  </Card>
                  <Card className="p-5 border-2 border-amber-400 bg-amber-50 shadow-md">
                    <Award className="w-10 h-10 text-[#5B2C6F] mb-3" />
                    <p className="text-xs font-semibold text-gray-600 uppercase">Credits</p>
                    <p className="text-2xl font-bold text-[#5B2C6F]">{unit?.credits}</p>
                  </Card>
                  <Card className="p-5 border-2 border-[#5B2C6F] bg-white shadow-md">
                    <FileText className="w-10 h-10 text-[#5B2C6F] mb-3" />
                    <p className="text-xs font-semibold text-gray-600 uppercase">Level</p>
                    <p className="text-2xl font-bold text-[#5B2C6F]">{unit?.level}</p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="learning" className="p-8 mt-0">
                <div className="bg-[#5B2C6F] text-white px-6 py-4 -mx-8 -mt-8 mb-6">
                  <h3 className="font-bold text-lg">Assessment Criteria</h3>
                  <p className="text-purple-200 text-sm mt-1">Evidence you need to achieve</p>
                </div>
                
                <div className="border-4 border-[#5B2C6F] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-amber-400">
                        <th className="text-left p-4 font-bold text-[#5B2C6F] border-r-2 border-[#5B2C6F]">This Learner will:</th>
                        <th className="text-left p-4 font-bold text-[#5B2C6F] border-r-2 border-[#5B2C6F]">Assessment Criteria</th>
                        <th className="text-center p-4 font-bold text-[#5B2C6F] w-32">Evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unit?.learning_outcomes?.map((outcome, idx) => (
                        <tr key={idx} className="border-b-2 border-[#5B2C6F]">
                          <td className="p-4 align-top bg-purple-50 border-r-2 border-[#5B2C6F]">
                            <div className="flex items-start gap-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-[#5B2C6F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {idx + 1}
                              </div>
                              <Badge className="bg-amber-400 text-[#5B2C6F] hover:bg-amber-500">LO {idx + 1}</Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-800 leading-relaxed">{outcome}</p>
                          </td>
                          <td className="p-4 border-r-2 border-[#5B2C6F]">
                            <Textarea
                              placeholder="Describe how you will demonstrate this outcome..."
                              value={workbookData[`criteria_${idx}`] || ''}
                              onChange={(e) => updateWorkbookData(`criteria_${idx}`, e.target.value)}
                              className="min-h-[100px] border-2 border-gray-300 focus:border-[#5B2C6F]"
                            />
                          </td>
                          <td className="p-4 text-center bg-gray-50">
                            <input
                              type="checkbox"
                              checked={workbookData[`achieved_${idx}`] || false}
                              onChange={(e) => updateWorkbookData(`achieved_${idx}`, e.target.checked)}
                              className="w-6 h-6 text-[#5B2C6F] border-2 border-[#5B2C6F] rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="activities" className="p-8 mt-0">
                <div className="bg-[#5B2C6F] text-white px-6 py-4 -mx-8 -mt-8 mb-6">
                  <h3 className="font-bold text-lg">Activity Planning & Delivery</h3>
                  <p className="text-purple-200 text-sm mt-1">Plan and record your youth work activities</p>
                </div>
                
                <Card className="p-6 border-4 border-[#5B2C6F] bg-white shadow-lg">
                  <h4 className="font-semibold mb-4">Activity Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title</label>
                      <Input
                        placeholder="Enter activity title..."
                        value={workbookData.activity_title || ''}
                        onChange={(e) => updateWorkbookData('activity_title', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <Input
                          type="date"
                          value={workbookData.activity_date || ''}
                          onChange={(e) => updateWorkbookData('activity_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <Input
                          placeholder="e.g., 2 hours"
                          value={workbookData.activity_duration || ''}
                          onChange={(e) => updateWorkbookData('activity_duration', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Activity Description</label>
                      <Textarea
                        placeholder="Describe the activity in detail..."
                        value={workbookData.activity_description || ''}
                        onChange={(e) => updateWorkbookData('activity_description', e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resources Required</label>
                      <Textarea
                        placeholder="List all resources needed..."
                        value={workbookData.activity_resources || ''}
                        onChange={(e) => updateWorkbookData('activity_resources', e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="evidence" className="p-8 mt-0">
                <div className="bg-[#5B2C6F] text-white px-6 py-4 -mx-8 -mt-8 mb-6">
                  <h3 className="font-bold text-lg">Evidence Collection</h3>
                  <p className="text-purple-200 text-sm mt-1">Document your evidence for assessment</p>
                </div>

                <Card className="p-6 border-4 border-[#5B2C6F] bg-white shadow-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Type</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Description</label>
                      <Textarea
                        placeholder="Describe your evidence and how it demonstrates competence..."
                        value={workbookData.evidence_description || ''}
                        onChange={(e) => updateWorkbookData('evidence_description', e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link to Learning Outcomes</label>
                      <Textarea
                        placeholder="Explain which learning outcomes this evidence covers..."
                        value={workbookData.evidence_outcomes || ''}
                        onChange={(e) => updateWorkbookData('evidence_outcomes', e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="reflection" className="p-8 mt-0">
                <div className="bg-[#5B2C6F] text-white px-6 py-4 -mx-8 -mt-8 mb-6">
                  <h3 className="font-bold text-lg">Personal Reflection</h3>
                  <p className="text-purple-200 text-sm mt-1">Reflect on your learning and practice development</p>
                </div>

                <Card className="p-6 border-4 border-[#5B2C6F] bg-white shadow-lg">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What went well?</h4>
                      <Textarea
                        placeholder="Reflect on what worked well in your practice..."
                        value={workbookData.reflection_well || ''}
                        onChange={(e) => updateWorkbookData('reflection_well', e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What challenges did you face?</h4>
                      <Textarea
                        placeholder="Describe any difficulties or challenges..."
                        value={workbookData.reflection_challenges || ''}
                        onChange={(e) => updateWorkbookData('reflection_challenges', e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What would you do differently?</h4>
                      <Textarea
                        placeholder="Consider how you could improve your practice..."
                        value={workbookData.reflection_improve || ''}
                        onChange={(e) => updateWorkbookData('reflection_improve', e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">How has this developed your practice?</h4>
                      <Textarea
                        placeholder="Reflect on your professional development..."
                        value={workbookData.reflection_development || ''}
                        onChange={(e) => updateWorkbookData('reflection_development', e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between pb-8">
            <Button 
              variant="outline" 
              onClick={() => setSelectedUnit(Math.max(0, selectedUnit - 1))} 
              disabled={selectedUnit === 0}
              className="border-2 border-[#5B2C6F] text-[#5B2C6F] hover:bg-[#5B2C6F] hover:text-white font-semibold"
            >
              ← Previous Unit
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-amber-400 hover:bg-amber-500 text-[#5B2C6F] font-bold shadow-lg px-8"
            >
              <Save className="w-5 h-5 mr-2" />
              Save & Continue
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedUnit(Math.min(selectedQual.curriculum.length - 1, selectedUnit + 1))}
              disabled={selectedUnit === selectedQual.curriculum.length - 1}
              className="border-2 border-[#5B2C6F] text-[#5B2C6F] hover:bg-[#5B2C6F] hover:text-white font-semibold"
            >
              Next Unit →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}