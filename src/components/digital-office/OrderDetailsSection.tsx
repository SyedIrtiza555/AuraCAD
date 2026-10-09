// src/components/digital-office/OrderDetailsSection.tsx
// Mantine UI Powered Order Details Section for Digital Office System
import React, { useState } from 'react';
import {
  Paper,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Grid,
  Badge,
  Button,
  ActionIcon,
  Timeline,
  Divider,
  Avatar,
  Select,
  TextInput,
  Textarea,
  Tabs,
  Tooltip,
  CopyButton,
  Alert,
  Box,
  SimpleGrid
} from '@mantine/core';
import { 
  X, 
  Clock, 
  DollarSign, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  Paperclip, 
  Plus, 
  ArrowRight, 
  Calendar, 
  FileText,
  Flame,
  Send,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Palette,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  Order, 
  Designer, 
  Prospect, 
  Invoice, 
  Correction, 
  OrderStatusHistory, 
  OrderStatus, 
  ORDER_STATUSES,
  InvoiceStatus,
  INVOICE_STATUSES,
  parseOrderCode
} from '../../types';

interface OrderDetailsSectionProps {
  order: Order | null;
  designers: Designer[];
  prospects: Prospect[];
  invoices: Invoice[];
  corrections: Correction[];
  statusHistory: OrderStatusHistory[];
  onClose?: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateDesigner: (orderId: string, designerId: string) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onAddCorrection: (orderId: string, message: string, authorName: string, imageUrl?: string) => void;
  hideFinancials?: boolean;
  hideClientContact?: boolean;
}

export function OrderDetailsSection({
  order,
  designers,
  prospects,
  invoices,
  corrections,
  statusHistory,
  onClose,
  onUpdateStatus,
  onUpdateDesigner,
  onUpdateInvoiceStatus,
  onAddCorrection,
  hideFinancials = false,
  hideClientContact = false
}: OrderDetailsSectionProps) {
  if (!order) {
    return (
      <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
        <Text c="dimmed">No order selected. Select an order from the table to view details.</Text>
      </Paper>
    );
  }

  // Parse 3-part code PK: <DesignerCode>-<ClientCode>-<OrderName>
  const parsedCode = parseOrderCode(order.order_code);

  // Resolve 1:N and 1:1 relations
  const designer = designers.find(d => d.id === order.designer_id);
  const prospect = prospects.find(p => p.id === order.prospect_id);
  const invoice = invoices.find(inv => inv.order_id === order.id);
  
  const orderCorrections = corrections
    .filter(c => c.order_id === order.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const orderHistory = statusHistory
    .filter(sh => sh.order_id === order.id)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  // Correction Form State
  const [correctionMsg, setCorrectionMsg] = useState('');
  const [correctionAuthor, setCorrectionAuthor] = useState(
    prospect?.name ? `${prospect.name} (Client)` : 'Client'
  );
  const [correctionImageUrl, setCorrectionImageUrl] = useState('');

  const handleAddCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionMsg.trim()) return;

    onAddCorrection(
      order.id,
      correctionMsg.trim(),
      correctionAuthor,
      correctionImageUrl.trim() ? correctionImageUrl.trim() : undefined
    );

    setCorrectionMsg('');
    setCorrectionImageUrl('');
  };

  // Turnaround duration calculator
  const formatDuration = (startDateStr: string, endDateStr: string | null) => {
    const start = new Date(startDateStr).getTime();
    const end = endDateStr ? new Date(endDateStr).getTime() : Date.now();
    const diffMs = end - start;

    if (diffMs <= 0) return '< 1 hour';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;

    if (days === 0 && hours === 0) return 'Just started';
    if (days === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    if (hours === 0) return `${days} day${days > 1 ? 's' : ''}`;
    return `${days}d ${hours}h`;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'yellow';
      case 'Designing': return 'brandCyan';
      case 'Review': return 'indigo';
      case 'Completed': return 'brandLime';
      case 'Cancelled': return 'brandCrimson';
      default: return 'gray';
    }
  };

  const getEffortColor = (effort: Order['effort_level']) => {
    switch (effort) {
      case 'Urgent': return 'brandCrimson';
      case 'High': return 'orange';
      case 'Medium': return 'brandCyan';
      case 'Low': return 'gray';
      default: return 'gray';
    }
  };

  const getInvoiceColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid': return 'brandLime';
      case 'Sent': return 'brandCyan';
      case 'Draft': return 'yellow';
      case 'Overdue': return 'brandCrimson';
      case 'Cancelled': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <Paper 
      p="lg" 
      radius="lg" 
      withBorder 
      shadow="sm"
      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all"
    >
      <Stack gap="md">
        
        {/* Top Header & PK Anatomy */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <Box style={{ flex: 1, minWidth: 0, width: '100%' }}>
            
            {/* 3-Part Order Code PK Pills */}
            <Group gap="xs" mb="xs" wrap="wrap">
              <Tooltip label="1. Designer Code">
                <Badge variant="filled" color="grape" size="sm" radius="md">
                  {parsedCode.designerCode || designer?.code || 'DES'}
                </Badge>
              </Tooltip>

              <Text size="xs" c="dimmed" fw={700}>-</Text>

              <Tooltip label="2. Client Code">
                <Badge variant="filled" color="brandLime" c="dark.9" size="sm" radius="md">
                  {parsedCode.clientCode || prospect?.code || 'CLI'}
                </Badge>
              </Tooltip>

              <Text size="xs" c="dimmed" fw={700}>-</Text>

              <Tooltip label="3. Bespoke Order Name">
                <Badge variant="outline" color="brandCyan" size="sm" radius="md">
                  {order.name}
                </Badge>
              </Tooltip>

              <Badge variant="dot" color={getEffortColor(order.effort_level)} size="sm">
                Effort: {order.effort_level}
              </Badge>
            </Group>

            {/* Main Order Title & Full PK Key */}
            <div className="flex items-center gap-2 flex-wrap">
              <Title order={3} className="text-slate-900 dark:text-slate-100 text-lg sm:text-xl break-words">
                {order.name}
              </Title>
              
              {/* Copy PK Button */}
              <CopyButton value={order.order_code} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied PK' : 'Copy Order Code PK'}>
                    <ActionIcon 
                      color={copied ? 'brandLime' : 'gray'} 
                      variant="subtle" 
                      size="sm" 
                      onClick={copy}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </div>

            <Text size="xs" c="dimmed" ff="monospace" mt={2} className="break-all">
              Primary Key: <span className="font-bold text-slate-800 dark:text-slate-200">{order.order_code}</span> • Created {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </Box>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            <Paper p="xs" px="md" radius="md" withBorder className="bg-slate-50 dark:bg-slate-800/80">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                {hideFinancials ? 'Order Type' : 'Order Value'}
              </Text>
              <Text size={hideFinancials ? "sm" : "lg"} fw={800} ff="monospace" c="brandCyan.5">
                {hideFinancials ? 'Bespoke CAD Mount' : `$${order.order_value.toLocaleString()}`}
              </Text>
            </Paper>

            {onClose && (
              <ActionIcon 
                variant="subtle" 
                color="gray" 
                size="lg" 
                onClick={onClose} 
                radius="md"
                aria-label="Close Order Details"
              >
                <X size={18} />
              </ActionIcon>
            )}
          </div>
        </div>

        {/* Interactive Status Flow Stepper */}
        <Paper p="xs" radius="md" withBorder className="bg-slate-50/60 dark:bg-slate-800/40 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-[340px] sm:min-w-0 w-full justify-between">
            {(['Pending', 'Designing', 'Review', 'Completed'] as OrderStatus[]).map((st, idx, arr) => {
              const isActive = order.status === st;
              return (
                <React.Fragment key={st}>
                  <Button
                    size="xs"
                    radius="md"
                    variant={isActive ? 'filled' : 'default'}
                    color={isActive ? getStatusColor(st) : 'gray'}
                    onClick={() => onUpdateStatus(order.id, st)}
                    leftSection={isActive ? <CheckCircle2 size={12} /> : undefined}
                    className="flex-1 text-[11px] sm:text-xs px-2"
                  >
                    {st}
                  </Button>
                  {idx < arr.length - 1 && (
                    <ArrowRight size={12} className="text-slate-400 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </Paper>

        {/* 3 Relational Summary Cards: Designer (1:N), Client (1:N), Invoice (1:1) */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          
          {/* Card 1: Designer Specialist (1:N) */}
          <Card padding="md" radius="md" withBorder className="bg-white dark:bg-slate-900">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <User size={14} className="text-purple-500" />
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Designer Specialist (1:N)
                </Text>
              </Group>
              <Badge size="xs" color="grape" variant="light">
                Code: {designer?.code || 'FU'}
              </Badge>
            </Group>

            {designer ? (
              <Stack gap={4}>
                <Text fw={700} size="sm" c="dark.0">
                  {designer.name}
                </Text>
                <Text size="xs" c="grape" fw={600}>
                  {designer.specialty || 'General High-Jewelry CAD'}
                </Text>
                <Text size="xs" c="dimmed">
                  {designer.email}
                </Text>
                <Text size="xs" c="dimmed">
                  {designer.phone}
                </Text>

                <Box mt="xs">
                  <Select
                    size="xs"
                    label="Reassign CAD Designer"
                    value={order.designer_id}
                    onChange={(val) => val && onUpdateDesigner(order.id, val)}
                    data={designers.map(d => ({
                      value: d.id,
                      label: `${d.name} (${d.code})`
                    }))}
                  />
                </Box>
              </Stack>
            ) : (
              <Text size="xs" c="dimmed" fs="italic">No designer allocated.</Text>
            )}
          </Card>

          {/* Card 2: Client / Prospect (1:N) */}
          <Card padding="md" radius="md" withBorder className="bg-white dark:bg-slate-900">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <Building2 size={14} className="text-teal-500" />
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Client / Prospect (1:N)
                </Text>
              </Group>
              <Badge size="xs" color="teal" variant="light">
                Code: {prospect?.code || 'CA'}
              </Badge>
            </Group>

            {prospect ? (
              <Stack gap={4}>
                <Text fw={700} size="sm" c="dark.0">
                  {prospect.name}
                </Text>
                <Text size="xs" c="teal" fw={600}>
                  {prospect.company}
                </Text>
                <Text size="xs" c="dimmed">
                  {hideClientContact ? 'Confidential (Admin/Agent Only)' : prospect.email}
                </Text>
                <Text size="xs" c="dimmed">
                  {hideClientContact ? 'Direct VIP Client' : prospect.phone}
                </Text>
                <Badge variant="outline" color="teal" size="xs" mt="xs">
                  VIP Direct Bespoke Client
                </Badge>
              </Stack>
            ) : (
              <Text size="xs" c="dimmed" fs="italic">No prospect attached.</Text>
            )}
          </Card>

          {/* Card 3: Linked Invoice (1:1 with Order) */}
          <Card padding="md" radius="md" withBorder className="bg-white dark:bg-slate-900">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <FileText size={14} className="text-amber-500" />
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Linked Invoice (1:1)
                </Text>
              </Group>
              {invoice && (
                <Badge size="xs" color={getInvoiceColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              )}
            </Group>

            {invoice ? (
              <Stack gap={4}>
                <Text fw={700} size="sm" ff="monospace">
                  {invoice.invoice_number}
                </Text>
                <Text size="xs" c="dimmed">
                  Due: {invoice.due_date || 'Net 14 Days'}
                </Text>
                <Text size="sm" fw={800} ff="monospace" c={hideFinancials ? "dimmed" : "blue"}>
                  {hideFinancials ? 'Confidential (Studio Billing)' : `$${invoice.amount.toLocaleString()}`}
                </Text>

                {!hideFinancials && (
                  <Box mt="xs">
                    <Select
                      size="xs"
                      label="Payment Status"
                      value={invoice.status}
                      onChange={(val) => val && onUpdateInvoiceStatus(invoice.id, val as InvoiceStatus)}
                      data={INVOICE_STATUSES.map(st => ({ value: st, label: st }))}
                    />
                  </Box>
                )}
              </Stack>
            ) : (
              <Text size="xs" c="dimmed" fs="italic">No invoice record found.</Text>
            )}
          </Card>
        </SimpleGrid>

        {/* Detailed Sections Tabs: (1) Status History Timeline, (2) Corrections & Feedback */}
        <Tabs defaultValue="history" radius="md">
          <Tabs.List className="flex overflow-x-auto no-scrollbar flex-nowrap">
            <Tabs.Tab 
              value="history" 
              leftSection={<Clock size={13} />}
            >
              Status History & Durations ({orderHistory.length})
            </Tabs.Tab>
            <Tabs.Tab 
              value="corrections" 
              leftSection={<MessageSquare size={13} />}
            >
              Corrections & Feedback ({orderCorrections.length})
            </Tabs.Tab>
          </Tabs.List>

          {/* Tab 1: Status History with Precise Turnaround Calculation */}
          <Tabs.Panel value="history" pt="md">
            <Card padding="md" radius="md" withBorder>
              <Text size="xs" c="dimmed" mb="md">
                Continuous stage duration tracking for designer turnaround benchmarks and studio bottleneck analysis.
              </Text>

              <Timeline active={orderHistory.length - 1} bulletSize={22} lineWidth={2}>
                {orderHistory.length === 0 ? (
                  <Text size="xs" c="dimmed" fs="italic">No stage logs recorded.</Text>
                ) : (
                  orderHistory.map((sh, idx) => {
                    const isCurrent = sh.end_date === null;
                    const duration = formatDuration(sh.start_date, sh.end_date);

                    return (
                      <Timeline.Item
                        key={sh.id}
                        title={
                          <Group gap="xs">
                            <Text size="sm" fw={700}>
                              {sh.status}
                            </Text>
                            {isCurrent ? (
                              <Badge size="xs" color="blue" variant="filled">Active Now</Badge>
                            ) : (
                              <Badge size="xs" color="gray" variant="light">Completed</Badge>
                            )}
                          </Group>
                        }
                        color={getStatusColor(sh.status)}
                      >
                        <Text size="xs" c="blue" fw={600}>
                          {isCurrent ? `Active for ${duration}` : `Turnaround: took ${duration}`}
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace" mt={2}>
                          {new Date(sh.start_date).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {sh.end_date ? (
                            <> → {new Date(sh.end_date).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</>
                          ) : (
                            <> → Ongoing</>
                          )}
                        </Text>
                      </Timeline.Item>
                    );
                  })
                )}
              </Timeline>
            </Card>
          </Tabs.Panel>

          {/* Tab 2: Corrections & Attachments Feed (1:N) */}
          <Tabs.Panel value="corrections" pt="md">
            <Card padding="md" radius="md" withBorder>
              <Stack gap="md">
                
                {/* List of Corrections */}
                <Stack gap="xs">
                  {orderCorrections.length === 0 ? (
                    <Text size="xs" c="dimmed" fs="italic" ta="center" py="md">
                      No change requests or corrections posted yet.
                    </Text>
                  ) : (
                    orderCorrections.map((cor) => (
                      <Paper key={cor.id} p="sm" radius="md" withBorder className="bg-slate-50 dark:bg-slate-800/50">
                        <Group justify="space-between" mb={4}>
                          <Text size="xs" fw={700} c="dark.0">
                            {cor.author_name || 'Staff User'}
                          </Text>
                          <Text size="xs" c="dimmed" ff="monospace">
                            {new Date(cor.created_at).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </Group>

                        <Text size="xs" style={{ whiteSpace: 'pre-line' }}>
                          {cor.message}
                        </Text>

                        {/* Attachments */}
                        {cor.attachments && cor.attachments.length > 0 && (
                          <Group gap="xs" mt="xs">
                            {cor.attachments.map(att => (
                              <Button
                                key={att.id}
                                component="a"
                                href={att.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="compact-xs"
                                variant="light"
                                color="blue"
                                leftSection={<Paperclip size={11} />}
                              >
                                {att.file_name || 'Attachment Proof'}
                              </Button>
                            ))}
                          </Group>
                        )}
                      </Paper>
                    ))
                  )}
                </Stack>

                <Divider label="Post New Change Request / Correction" labelPosition="center" />

                {/* Add Correction Form */}
                <form onSubmit={handleAddCorrectionSubmit}>
                  <Stack gap="xs">
                    <Grid>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput
                          size="xs"
                          label="Author Name"
                          value={correctionAuthor}
                          onChange={(e) => setCorrectionAuthor(e.target.value)}
                          placeholder="e.g. Sarah Jenkins (Client) or Farooq Qureshi"
                          required
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput
                          size="xs"
                          label="Reference Image URL (Optional)"
                          value={correctionImageUrl}
                          onChange={(e) => setCorrectionImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </Grid.Col>
                    </Grid>

                    <Textarea
                      size="xs"
                      label="Correction Message"
                      placeholder="e.g. Thicken prong tips to 0.85mm for diamond retention safety guarantee..."
                      value={correctionMsg}
                      onChange={(e) => setCorrectionMsg(e.target.value)}
                      rows={3}
                      required
                    />

                    <Group justify="flex-end">
                      <Button
                        type="submit"
                        size="xs"
                        color="brandCyan"
                        leftSection={<Send size={12} />}
                        disabled={!correctionMsg.trim()}
                      >
                        Submit Correction
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>

      </Stack>
    </Paper>
  );
}
