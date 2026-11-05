import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Grid, TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import LayersIcon from '@mui/icons-material/Layers';
const _w = (I) => ({ size, color, style, ...r }) => <I style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const TrendingUp = _w(TrendingUpIcon), BookOpen = _w(MenuBookIcon), Users = _w(PeopleIcon), Search = _w(SearchIcon), Layers = _w(LayersIcon);

const CATEGORY_COLORS = {
  youth_work: '#4f46e5',
  gcse_books: '#3b82f6',
  gcse_past_questions: '#06b6d4',
  a_level_books: '#8b5cf6',
  inspirational: '#ec4899',
  dyni_books: '#f97316',
  workbooks_logbooks: '#10b981',
  history_books: '#6366f1'
};

export default function AdminLibraryDashboard() {
  const [timeRange, setTimeRange] = useState('30'); // days
  const [topN, setTopN] = useState(10);

  const { data: resources = [] } = useQuery({
    queryKey: ['library-resources-admin'],
    queryFn: () => base44.entities.LibraryResource.list('-updated_date', 1000)
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['file-activities'],
    queryFn: () => base44.entities.FileActivity.list('-created_date', 10000)
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['file-comments'],
    queryFn: () => base44.entities.FileComment.list('-created_date', 5000)
  });

  // Helper: Filter by date range
  const filterByDateRange = (items, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    return items.filter(item => {
      const itemDate = new Date(item.created_date);
      return itemDate >= cutoffDate;
    });
  };

  // 1. Most Downloaded/Viewed Books
  const topBooks = useMemo(() => {
    const sorted = [...resources]
      .sort((a, b) => ((b.downloads_count || 0) + (b.views_count || 0)) - ((a.downloads_count || 0) + (a.views_count || 0)))
      .slice(0, topN)
      .map(book => ({
        name: book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title,
        downloads: book.downloads_count || 0,
        views: book.views_count || 0,
        total: (book.downloads_count || 0) + (book.views_count || 0)
      }));
    return sorted;
  }, [resources, topN]);

  // 2. Download/View Trends Over Time
  const trendData = useMemo(() => {
    const days = parseInt(timeRange);
    const recentActivities = filterByDateRange(activities, days);
    const dailyData = {};

    recentActivities.forEach(activity => {
      const date = new Date(activity.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyData[date]) {
        dailyData[date] = { downloads: 0, views: 0, date };
      }
      if (activity.action === 'downloaded') dailyData[date].downloads += 1;
      if (activity.action === 'viewed') dailyData[date].views += 1;
    });

    return Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-days);
  }, [activities, timeRange]);

  // 3. Most Active Users
  const activeUsers = useMemo(() => {
    const userActivity = {};
    activities.forEach(activity => {
      const user = activity.user_name || 'Anonymous';
      userActivity[user] = (userActivity[user] || 0) + 1;
    });

    return Object.entries(userActivity)
      .map(([name, count]) => ({ name, activities: count }))
      .sort((a, b) => b.activities - a.activities)
      .slice(0, topN);
  }, [activities, topN]);

  // 4. Top Searched Keywords
  const topKeywords = useMemo(() => {
    const keywords = {};
    comments.forEach(comment => {
      // Extract keywords from comments (simple tokenization)
      const words = (comment.content || '')
        .toLowerCase()
        .match(/\b\w{3,}\b/g) || [];
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });

    return Object.entries(keywords)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);
  }, [comments, topN]);

  // 5. Category Distribution
  const categoryDistribution = useMemo(() => {
    const categories = {};
    resources.forEach(resource => {
      const cat = resource.category || 'uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    return Object.entries(categories).map(([category, count]) => ({
      name: category.replace(/_/g, ' '),
      value: count,
      category
    }));
  }, [resources]);

  // Tag Distribution
  const tagDistribution = useMemo(() => {
    const tags = {};
    resources.forEach(resource => {
      (resource.tags || []).forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });

    return Object.entries(tags)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [resources]);

  // Statistics Cards
  const stats = useMemo(() => {
    const recentActivities = filterByDateRange(activities, timeRange);
    const totalDownloads = recentActivities.filter(a => a.action === 'downloaded').length;
    const totalViews = recentActivities.filter(a => a.action === 'viewed').length;
    const uniqueUsers = new Set(activities.map(a => a.user_name)).size;

    return [
      { label: 'Total Books', value: resources.length, icon: BookOpen, color: '#4f46e5' },
      { label: 'Downloads (Last ' + timeRange + 'd)', value: totalDownloads, icon: TrendingUp, color: '#10b981' },
      { label: 'Views (Last ' + timeRange + 'd)', value: totalViews, icon: BookOpen, color: '#06b6d4' },
      { label: 'Active Users', value: uniqueUsers, icon: Users, color: '#f97316' }
    ];
  }, [resources, activities, timeRange]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'action.hover', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Library Analytics Dashboard</Typography>
          <Typography color="text.secondary">Monitor library engagement, content popularity, and user behavior</Typography>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range (Days)</InputLabel>
            <Select value={timeRange} label="Time Range (Days)" onChange={(e) => setTimeRange(e.target.value)}>
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Top N Items</InputLabel>
            <Select value={topN} label="Top N Items" onChange={(e) => setTopN(e.target.value)}>
              <MenuItem value="5">Top 5</MenuItem>
              <MenuItem value="10">Top 10</MenuItem>
              <MenuItem value="20">Top 20</MenuItem>
              <MenuItem value="50">Top 50</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Card sx={{ p: 3, borderLeft: 4, borderColor: stat.color }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ bgcolor: stat.color + '15', p: 1.5, borderRadius: 1 }}>
                      <Icon size={24} color={stat.color} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                      <Typography variant="h6" fontWeight={700}>{stat.value}</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          {/* Top Books */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Most Downloaded/Viewed Books</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topBooks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="downloads" fill="#4f46e5" />
                  <Bar dataKey="views" fill="#0b2f5c" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Trend Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Download & View Trends</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="downloads" stroke="#4f46e5" strokeWidth={2} />
                  <Line type="monotone" dataKey="views" stroke="#0b2f5c" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Active Users */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Most Active Users</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activeUsers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="activities" fill="#0b2f5c" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Books by Category</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#4f46e5"
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Top Keywords */}
          <Grid size={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Most Discussed Keywords</Typography>
              {topKeywords.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topKeywords}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="keyword" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0b2f5c" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No keywords data available yet
                </Typography>
              )}
            </Card>
          </Grid>

          {/* Tag Distribution */}
          <Grid size={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Top Tags</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tagDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tag" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Summary Stats */}
          <Grid size={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Summary Statistics</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Total Resources</Typography>
                    <Typography variant="h6" fontWeight={700}>{resources.length}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Total Activities</Typography>
                    <Typography variant="h6" fontWeight={700}>{activities.length}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Categories</Typography>
                    <Typography variant="h6" fontWeight={700}>{categoryDistribution.length}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Unique Tags</Typography>
                    <Typography variant="h6" fontWeight={700}>{tagDistribution.length}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}