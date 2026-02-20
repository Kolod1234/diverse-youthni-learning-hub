import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Container, Card, Box, Typography, Tabs, Tab } from '@mui/material';
import ContentVersionControl from '@/components/authoring/ContentVersionControl';
import ContentReviewWorkflow from '@/components/authoring/ContentReviewWorkflow';

export default function ContentVersionManager() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const entityType = params.get('type'); // 'course', 'lesson', 'quiz'
  const entityId = params.get('id');
  const [activeTab, setActiveTab] = useState(0);

  const { data: entity } = useQuery({
    queryKey: [entityType, entityId],
    queryFn: async () => {
      if (entityType === 'course') return await base44.entities.Course.get(entityId);
      if (entityType === 'lesson') return await base44.entities.Lesson.get(entityId);
      if (entityType === 'quiz') return await base44.entities.Quiz.get(entityId);
    },
    enabled: !!entityType && !!entityId
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['versions', entityType, entityId],
    queryFn: () => base44.entities.ContentVersion.filter({ entity_type: entityType, entity_id: entityId })
  });

  const latestVersion = versions.sort((a, b) => b.version_number - a.version_number)[0];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Version Control: {entity?.title}
        </Typography>
        <Typography color="text.secondary">
          Manage versions and reviews for this {entityType}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Versions" />
          <Tab label="Reviews" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <ContentVersionControl
          entityType={entityType}
          entityId={entityId}
          currentContent={entity}
        />
      )}

      {activeTab === 1 && latestVersion && (
        <ContentReviewWorkflow
          versionId={latestVersion.id}
          entityType={entityType}
          entityId={entityId}
        />
      )}
    </Container>
  );
}