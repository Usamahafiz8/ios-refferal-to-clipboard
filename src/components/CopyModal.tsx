import { Modal, Text, Button, CopyButton, TextInput, Stack } from '@mantine/core';

interface CopyModalProps {
  opened: boolean;
  onClose: () => void;
  referralCode: string;
}

export const CopyModal = ({ opened, onClose, referralCode }: CopyModalProps) => {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      title="Copy Your Referral Code"
      centered
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm">
          Please copy your referral code:
        </Text>
        
        <TextInput
          value={referralCode}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
          rightSection={
            <CopyButton value={referralCode}>
              {({ copied, copy }) => (
                <Button 
                  variant="light" 
                  color={copied ? 'teal' : 'blue'} 
                  onClick={copy}
                  size="xs"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </CopyButton>
          }
        />

        <Text size="sm" c="dimmed">
          Tip: You can also tap and hold the code to select and copy it manually
        </Text>
      </Stack>
    </Modal>
  );
}; 