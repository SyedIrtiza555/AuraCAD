import React, { useState } from 'react';
import {
  Paper,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  ActionIcon,
  Timeline,
  Divider,
  Select,
  TextInput,
  Textarea,
  Tabs,
  Avatar,
  Box,
  Drawer,
  Modal,
  ScrollArea,
  NumberFormatter,
  Grid
} from '@mantine/core';
import { 
  X, 
  Clock, 
  User, 
  Building2, 
  Receipt,
  AlertCircle,
  MessageSquare,
  History,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  Maximize2,
  Minimize2,
  PanelRightClose
} from 'lucide-react';
import { 
  Order, 
  Designer, 
  Prospect, 
  Invoice, 
  Correction, 
  OrderStatusHistory, 
  OrderStatus, 
  InvoiceStatus,
  ORDER_STATUSES
} from '../../types';
import { UserRole } from '../../lib/pocketbase';

export interface OrderCardProps {
  order: Order | null;
  designers: Designer[];
  prospects: Prospect[];
  invoices: Invoice[];
  corrections: Correction[];
  statusHistory: OrderStatusHistory[];
  role: UserRole;
  viewMode: 'sidepeek' | 'center' | 'fullscreen' | 'inline';
  size?: 'narrow' | 'default' | 'wide';
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateDesigner: (orderId: string, designerId: string) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onAddCorrection: (orderId: string, message: string, authorName: string, imageUrl?: string) => void;
  onViewModeChange?: (newMode: 'sidepeek' | 'center' | 'fullscreen' | 'inline') => void;
}

export function OrderCard({
  order,
  designers,
  prospects,
  invoices,
  corrections,
  statusHistory,
  role,
  viewMode,
  size = 'default',
  onClose,
  onUpdateStatus,
  onUpdateDesigner,
  onUpdateInvoiceStatus,
  onAddCorrection,
  onViewModeChange
}: OrderCardProps) {
  const [newCorrectionMsg, setNewCorrectionMsg] = useState('');
  const [newCorrectionUrl, setNewCorrectionUrl] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('corrections');

  if (!order) return null;

  const isDesigner = role === 'designer';
  const canViewFinancials = role === 'owner' || role === 'admin';
  const canAssign = role === 'owner' || role === 'admin';

  const orderDesigner = designers.find(d => d.id === order.designer_id);
  const orderProspect = prospects.find(p => p.id === order.prospect_id);
  const orderInvoice = invoices.find(i => i.order_id === order.id);
  const orderHistory = statusHistory.filter(h => h.order_id === order.id).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  const orderCorrections = corrections.filter(c => c.order_id === order.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'gray';
      case 'Designing': return 'blue';
      case 'Review': return 'orange';
      case 'Completed': return 'green';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Low': return 'green';
      case 'Medium': return 'blue';
      case 'High': return 'orange';
      case 'Urgent': return 'red';
      default: return 'gray';
    }
  };

  const handleAddCorrection = () => {
    if (!newCorrectionMsg.trim()) return;
    onAddCorrection(order.id, newCorrectionMsg, isDesigner ? orderDesigner?.name || 'Designer' : 'Studio Admin', newCorrectionUrl);
    setNewCorrectionMsg('');
    setNewCorrectionUrl('');
  };

  const handleStatusChange = (val: string | null) => {
    if (val) onUpdateStatus(order.id, val as OrderStatus);
  };

  // The actual inner content of the card
  const CardContent = (
    <Stack gap="md" h="100%" style={{ overflowY: 'auto' }} p={viewMode === 'inline' ? 'md' : 0}>
      {/* Header Info */}
      <Paper p="md" radius="md" withBorder bg="var(--mantine-color-body)">
        <Group justify="space-between" mb="xs" align="flex-start">
          <div>
            <Text size="xs" c="dimmed" ff="monospace" mb={4}>{order.order_code}</Text>
            <Text size="xl" fw={800} lh={1.2}>{order.name}</Text>
          </div>
          <Group gap="xs">
            <Badge color={getStatusColor(order.status)} variant="light" size="lg">{order.status}</Badge>
            <Badge color={getEffortColor(order.effort_level)} variant="outline" size="sm">{order.effort_level}</Badge>
          </Group>
        </Group>

        <Divider my="sm" variant="dashed" />

        <Grid gutter="md">
          {/* Status & Designer Assignment */}
          <Grid.Col span={{ base: 12, sm: canViewFinancials ? 6 : 12 }}>
            <Stack gap="sm">
              <Select 
                label="Order Status"
                size="sm"
                data={ORDER_STATUSES}
                value={order.status}
                onChange={handleStatusChange}
                disabled={order.status === 'Completed' && !canAssign}
              />
              
              {canAssign ? (
                <Select
                  label="Assigned Designer"
                  size="sm"
                  data={designers.map(d => ({ value: d.id, label: `${d.name} (${d.code})` }))}
                  value={order.designer_id}
                  onChange={(val) => val && onUpdateDesigner(order.id, val)}
                  leftSection={<User size={14} />}
                />
              ) : (
                <Box>
                  <Text size="xs" fw={600} mb={4}>Assigned Designer</Text>
                  <Group gap="sm">
                    <Avatar size="sm" radius="xl" color="purple">{orderDesigner?.code}</Avatar>
                    <Text size="sm" fw={500}>{orderDesigner?.name}</Text>
                  </Group>
                </Box>
              )}
            </Stack>
          </Grid.Col>

          {/* Client & Financials (Only for Owner/Admin) */}
          {canViewFinancials && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="sm">
                <Box>
                  <Text size="xs" fw={600} mb={4} c="dimmed">Client Info</Text>
                  <Group gap="xs" wrap="nowrap">
                    <Building2 size={16} className="text-slate-400" />
                    <Box>
                      <Text size="sm" fw={600} truncate>{orderProspect?.name}</Text>
                      <Text size="xs" c="dimmed" truncate>{orderProspect?.company}</Text>
                    </Box>
                  </Group>
                </Box>
                
                <Box>
                  <Text size="xs" fw={600} mb={4} c="dimmed">Financials</Text>
                  <Group gap="md">
                    <Box>
                      <Text size="lg" fw={800} c="green.6" ff="monospace">
                        <NumberFormatter prefix="$" value={order.order_value} thousandSeparator />
                      </Text>
                    </Box>
                    {orderInvoice && (
                      <Select 
                        size="xs"
                        data={['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']}
                        value={orderInvoice.status}
                        onChange={(v) => v && onUpdateInvoiceStatus(orderInvoice.id, v as InvoiceStatus)}
                        w={100}
                        styles={{ input: { fontSize: 11, fontWeight: 700 } }}
                      />
                    )}
                  </Group>
                </Box>
              </Stack>
            </Grid.Col>
          )}
        </Grid>
      </Paper>

      {/* Tabs for Corrections & History */}
      <Paper p="md" radius="md" withBorder flex={1} style={{ display: 'flex', flexDirection: 'column' }}>
        <Tabs value={activeTab} onChange={setActiveTab} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Tabs.List>
            <Tabs.Tab value="corrections" leftSection={<MessageSquare size={14} />}>
              Corrections & Notes
              {orderCorrections.length > 0 && (
                <Badge size="xs" circle ml={6} color="blue">{orderCorrections.length}</Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<History size={14} />}>
              Status History
            </Tabs.Tab>
          </Tabs.List>

          <Box mt="md" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Tabs.Panel value="corrections" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
              <ScrollArea flex={1} offsetScrollbars mb="md">
                <Stack gap="md" pr="sm">
                  {orderCorrections.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="xl">No corrections yet.</Text>
                  ) : (
                    orderCorrections.map(c => (
                      <Paper key={c.id} p="sm" radius="md" bg="var(--mantine-color-default-hover)">
                        <Group justify="space-between" mb={5}>
                          <Text size="xs" fw={700}>{c.author_name || 'System'}</Text>
                          <Text size="xs" c="dimmed" ff="monospace">{new Date(c.created_at).toLocaleString()}</Text>
                        </Group>
                        <Text size="sm" mb={c.attachments?.length > 0 ? 'sm' : 0}>{c.message}</Text>
                        {c.attachments?.map(att => (
                          <Paper key={att.id} withBorder p={4} radius="sm" display="inline-block" mt={5}>
                            <img src={att.file_url} alt="Reference" style={{ maxHeight: 120, borderRadius: 4, display: 'block' }} />
                          </Paper>
                        ))}
                      </Paper>
                    ))
                  )}
                </Stack>
              </ScrollArea>
              
              {/* Add Correction Input */}
              <Paper withBorder p="sm" radius="md" bg="var(--mantine-color-body)">
                <Stack gap="xs">
                  <Textarea 
                    placeholder="Type new correction or note..."
                    minRows={2}
                    size="sm"
                    value={newCorrectionMsg}
                    onChange={(e) => setNewCorrectionMsg(e.target.value)}
                  />
                  <Group justify="space-between" wrap="nowrap">
                    <TextInput 
                      placeholder="Optional Image URL"
                      size="xs"
                      leftSection={<ImageIcon size={12} />}
                      value={newCorrectionUrl}
                      onChange={(e) => setNewCorrectionUrl(e.target.value)}
                      flex={1}
                    />
                    <Button 
                      size="xs" 
                      onClick={handleAddCorrection} 
                      disabled={!newCorrectionMsg.trim()}
                      leftSection={<Send size={12} />}
                    >
                      Post Note
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="history">
              <Timeline active={orderHistory.length} bulletSize={24} lineWidth={2} mt="md">
                {orderHistory.map((h, i) => (
                  <Timeline.Item 
                    key={h.id} 
                    bullet={i === 0 ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    title={<Text size="sm" fw={600}>{h.status}</Text>}
                  >
                    <Text c="dimmed" size="xs" mt={4} ff="monospace">
                      Started: {new Date(h.start_date).toLocaleString()}
                    </Text>
                    {h.end_date && (
                      <Text c="dimmed" size="xs" ff="monospace">
                        Ended: {new Date(h.end_date).toLocaleString()}
                      </Text>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Tabs.Panel>
          </Box>
        </Tabs>
      </Paper>
    </Stack>
  );

  const TitleBar = (
    <Group justify="space-between" w="100%" mr={20}>
      <Group gap="sm">
        <Badge variant="filled" color="blue" size="sm" radius="sm">ORDER CARD</Badge>
        <Text size="sm" ff="monospace" fw={700} c="dimmed">{order.order_code}</Text>
      </Group>
      {onViewModeChange && (
        <Group gap={4}>
          <Tooltip label="Fullscreen View">
            <ActionIcon size="sm" variant={viewMode === 'fullscreen' ? 'light' : 'subtle'} onClick={() => onViewModeChange('fullscreen')}>
              <Maximize2 size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Center Modal">
            <ActionIcon size="sm" variant={viewMode === 'center' ? 'light' : 'subtle'} onClick={() => onViewModeChange('center')}>
              <Minimize2 size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Side Peek">
            <ActionIcon size="sm" variant={viewMode === 'sidepeek' ? 'light' : 'subtle'} onClick={() => onViewModeChange('sidepeek')}>
              <PanelRightClose size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    </Group>
  );

  // Determine width based on size
  const getWidth = () => {
    switch (size) {
      case 'narrow': return 400;
      case 'wide': return 900;
      case 'default':
      default:
        return 600;
    }
  };

  if (viewMode === 'sidepeek') {
    return (
      <Drawer
        opened={!!order}
        onClose={onClose}
        position="right"
        size={getWidth()}
        title={TitleBar}
        styles={{ body: { padding: '16px', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' } }}
      >
        {CardContent}
      </Drawer>
    );
  }

  if (viewMode === 'center' || viewMode === 'fullscreen') {
    return (
      <Modal
        opened={!!order}
        onClose={onClose}
        fullScreen={viewMode === 'fullscreen'}
        size={viewMode === 'center' ? getWidth() : undefined}
        title={TitleBar}
        styles={{ body: { padding: '16px', height: viewMode === 'fullscreen' ? 'calc(100vh - 60px)' : '70vh', display: 'flex', flexDirection: 'column' } }}
      >
        {CardContent}
      </Modal>
    );
  }

  return (
    <Box p="sm" h="100%">
      {CardContent}
    </Box>
  );
}
