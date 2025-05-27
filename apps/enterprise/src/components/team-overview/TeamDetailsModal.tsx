
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TeamDetails } from './TeamDetails';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeamDetailsModalProps {
  teamId: number;
  onClose: () => void;
}

export const TeamDetailsModal = ({ teamId, onClose }: TeamDetailsModalProps) => {
  const [open, setOpen] = useState(true);
  const isMobile = useIsMobile();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose();
    }
  };

  // Conditionally render Sheet on mobile and Dialog on desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Team Details</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <TeamDetails teamId={teamId} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <TeamDetails teamId={teamId} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
