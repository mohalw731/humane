import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

type JoinRoomModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  accessKey: string;
  onAccessKeyChange: (key: string) => void;
  onJoin: () => void;
};

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onOpenChange,
  accessKey,
  onAccessKeyChange,
  onJoin,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="px-2 text-white  rounded-xl ">
          Joina ett team
        </button>
      </DialogTrigger>
      <DialogContent className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#18181B] p-6 rounded-lg max-w-md w-full border border-[#2D2D30]">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl text-white">Join a new <span className='text-primary'>team</span></DialogTitle>
            <DialogClose className="text-primary">
              <X size={20} />
            </DialogClose>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Access key"
              value={accessKey}
              onChange={(e) => onAccessKeyChange(e.target.value)}
              className="w-full p-2 bg-[#1F1F23] border border-[#2D2D30] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A3A3D]"
            />
            <button
              onClick={onJoin}
              className="w-full p-2 text-md bg-[#BCCCE4] text-black rounded-xl hover:bg-[#BCCCE4]/90 transition-colors "
            >
              Join
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};