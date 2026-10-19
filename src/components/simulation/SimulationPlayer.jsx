import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, Box, Typography, Button, Alert, LinearProgress } from '@mui/material';
import { ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function SimulationPlayer({ simulation, onComplete }) {
  const [currentNodeId, setCurrentNodeId] = useState(simulation.scenario_data?.start_node_id);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [startTime] = useState(Date.now());

  const currentNode = simulation.scenario_data?.nodes?.find(n => n.id === currentNodeId);

  const trackInteractionMutation = useMutation({
    mutationFn: async (interactionData) => {
      return await base44.functions.invoke('trackSimulationInteraction', {
        simulationId: simulation.id,
        ...interactionData
      });
    }
  });

  useEffect(() => {
    if (currentNodeId && !visitedNodes.includes(currentNodeId)) {
      setVisitedNodes([...visitedNodes, currentNodeId]);
      
      // Track node visit
      trackInteractionMutation.mutate({
        action: 'node_visited',
        nodeId: currentNodeId,
        timestamp: new Date().toISOString()
      });
    }
  }, [currentNodeId]);

  const handleChoice = (choice) => {
    // Add to history
    setChoiceHistory([
      ...choiceHistory,
      {
        nodeId: currentNodeId,
        choiceText: choice.text,
        points: choice.points || 0,
        timestamp: new Date().toISOString()
      }
    ]);

    // Add points
    setTotalPoints(totalPoints + (choice.points || 0));

    // Track choice
    trackInteractionMutation.mutate({
      action: 'choice_made',
      nodeId: currentNodeId,
      choiceText: choice.text,
      points: choice.points || 0,
      timestamp: new Date().toISOString()
    });

    // Show feedback if available
    if (choice.feedback) {
      toast.info(choice.feedback);
    }

    // Navigate to next node or complete
    if (choice.next_node_id) {
      setCurrentNodeId(choice.next_node_id);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    // Track completion
    trackInteractionMutation.mutate({
      action: 'completed',
      totalPoints,
      pathTaken: visitedNodes,
      choicesMade: choiceHistory.length,
      duration,
      timestamp: new Date().toISOString()
    });

    onComplete?.({ totalPoints, duration, pathTaken: visitedNodes });
  };

  const handleReset = () => {
    setCurrentNodeId(simulation.scenario_data?.start_node_id);
    setVisitedNodes([]);
    setTotalPoints(0);
    setChoiceHistory([]);
  };

  if (!currentNode) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircle className="w-16 h-16 mx-auto mb-3 text-success-main" />
        <Typography variant="h5" sx={{ mb: 2 }}>Scenario Complete!</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          You earned {totalPoints} points and visited {visitedNodes.length} nodes
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RotateCcw className="w-4 h-4" />}
          onClick={handleReset}
        >
          Try Again
        </Button>
      </Card>
    );
  }

  const progress = (visitedNodes.length / (simulation.scenario_data?.nodes?.length || 1)) * 100;

  return (
    <Box>
      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption">Progress: {visitedNodes.length}/{simulation.scenario_data?.nodes?.length} nodes</Typography>
          <Typography variant="caption" fontWeight="bold">Points: {totalPoints}</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </Box>

      {/* Current Node */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNodeId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>{currentNode.title}</Typography>
            
            {currentNode.media_url && (
              <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                <img
                  src={currentNode.media_url}
                  alt={currentNode.title}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
                />
              </Box>
            )}

            <Box
              sx={{ mb: 4 }}
              dangerouslySetInnerHTML={{ __html: currentNode.content }}
            />

            {currentNode.is_end ? (
              <Alert severity="success" icon={<CheckCircle />}>
                You've reached an ending! Points earned: {totalPoints}
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {currentNode.choices?.map((choice, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    size="large"
                    onClick={() => handleChoice(choice)}
                    sx={{
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      py: 2,
                      px: 3
                    }}
                  >
                    <span>{choice.text}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                ))}
              </Box>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Reset Button */}
      <Button
        variant="outlined"
        startIcon={<RotateCcw className="w-4 h-4" />}
        onClick={handleReset}
        sx={{ mt: 2 }}
      >
        Restart Scenario
      </Button>
    </Box>
  );
}