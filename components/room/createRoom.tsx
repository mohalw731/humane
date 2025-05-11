import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@radix-ui/react-dialog';
import { Plus, X } from 'lucide-react';

type CreateRoomModalProps = {
  isAdmin: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  onRoomNameChange: (name: string) => void;
  onCreate: () => void;
};

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isAdmin,
  isOpen,
  onOpenChange,
  roomName,
  onRoomNameChange,
  onCreate,
}) => {
  if (!isAdmin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center p-3 text-white">
          {/* <Plus size={20} /> */}
          Skapa team
        </button>
      </DialogTrigger>
      <DialogContent className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#18181B] p-6 rounded-lg max-w-md w-full border border-[#2D2D30]">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl  text-white">Skapa nytt <span className='text-primary'>team</span></DialogTitle>
            <DialogClose className="text-primary transition-colors">
              <X size={20} />
            </DialogClose>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => onRoomNameChange(e.target.value)}
              className="w-full p-2 bg-[#1F1F23] border border-[#2D2D30] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A3A3D]"
            />
            <button
              onClick={onCreate}
              className="w-full p-2 text-md bg-[#BCCCE4] text-black rounded-xl hover:bg-[#BCCCE4]/90 transition-colors "
            >
              Skapa 
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};