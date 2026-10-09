// src/components/digital-office/NewOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  TextInput, 
  Select, 
  Button, 
  Group, 
  Stack, 
  Text, 
  Badge, 
  Paper, 
  Grid,
  NumberInput,
  Tooltip
} from '@mantine/core';
import { 
  Sparkles, 
  Plus, 
  Flame, 
  User, 
  Building2, 
  ShoppingBag,
  Info
} from 'lucide-react';
import { useMediaQuery } from '@mantine/hooks';
import { 
  Designer, 
  Prospect, 
  OrderStatus, 
  EffortLevel, 
  ORDER_STATUSES, 
  EFFORT_LEVELS,
  formatOrderCode
} from '../../types';

interface NewOrderModalProps {
  isOpen: boolean;
  designers: Designer[];
  prospects: Prospect[];
  preselectedProspect?: Prospect | null;
  onClose: () => void;
  onSubmit: (orderData: {
    name: string;
    status: OrderStatus;
    effort_level: EffortLevel;
    order_value: number;
    designer_id: string;
    prospect_id: string;
    custom_order_code?: string;
  }) => void;
}

export function NewOrderModal({
  isOpen,
  designers,
  prospects,
  preselectedProspect,
  onClose,
  onSubmit
}: NewOrderModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [name, setName] = useState('Three stone ring');
  const [orderValue, setOrderValue] = useState<number>(9400);
  const [status, setStatus] = useState<OrderStatus>('Designing');
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('High');
  const [designerId, setDesignerId] = useState(designers[0]?.id || '');
  const [prospectId, setProspectId] = useState(preselectedProspect?.id || prospects[0]?.id || '');

  // Keep prospect synced if preselectedProspect changes
  useEffect(() => {
    if (preselectedProspect) {
      setProspectId(preselectedProspect.id);
    }
  }, [preselectedProspect]);

  // Compute live 3-part Order Code: <DesignerCode>-<ClientCode>-<OrderName>
  const selectedDesigner = designers.find(d => d.id === designerId);
  const selectedProspect = prospects.find(p => p.id === prospectId);
  
  const designerCode = selectedDesigner?.code || 'FU';
  const clientCode = selectedProspect?.code || 'CA';
  const generatedCode = formatOrderCode(designerCode, clientCode, name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      status,
      effort_level: effortLevel,
      order_value: Number(orderValue) || 5000,
      designer_id: designerId,
      prospect_id: prospectId,
      custom_order_code: generatedCode
    });

    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ShoppingBag size={18} className="text-blue-500" />
          <Text fw={700} size="sm">Create New Bespoke Order</Text>
        </Group>
      }
      radius="lg"
      fullScreen={isMobile}
      size={isMobile ? '100%' : 'lg'}
      overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          
          {/* Live Order Code PK Anatomy Preview */}
          <Paper p="sm" radius="md" withBorder className="bg-slate-50 dark:bg-slate-800/60">
            <Group justify="space-between" align="center" mb={4}>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                Generated Primary Key (PK) Schema
              </Text>
              <Badge variant="dot" color="blue" size="xs">
                &lt;DesignerCode&gt;-&lt;ClientCode&gt;-&lt;OrderName&gt;
              </Badge>
            </Group>

            <Group gap="xs" align="center" my={4}>
              <Badge color="grape" size="md" variant="filled">
                {designerCode}
              </Badge>
              <Text size="xs" fw={700} c="dimmed">-</Text>
              <Badge color="teal" size="md" variant="filled">
                {clientCode}
              </Badge>
              <Text size="xs" fw={700} c="dimmed">-</Text>
              <Badge color="blue" size="md" variant="outline">
                {name || 'Piece Name'}
              </Badge>
            </Group>

            <Text size="xs" ff="monospace" c="dimmed" mt={4}>
              PK: <span className="font-bold text-slate-900 dark:text-slate-100">{generatedCode}</span>
            </Text>
          </Paper>

          {/* Piece Name */}
          <TextInput
            label="Bespoke Jewelry Piece Name & Brief"
            placeholder="e.g. Three stone ring or Solitaire 1.5ct Diamond Ring"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            size="sm"
          />

          <Grid>
            {/* Designer Selector */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="CAD Designer Specialist (1:N)"
                value={designerId}
                onChange={(val) => val && setDesignerId(val)}
                data={designers.map(d => ({
                  value: d.id,
                  label: `${d.name} (${d.code})`
                }))}
                required
                size="sm"
              />
            </Grid.Col>

            {/* Client / Prospect Selector */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Client / Prospect (1:N)"
                value={prospectId}
                onChange={(val) => val && setProspectId(val)}
                data={prospects.map(p => ({
                  value: p.id,
                  label: `${p.name} - ${p.company} (${p.code})`
                }))}
                required
                size="sm"
              />
            </Grid.Col>
          </Grid>

          <Grid>
            {/* Order Value */}
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label="Order Value ($ USD)"
                value={orderValue}
                onChange={(val) => setOrderValue(Number(val) || 0)}
                min={0}
                step={500}
                required
                size="sm"
              />
            </Grid.Col>

            {/* Effort Level */}
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Effort Level"
                value={effortLevel}
                onChange={(val) => val && setEffortLevel(val as EffortLevel)}
                data={EFFORT_LEVELS.map(eff => ({ value: eff, label: eff }))}
                required
                size="sm"
              />
            </Grid.Col>

            {/* Initial Status */}
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Initial Stage"
                value={status}
                onChange={(val) => val && setStatus(val as OrderStatus)}
                data={[
                  { value: 'Pending', label: 'Pending (Queue)' },
                  { value: 'Designing', label: 'Designing (Active Bench)' }
                ]}
                required
                size="sm"
              />
            </Grid.Col>
          </Grid>

          {/* Modal Actions */}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button type="submit" color="blue" size="sm">
              Create Bespoke Order & Invoice
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
