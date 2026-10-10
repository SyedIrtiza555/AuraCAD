import React from 'react';
import { Box, Paper, Text, Grid, Group, Stack, Badge, Title, ScrollArea, Avatar, Center } from '@mantine/core';
import { ViewMode } from './FloatingViewChanger';
import { Kanban, CalendarDays, History, Sparkles } from 'lucide-react';

interface UniversalDataViewProps {
  module: 'orders' | 'designers' | 'prospects' | 'invoices';
  viewMode: ViewMode;
  data: any[];
  onItemClick?: (item: any) => void;
}

export function UniversalDataView({ module, viewMode, data, onItemClick }: UniversalDataViewProps) {
  if (viewMode === 'table') return null; // Table handled by original components

  const getDisplayTitle = (item: any) => {
    return item.name || item.order_code || item.invoice_number || 'Unknown Item';
  };

  const getDisplaySub = (item: any) => {
    return item.email || item.company || item.status || item.specialty || '';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': case 'draft': return 'gray';
      case 'designing': case 'sent': return 'blue';
      case 'review': case 'overdue': return 'orange';
      case 'completed': case 'paid': return 'green';
      case 'cancelled': return 'red';
      default: return 'indigo';
    }
  };

  if (viewMode === 'cards') {
    return (
      <ScrollArea h="100%" px="md">
        <Grid gutter="md" mt="md" pb={100}>
          {data.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, lg: 4, xl: 3 }}>
              <Paper 
                p="lg" 
                radius="xl" 
                withBorder 
                className="hover:shadow-md transition-shadow cursor-pointer bg-white/50 dark:bg-black/20 backdrop-blur-md"
                onClick={() => onItemClick?.(item)}
              >
                <Group justify="space-between" mb="sm">
                  <Avatar color="blue" radius="xl">{getDisplayTitle(item).substring(0, 2).toUpperCase()}</Avatar>
                  {item.status && <Badge variant="light" color={getStatusColor(item.status)}>{item.status}</Badge>}
                </Group>
                <Text fw={700} size="lg" truncate>{getDisplayTitle(item)}</Text>
                <Text c="dimmed" size="sm" mt={4} truncate>{getDisplaySub(item)}</Text>
                
                {item.created_at && (
                  <Text size="xs" c="dimmed" mt="md" ff="monospace">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                )}
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </ScrollArea>
    );
  }

  // Placeholder for Kanban, Calendar, Time-Machine
  const renderComingSoon = (icon: React.ReactNode, title: string, desc: string) => (
    <Center h="100%">
      <Paper p="xl" radius="xl" withBorder className="bg-white/30 dark:bg-black/30 backdrop-blur-2xl border-white/40 shadow-2xl flex flex-col items-center max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#83dd24] to-[#29aae0] flex items-center justify-center text-white mb-6 shadow-lg">
          {icon}
        </div>
        <Title order={3} mb="sm" className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          {title} for {module.charAt(0).toUpperCase() + module.slice(1)}
        </Title>
        <Text c="dimmed" size="sm" lh={1.6}>
          {desc}
        </Text>
        <Badge mt="lg" variant="dot" color="blue" size="lg" className="bg-white/50 dark:bg-black/50">
          Module Synchronizing...
        </Badge>
      </Paper>
    </Center>
  );

  if (viewMode === 'kanban') {
    return renderComingSoon(
      <Kanban size={32} />, 
      "Kanban Workspace", 
      "The liquid glass Kanban board is adapting to your relational schema. Soon you'll be able to drag and drop these entities seamlessly across pipeline stages."
    );
  }

  if (viewMode === 'calendar') {
    return renderComingSoon(
      <CalendarDays size={32} />, 
      "Temporal Matrix", 
      "The temporal matrix is mapping your data points to the timeline. Upcoming deadlines and historic milestones will populate here."
    );
  }

  if (viewMode === 'time-machine') {
    return renderComingSoon(
      <History size={32} />, 
      "Time Machine", 
      "Initializing chronological reverse-playback. Track exactly when each entity evolved and rewind states."
    );
  }

  return null;
}
