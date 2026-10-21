import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Box, Button, Card, CardContent, CardMedia, Tabs, Tab, Chip, Container, Typography, Grid, LinearProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import PeopleIcon from '@mui/icons-material/People';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const GraduationCap = _w(SchoolIcon), BookOpen = _w(MenuBookIcon), Award = _w(EmojiEventsIcon), CheckCircle = _w(CheckCircleIcon);
const ArrowRight = _w(ArrowForwardIcon), Target = _w(GpsFixedIcon), Users = _w(PeopleIcon), Lightbulb = _w(LightbulbIcon);
const Clock = _w(AccessTimeIcon), TrendingUp = _w(TrendingUpIcon), Settings = _w(SettingsIcon);
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function YouthWork() {
  const [user, setUser] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  // Which tab (Curriculum / Requirements / Effective Practice) each qualification card shows.
  const [qualTab, setQualTab] = useState({});

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

  const { data: assignedProgress = [] } = useQuery({
    queryKey: ['assigned-workbook-progress', user?.email],
    queryFn: () => base44.entities.WorkbookProgress.filter({ 
      assigned_coordinator_email: user?.email 
    }, '-created_date', 100),
    enabled: !!user?.is_coordinator,
  });

  const isCoordinator = user?.is_coordinator || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <Box sx={{ width: 80, height: 80, bgcolor: '#16a34a', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4, boxShadow: 3 }}>
            <Users className="w-10 h-10 text-white" />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            Youth Work Qualifications
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
            OCN Accredited qualifications aligned with the Model of Effective Practice in Youth Work (OCNI)
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Link to={createPageUrl('YouthWorkWorkbook')} style={{ textDecoration: 'none' }}>
              <Button variant="contained" sx={{ bgcolor: '#4f46e5', px: 4, py: 1.5, fontSize: '1rem', borderRadius: 2, boxShadow: 3 }} startIcon={<BookOpen />}>
                Start Your Interactive Workbook
              </Button>
            </Link>
            {isAdmin && (
              <Link to={createPageUrl('AdminYouthWork')} style={{ textDecoration: 'none' }}>
                <Button variant="outlined" sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 2, boxShadow: 3 }} startIcon={<Settings />}>
                  Admin Management
                </Button>
              </Link>
            )}
          </Box>
        </motion.div>

        {/* Model of Effective Practice Overview */}
        <Card sx={{ p: 4, mb: 6, bgcolor: 'action.hover', borderColor: '#a7f3d0', border: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Target className="w-7 h-7" style={{ color: '#16a34a' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', m: 0 }}>Model of Effective Practice</Typography>
            </Box>
            
            <Box sx={{ space: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Lightbulb className="w-5 h-5" style={{ color: '#16a34a' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', m: 0 }}>Purpose</Typography>
                </Box>
                <Typography color="textSecondary">{modelOfEffectivePractice.purpose}</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CheckCircle className="w-5 h-5" style={{ color: '#16a34a' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', m: 0 }}>Core Principles</Typography>
                  </Box>
                  <Box component="ul" sx={{ pl: 2, space: 1 }}>
                    {modelOfEffectivePractice.principles.map((principle, idx) => (
                      <Box component="li" key={idx} sx={{ display: 'flex', gap: 1, mb: 1, color: 'text.secondary' }}>
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                        <Typography variant="body2">{principle}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <TrendingUp className="w-5 h-5" style={{ color: '#16a34a' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', m: 0 }}>Key Processes</Typography>
                  </Box>
                  <Box component="ul" sx={{ pl: 2, space: 1 }}>
                    {modelOfEffectivePractice.keyProcesses.map((process, idx) => (
                      <Box component="li" key={idx} sx={{ display: 'flex', gap: 1, mb: 1, color: 'text.secondary' }}>
                        <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                        <Typography variant="body2">{process}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Level Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
          {['all', 'Level 1', 'Level 2', 'Level 3'].map(level => (
            <Button
              key={level}
              variant={selectedLevel === level ? 'contained' : 'outlined'}
              onClick={() => setSelectedLevel(level)}
              sx={selectedLevel === level ? { bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } } : {}}
            >
              {level === 'all' ? 'All Levels' : level}
            </Button>
          ))}
        </Box>

        {/* Qualifications */}
        <Box sx={{ mb: 4 }}>
          {filteredQualifications.map((qual, index) => (
            <motion.div
              key={qual.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ marginBottom: 24 }}
            >
              <Card sx={{ overflow: 'hidden', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                <Box sx={{ bgcolor: 'success.main', p: 3, color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Chip label={qual.level} sx={{ bgcolor: 'background.paper', color: '#16a34a', fontWeight: 'bold' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.875rem' }}>
                      {qual.credit_value && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Award className="w-4 h-4" />
                          {qual.credit_value} Credits
                        </Box>
                      )}
                      {qual.guided_learning_hours && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Clock className="w-4 h-4" />
                          {qual.guided_learning_hours} GLH
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, m: 0 }}>{qual.title}</Typography>
                  <Typography sx={{ opacity: 0.9 }}>{qual.description}</Typography>
                </Box>

                <CardContent>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={(qualTab[qual.id || index] || 0)} onChange={(_, v) => setQualTab(t => ({ ...t, [qual.id || index]: v }))} variant="scrollable" allowScrollButtonsMobile>
                      <Tab label="Curriculum" />
                      <Tab label="Requirements" />
                      <Tab label="Effective Practice" />
                    </Tabs>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Box hidden={(qualTab[qual.id || index] || 0) !== 0}>
                    {qual.curriculum && qual.curriculum.length > 0 ? (
                        <Box sx={{ mb: 2 }}>
                          {qual.curriculum.map((unit, idx) => (
                            <Card key={idx} sx={{ p: 2, bgcolor: 'action.hover', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {unit.unit_title}
                                  </Typography>
                                  {unit.unit_code && (
                                    <Typography variant="caption" color="textSecondary">Code: {unit.unit_code}</Typography>
                                  )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Chip label={unit.level} size="small" variant="outlined" />
                                  <Chip label={`${unit.credits} Credits`} size="small" variant="outlined" />
                                </Box>
                              </Box>
                              
                              {unit.learning_outcomes && unit.learning_outcomes.length > 0 && (
                                <Box>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Learning Outcomes:
                                  </Typography>
                                  <Box component="ul" sx={{ pl: 2 }}>
                                    {unit.learning_outcomes.map((outcome, oIdx) => (
                                      <Box component="li" key={oIdx} sx={{ display: 'flex', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                                        <Typography variant="caption">{outcome}</Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Card>
                          ))}
                        </Box>
                      ) : (
                        <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                          Curriculum details coming soon
                        </Typography>
                      )}

                    </Box>

                    <Box hidden={(qualTab[qual.id || index] || 0) !== 1}>
                    {(qual.entry_requirements || qual.progression_routes) && (
                      <Box sx={{ mb: 2 }}>
                        {qual.entry_requirements && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <BookOpen className="w-5 h-5" style={{ color: '#16a34a' }} />
                              <Typography variant="body2" sx={{ fontWeight: 'bold', m: 0 }}>Entry Requirements</Typography>
                            </Box>
                            <Typography color="textSecondary">{qual.entry_requirements}</Typography>
                          </Box>
                        )}
                        
                        {qual.progression_routes && (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <TrendingUp className="w-5 h-5" style={{ color: '#16a34a' }} />
                              <Typography variant="body2" sx={{ fontWeight: 'bold', m: 0 }}>Progression Routes</Typography>
                            </Box>
                            <Typography color="textSecondary">{qual.progression_routes}</Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {!qual.entry_requirements && !qual.progression_routes && (
                      <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>Requirements details coming soon</Typography>
                    )}
                    </Box>

                    <Box hidden={(qualTab[qual.id || index] || 0) !== 2}>
                    {qual.effective_practice_model ? (
                      <Box>
                        {qual.effective_practice_model.purpose && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Target className="w-5 h-5" style={{ color: '#16a34a' }} />
                              <Typography variant="body2" sx={{ fontWeight: 'bold', m: 0 }}>Purpose</Typography>
                            </Box>
                            <Typography color="textSecondary">{qual.effective_practice_model.purpose}</Typography>
                          </Box>
                        )}
                        
                        {qual.effective_practice_model.principles && qual.effective_practice_model.principles.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Principles</Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                              {qual.effective_practice_model.principles.map((principle, idx) => (
                                <Box component="li" key={idx} sx={{ display: 'flex', gap: 1, mb: 1, color: 'text.secondary' }}>
                                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                                  <Typography variant="body2">{principle}</Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {qual.effective_practice_model.key_processes && qual.effective_practice_model.key_processes.length > 0 && (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Key Processes</Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                              {qual.effective_practice_model.key_processes.map((process, idx) => (
                                <Box component="li" key={idx} sx={{ display: 'flex', gap: 1, mb: 1, color: 'text.secondary' }}>
                                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                                  <Typography variant="body2">{process}</Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                        Effective practice model details coming soon
                      </Typography>
                    )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>

        {filteredQualifications.length === 0 && (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <GraduationCap className="w-16 h-16 mx-auto mb-4" style={{ color: '#d1d5db' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              No Qualifications Available
            </Typography>
            <Typography color="textSecondary">
              Youth work qualifications will be displayed here once added by administrators
            </Typography>
          </Card>
        )}

        {/* Coordinator View */}
        {isCoordinator && assignedProgress.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Your Assigned Participants</Typography>
            <Grid container spacing={2}>
              {assignedProgress.map(progress => {
                const qual = qualifications.find(q => q.id === progress.qualification_id);
                return (
                  <Grid size={12} key={progress.id}>
                    <Card sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{progress.participant_name}</Typography>
                          <Typography variant="caption" color="textSecondary">{progress.participant_email}</Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                            {qual?.title} - Unit {progress.unit_index + 1}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <LinearProgress variant="determinate" value={progress.progress_percent} sx={{ width: 128, height: 8 }} />
                            <Typography variant="caption" color="textSecondary">{progress.progress_percent}%</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={progress.is_approved ? 'Approved' : 'Pending Review'} 
                            color={progress.is_approved ? 'success' : 'warning'} 
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
}