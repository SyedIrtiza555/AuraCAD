import React, { useState } from 'react';
import { Modal, TextInput, Button, Group, Stack, Text, Grid } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { User, Sparkles } from 'lucide-react';

interface NewDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (designer: {
    name: string;
    code: string;
    email: string;
    phone: string;
    specialty: string;
  }) => void;
}

export function NewDesignerModal({ isOpen, onClose, onSubmit }: NewDesignerModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');

  // Auto-generate 2-letter code from name
  const handleNameChange = (val: string) => {
    setName(val);
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
      code: code.trim().toUpperCase() || 'DES',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@auracad.local`,
      phone: phone.trim() || '+1 555-0100',
      specialty: specialty.trim() || 'General High-Jewelry CAD'
    });

    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="xs">
          <User size={18} className="text-purple-500" />
          <Text fw={700} size="sm">Add CAD Designer Specialist</Text>
        </Group>
      }
      radius="lg"
      fullScreen={isMobile}
      size={isMobile ? '100%' : 'md'}
      overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <TextInput
                label="Designer Full Name"
                placeholder="e.g. Farooq Qureshi or Liam Sterling"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <TextInput
                label="Designer Code"
                placeholder="e.g. FU, ER"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                size="sm"
                description="Used in Order PK"
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Jewelry Specialty"
            placeholder="e.g. Vintage Filigree & Three-Stone Mounts"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            size="sm"
          />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Email"
                placeholder="designer@auracad.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Phone"
                placeholder="+1 555-0155"
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
            <Button type="submit" color="grape" size="sm">
              Add Designer
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
