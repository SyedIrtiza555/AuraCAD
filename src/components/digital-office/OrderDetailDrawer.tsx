// src/components/digital-office/OrderDetailDrawer.tsx
import React from 'react';
import { Drawer, Text, Group, Badge } from '@mantine/core';
import { OrderDetailsSection } from './OrderDetailsSection';
import { 
  Order, 
  Designer, 
  Prospect, 
  Invoice, 
  Correction, 
  OrderStatusHistory, 
  OrderStatus, 
  InvoiceStatus,
  parseOrderCode
} from '../../types';

interface OrderDetailDrawerProps {
  order: Order | null;
  designers: Designer[];
  prospects: Prospect[];
  invoices: Invoice[];
  corrections: Correction[];
  statusHistory: OrderStatusHistory[];
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateDesigner: (orderId: string, designerId: string) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onAddCorrection: (orderId: string, message: string, authorName: string, imageUrl?: string) => void;
}

export function OrderDetailDrawer({
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
  onAddCorrection
}: OrderDetailDrawerProps) {
  if (!order) return null;

  const parsed = parseOrderCode(order.order_code);

  return (
    <Drawer
      opened={!!order}
      onClose={onClose}
      position="right"
      size="xl"
      title={
        <Group gap="xs">
          <Badge variant="filled" color="blue" size="sm" radius="sm">
            ORDER INSPECTOR
          </Badge>
          <Text size="xs" ff="monospace" fw={700} c="dimmed">
            {order.order_code}
          </Text>
        </Group>
      }
      padding="md"
      overlayProps={{ backgroundOpacity: 0.35, blur: 3 }}
      styles={{
        body: {
          paddingBottom: '2rem'
        }
      }}
    >
      <OrderDetailsSection
        order={order}
        designers={designers}
        prospects={prospects}
        invoices={invoices}
        corrections={corrections}
        statusHistory={statusHistory}
        onClose={onClose}
        onUpdateStatus={onUpdateStatus}
        onUpdateDesigner={onUpdateDesigner}
        onUpdateInvoiceStatus={onUpdateInvoiceStatus}
        onAddCorrection={onAddCorrection}
      />
    </Drawer>
  );
}
