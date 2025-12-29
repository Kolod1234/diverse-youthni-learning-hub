import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, BookOpen, Award, CheckCircle, ArrowRight, 
  Target, Users, Lightbulb, Clock, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function YouthWork() {
  const [selectedLevel, setSelectedLevel] = useState('all');

  const { data: qualifications = [] } = useQuery({
    queryKey: ['youth-work-qualifications'],
    queryFn: () => base44.entities.YouthWorkQualification.filter({ is_published: true }, 'order', 50),
  });

  const filteredQualifications = selectedLevel === 'all' 
    ? qualifications 
    : qualifications.filter(q => q.level === selectedLevel);

  const modelOfEffectivePractice = {
    purpose: "Youth work enables young people to develop holistically, working with them to facilitate their personal, social and educational development, and to enable them to develop their voice, influence and place in society.",
    principles: [
      "Young people choose to participate",
      "Youth work must promote young people's best interests", 
      "Youth work recognizes the young person and the youth worker as partners in a learning process",
      "Youth work promotes equality of opportunity for all young people",
      "Youth work must be based on sound ethical principles"
    ],
    keyProcesses: [
      "Engage with young people and build relationships",
      "Identify needs and opportunities",
      "Plan, design and deliver activities",
      "Reflect on and evaluate practice",
      "Support young people to participate and advocate"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Youth Work Qualifications
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            OCN Accredited qualifications aligned with the Model of Effective Practice in Youth Work (OCNI)
          </p>
          <Link to={createPageUrl('YouthWorkWorkbook')}>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 mr-3" />
              Start Your Interactive Workbook
            </Button>
          </Link>
        </motion.div>

        {/* Model of Effective Practice Overview */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Model of Effective Practice</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-emerald-600" />
                Purpose
              </h3>
              <p className="text-gray-700 leading-relaxed">{modelOfEffectivePractice.purpose}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Core Principles
                </h3>
                <ul className="space-y-2">
                  {modelOfEffectivePractice.principles.map((principle, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="text-sm">{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Key Processes
                </h3>
                <ul className="space-y-2">
                  {modelOfEffectivePractice.keyProcesses.map((process, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <ArrowRight className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="text-sm">{process}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Level Filter */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Button
            variant={selectedLevel === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedLevel('all')}
            className={selectedLevel === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            All Levels
          </Button>
          <Button
            variant={selectedLevel === 'Level 1' ? 'default' : 'outline'}
            onClick={() => setSelectedLevel('Level 1')}
            className={selectedLevel === 'Level 1' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Level 1
          </Button>
          <Button
            variant={selectedLevel === 'Level 2' ? 'default' : 'outline'}
            onClick={() => setSelectedLevel('Level 2')}
            className={selectedLevel === 'Level 2' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Level 2
          </Button>
          <Button
            variant={selectedLevel === 'Level 3' ? 'default' : 'outline'}
            onClick={() => setSelectedLevel('Level 3')}
            className={selectedLevel === 'Level 3' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Level 3
          </Button>
        </div>

        {/* Qualifications */}
        <div className="space-y-6">
          {filteredQualifications.map((qual, index) => (
            <motion.div
              key={qual.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-white text-emerald-700 font-semibold">
                      {qual.level}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm">
                      {qual.credit_value && (
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {qual.credit_value} Credits
                        </span>
                      )}
                      {qual.guided_learning_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {qual.guided_learning_hours} GLH
                        </span>
                      )}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{qual.title}</h2>
                  <p className="text-emerald-50">{qual.description}</p>
                </div>

                <div className="p-6">
                  <Tabs defaultValue="curriculum" className="w-full">
                    <TabsList className="mb-6">
                      <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                      <TabsTrigger value="requirements">Requirements</TabsTrigger>
                      <TabsTrigger value="practice">Effective Practice</TabsTrigger>
                    </TabsList>

                    <TabsContent value="curriculum">
                      {qual.curriculum && qual.curriculum.length > 0 ? (
                        <div className="space-y-4">
                          {qual.curriculum.map((unit, idx) => (
                            <Card key={idx} className="p-4 bg-gray-50">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900 mb-1">
                                    {unit.unit_title}
                                  </h3>
                                  {unit.unit_code && (
                                    <p className="text-sm text-gray-500">Code: {unit.unit_code}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                  <Badge variant="outline">{unit.level}</Badge>
                                  <Badge variant="outline">{unit.credits} Credits</Badge>
                                </div>
                              </div>
                              
                              {unit.learning_outcomes && unit.learning_outcomes.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                    Learning Outcomes:
                                  </p>
                                  <ul className="space-y-1">
                                    {unit.learning_outcomes.map((outcome, oIdx) => (
                                      <li key={oIdx} className="flex items-start gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                        {outcome}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          Curriculum details coming soon
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="requirements">
                      <div className="space-y-6">
                        {qual.entry_requirements && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-emerald-600" />
                              Entry Requirements
                            </h3>
                            <p className="text-gray-700">{qual.entry_requirements}</p>
                          </div>
                        )}
                        
                        {qual.progression_routes && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-emerald-600" />
                              Progression Routes
                            </h3>
                            <p className="text-gray-700">{qual.progression_routes}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="practice">
                      {qual.effective_practice_model ? (
                        <div className="space-y-6">
                          {qual.effective_practice_model.purpose && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Target className="w-5 h-5 text-emerald-600" />
                                Purpose
                              </h3>
                              <p className="text-gray-700">{qual.effective_practice_model.purpose}</p>
                            </div>
                          )}
                          
                          {qual.effective_practice_model.principles && qual.effective_practice_model.principles.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-3">Principles</h3>
                              <ul className="space-y-2">
                                {qual.effective_practice_model.principles.map((principle, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                    {principle}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {qual.effective_practice_model.key_processes && qual.effective_practice_model.key_processes.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-3">Key Processes</h3>
                              <ul className="space-y-2">
                                {qual.effective_practice_model.key_processes.map((process, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                                    <ArrowRight className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                    {process}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          Effective practice model details coming soon
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredQualifications.length === 0 && (
          <Card className="p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Qualifications Available
            </h3>
            <p className="text-gray-500">
              Youth work qualifications will be displayed here once added by administrators
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}