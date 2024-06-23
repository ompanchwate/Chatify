"use client"
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ImageIcon, MessageSquareDiff } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { users } from "@/dummy-data/db";
import toast from "react-hot-toast";

const UserListDialog = () => {
    const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
    const [groupName, setGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [renderedImage, setRenderedImage] = useState("");
    const imgRef = useRef<HTMLInputElement>(null);

    const dialogCloseRef = useRef<HTMLInputElement>(null);

    const createConversation = useMutation(api.conversation.createConversation);
    const generateUploadUrl = useMutation(api.conversation.generateUploadUrl);

    const me = useQuery(api.users.getMe); // get current user
    // console.log(me)
    const users = useQuery(api.users.getUsers); // get all users

    const handleCreateConversation = async () => {
        if (selectedUsers.length === 0) return;
        setIsLoading(true);
        try {
            // checking if it's a group
            const isGroup = selectedUsers.length > 1;

            let conversationId;
            if (!isGroup) {
                conversationId = await createConversation({
                    // ID of user and current user(me)
                    participants: [...selectedUsers, me?._id!],
                    isGroup: false,
                });
            } else {
                // generates the postUrl 
                const postUrl = await generateUploadUrl();

                // Upload the image to the postUrl
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedImage?.type! },
                    body: selectedImage,
                })

                // get the posted data
                const { storageId } = await result.json();

                await createConversation({
                    participants: [...selectedUsers, me?._id!],
                    isGroup: true,
                    admin: me?._id!,
                    groupName,
                    groupImage: storageId,
                })

            }
            dialogCloseRef.current?.click(); // close the dialog box
            // Resetting all the data
            setSelectedUsers([]);
            setGroupName("");
            setSelectedImage(null);

            // TODO : conversationId is never used.. it should be show on the converstaions list


        } catch (err) {
            toast.error("failed to create conversation");
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setRenderedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (!selectedImage) return setRenderedImage("");
        const reader = new FileReader();
        reader.onload = (e) => setRenderedImage(e.target?.result as string);
        reader.readAsDataURL(selectedImage);
    }, [selectedImage]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <MessageSquareDiff size={20} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogClose ref={dialogCloseRef} />
                    <DialogTitle>Users</DialogTitle>
                </DialogHeader>

                <DialogDescription>Start a new chat</DialogDescription>
                {renderedImage && (
                    <div className='w-16 h-16 relative mx-auto'>
                        <Image src={renderedImage} fill alt='user image' className='rounded-full object-cover' />
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    ref={imgRef}
                    hidden
                    onChange={(e) => setSelectedImage(e.target.files![0])}
                />
                {selectedUsers.length > 1 && (
                    <>
                        <Input
                            placeholder='Group Name'
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <Button
                            className='flex gap-2'
                            onClick={() => imgRef.current?.click()}
                        >
                            <ImageIcon size={20} />
                            Group Image
                        </Button>
                        <input
                            type='file'
                            ref={imgRef}
                            className='hidden'
                            accept='image/*'
                            onChange={handleImageUpload}
                        />
                    </>
                )}
                <div className='flex flex-col gap-3 overflow-auto max-h-60'>
                    {users?.map((user) => (
                        <div
                            key={user._id}
                            className={`flex gap-3 items-center p-2 rounded cursor-pointer active:scale-95 transition-all ease-in-out duration-300 ${selectedUsers.includes(user._id) ? "bg-green-primary" : ""
                                }`}
                            onClick={() => {
                                if (selectedUsers.includes(user._id)) {
                                    setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
                                } else {
                                    setSelectedUsers([...selectedUsers, user._id]);
                                }
                            }}
                        >
                            <Avatar className='overflow-visible'>
                                {user.isOnline && (
                                    <div className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground' />
                                )}
                                <AvatarImage src={user.image} className='rounded-full object-cover' />
                                <AvatarFallback>
                                    <div className='animate-pulse bg-gray-tertiary w-full h-full rounded-full'></div>
                                </AvatarFallback>
                            </Avatar>

                            <div className='w-full'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-md font-medium'>{user.name || user.email.split("@")[0]}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='flex justify-between'>
                    <Button variant={"outline"}>Cancel</Button>
                    <Button
                        onClick={handleCreateConversation}
                        disabled={selectedUsers.length === 0 || (selectedUsers.length > 1 && !groupName) || isLoading}
                    >
                        {isLoading ? (
                            <div className='w-5 h-5 border-t-2 border-b-2 rounded-full animate-spin' />
                        ) : (
                            "Create"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserListDialog;