import React, { useState } from 'react';
import { Modal, TextInput, Button, Group, Stack, Text, Grid } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Building2 } from 'lucide-react';

interface NewProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prospect: {
    name: string;
    code: string;
    company: string;
    email: string;
    phone: string;
  }) => void;
}

export function NewProspectModal({ isOpen, onClose, onSubmit }: NewProspectModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Auto-generate 2-letter client code from company or name
  const handleCompanyChange = (val: string) => {
    setCompany(val);
    if (!code || code.length <= 2) {
      const parts = val.trim().split(/\s+/);
      if (parts.length >= 2) {
        setCode((parts[0][0] + parts[1][0]).toUpperCase());
      } else if (parts[0]?.length >= 2) {
        setCode(parts[0].slice(0, 2).toUpperCase());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase() || 'CLI',
      company: company.trim() || 'Direct Client',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      phone: phone.trim() || '+1 555-0199'
    });

    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Building2 size={18} className="text-teal-500" />
          <Text fw={700} size="sm">Add Client / Prospect Portfolio</Text>
        </Group>
      }
      radius="lg"
      fullScreen={isMobile}
      size={isMobile ? '100%' : 'md'}
      overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput
            label="Client Contact Name"
            placeholder="e.g. Sarah Jenkins or Richard Davenport"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            size="sm"
          />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <TextInput
                label="Company / Brand"
                placeholder="e.g. Crown Atelier or Davenport Fine Diamonds"
                value={company}
                onChange={(e) => handleCompanyChange(e.target.value)}
                required
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Client Code"
                placeholder="e.g. CA, VC"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                size="sm"
                description="Used in Order PK"
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Email"
                placeholder="client@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Phone"
                placeholder="+1 555-0188"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                size="sm"
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button type="submit" color="teal" size="sm">
              Add Prospect
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
