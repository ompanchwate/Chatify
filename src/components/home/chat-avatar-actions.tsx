import { IMessage, useConversationStore } from "@/store/chat-store";
import { Ban, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { kickUser } from "../../../convex/conversation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type ChatAvatarActionsProps = {
  message: IMessage;
  me: any
}

const ChatAvatarActions = ({ me, message }: ChatAvatarActionsProps) => {
  const { selectedConversation, setSelectedConversation } = useConversationStore();
  const isMember = selectedConversation?.participants.includes(message.sender._id)
  const kickUser = useMutation(api.conversation.kickUser);
  const createConversation = useMutation(api.conversation.createConversation)

  const handleKickUser = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the chat beacuse of onClick to the parent div
    if (!selectedConversation) return
    try {
      await kickUser({
        conversationId: selectedConversation?._id,
        userId: message.sender._id
      });

      // To show the banned icon in front of the message
      setSelectedConversation({
        ...selectedConversation,
        participants: selectedConversation.participants.filter((id) => id !== message.sender._id)
      })
    } catch (error) {
      toast.error("failed to kick")
    }
  }

  const handleCreateConversation = async() => {
    try {
      const conversationId = await createConversation({
        isGroup: false,
        participants: [me._id, message.sender._id]
      });
      setSelectedConversation({
        _id: conversationId, 
        name: message.sender.name,
        participants: [me._id, message.sender._id],
        isGroup: false,
        isOnline: message.sender.isOnline,
        image: message.sender.image

      })
    } catch (error) {
      toast.error("Failed to create conversation")
    }
  }


  return (
    <div className="text-[11px] flex gap-4 justify-between font-bold cursor-pointer group" 
    onClick={handleCreateConversation}>{message.sender.name}
    {!isMember && <Ban size={16} className="text-red-500"/>}
      {isMember && selectedConversation?.admin === me._id && (
        <LogOut size={16} className="text-red-500 opacity-0 group-hover:opacity-100" onClick={handleKickUser} />
      )}</div>
  )
}

export default ChatAvatarActions