import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSeenSvg } from "@/lib/svgs";
import { ImageIcon, Users, VideoIcon } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useConversationStore } from "@/store/chat-store";

const Conversation = ({ conversation }: { conversation: any }) => {
	// console.log(conversation)
	const conversationImage = conversation.groupImage || conversation.image;
	const conversationName = conversation.groupName || conversation.name;
	const lastMessage = conversation.lastMessage;
	const lastMessageType = lastMessage?.messageType;
	const me = useQuery(api.users.getMe)

	const {setSelectedConversation, selectedConversation} = useConversationStore(); // zustand hook for selectConversation
	const activeBgClass = selectedConversation?._id === conversation._id
	// console.log(conversation)

	return (
		<>
			<div className={`flex gap-2 items-center p-3 hover:bg-chat-hover cursor-pointer ${activeBgClass ? "bg-gray-tertiary" : ""} `}
				onClick={() => {setSelectedConversation(conversation)}}
			>
                {/* AVATAR  */}
				<Avatar className='border border-gray-900 overflow-visible relative'>
					{conversation.isOnline && (
						<div className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground' />
					)}
					<AvatarImage src={conversationImage || "/placeholder.png"} className='object-cover rounded-full' />
					<AvatarFallback>
						<div className='animate-pulse bg-gray-tertiary w-full h-full rounded-full'></div>
					</AvatarFallback>
				</Avatar>
                
				<div className='w-full'>
                    {/* Conversation name */}
					<div className='flex items-center'>
						<h3 className='text-xs lg:text-sm font-medium'>{conversationName}</h3>
						<span className='text-[10px] lg:text-xs text-gray-500 ml-auto'>
							{formatDate(lastMessage?._creationTime || conversation._creationTime)}
						</span>
					</div>
                    {/* message content */}
					<p className='text-[12px] mt-1 text-gray-500 flex items-center gap-1 '>
						{lastMessage?.sender === me?._id ? <MessageSeenSvg /> : ""}
						{conversation.isGroup && <Users size={16} />}
						{!lastMessage && "Say Hi!"}
						{lastMessageType === "text" ? lastMessage?.content.length > 30 ? (
							<span className='text-xs'>{lastMessage?.content.slice(0, 30)}...</span>
						) : (
							<span className='text-xs'>{lastMessage?.content}</span>
						) : null}
						{lastMessageType === "image" && <ImageIcon size={16} />}
						{lastMessageType === "video" && <VideoIcon size={16} />}
					</p>
				</div>
			</div>
			<hr className='h-[1px] mx-10 bg-gray-primary' />
		</>
	);
};
export default Conversation;




// not a group : 
// {
// 	email: "ompanchwate609@gmail.com",
// 	image: "https://img.clerk.com/",
// 	isGroup: false,
// 	isOnline: false,
// 	lastMessage: null,
// 	name: "Om Panchwate",
// 	participants: [
// 	  'jd7z4czqasx8j58g5nn16va3rz',
// 	  'jd77v4xn81jxhj0v4hg56vhx0g'
// 	],
// 	tokenIdentifier: "polite-haddock-27.clerk.accounts.de",
// 	_creationTime: 1719080179934.0369,
// 	_id: "jh78zya75atqherbb4xn6vgsve"
//   }
  

// Group : 
// {
// 	admin: "jdszz4casx8j58n04sn16vz",
// 	groupImage: "https://majestic-vole-679.convex.cloud/rgbreg",
// 	groupName: "new_group12",
// 	isGroup: true,
// 	lastMessage: null,
// 	participants: [
// 	  'jd7dszz4czqasx8j58g5n04sn16v',
// 	  'jd77v4xn817mdjxhj0v4kxvhg56v',
// 	  'jd75gbh2a99zrdee7ey5pq00sh6regre'
// 	],
// 	_creationTime: 1719080853322.9802,
// 	_id: "jh7a3wpbe1rj1vmjvdfge2jhn7474"
//   }
  