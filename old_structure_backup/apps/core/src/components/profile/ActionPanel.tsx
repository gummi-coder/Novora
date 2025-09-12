
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Award, Pencil, Flag } from "lucide-react";
import { AssignGrowthModal } from "./AssignGrowthModal";
import { SendKudosModal } from "./SendKudosModal";

interface ActionPanelProps {
  userId: string;
  userName: string;
}

export function ActionPanel({ userId, userName }: ActionPanelProps) {
  const [showKudosModal, setShowKudosModal] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  
  const handleFlagForFollowup = () => {
    // This would trigger an API call in a real application
    console.log(`Flagged user ${userId} for follow-up`);
    // Show success toast
    // toast({
    //   title: "Follow-up flagged",
    //   description: `${userName} has been flagged for follow-up.`
    // });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline"
          onClick={() => setShowKudosModal(true)}
          className="flex items-center gap-2"
        >
          <Award className="h-4 w-4" />
          <span>Send Kudos</span>
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setShowGrowthModal(true)}
          className="flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          <span>Assign Growth Task</span>
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleFlagForFollowup}
          className="flex items-center gap-2"
        >
          <Flag className="h-4 w-4" />
          <span>Flag for Follow-up</span>
        </Button>
      </div>

      <SendKudosModal 
        open={showKudosModal}
        onOpenChange={setShowKudosModal}
        userId={userId}
        userName={userName}
      />
      
      <AssignGrowthModal 
        open={showGrowthModal}
        onOpenChange={setShowGrowthModal}
        userId={userId}
        userName={userName}
      />
    </div>
  );
}
