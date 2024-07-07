import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
    args: {
        participants: v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.id("_storage")),
        admin: v.optional(v.id("users"))

    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Unauthorized");

        // Queries the database to check if a conversation with the same participants already exists. It uses the filter method to check both orders of participants (original and reversed).
        const existingConversation = await ctx.db.query("conversations").filter(q => q.or(q.eq(q.field("participants"), args.participants),
            q.eq(q.field("participants"), args.participants.reverse()))).first();

        if (existingConversation) return existingConversation._id;

        let groupImage;
        if (args.groupImage) {
            // upload image
            groupImage = (await ctx.storage.getUrl(args.groupImage)) as string
        }

        const conversationId = await ctx.db.insert("conversations", {
            participants: args.participants,
            isGroup: args.isGroup,
            groupName: args.groupName,
            groupImage,
            admin: args.admin
        })

        return conversationId;
    }
})

export const getMyConversations = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity(); // get user identity
        if (!identity) throw new ConvexError("User Unauthorized");
        const modifiedTokenIdentifier = identity.tokenIdentifier.replace("https://", ""); 
        // get the current user
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", modifiedTokenIdentifier))
            .unique();

        if (!user) throw new ConvexError("User not found");
        // Get all conversations
        const conversations = await ctx.db.query("conversations").collect();
        // Get conversations which includes the user
        const myConversations = conversations.filter((conversation) => {
            return conversation.participants.includes(user._id)
        });

        const conversationsWithDetails = await Promise.all(
            myConversations.map(async (conversation) => {
                let userDetails = {}; // stores the userDetails 
                // If no a group
                if (!conversation.isGroup) {
                    const otherUserId = conversation.participants.find(id => id !== user._id); // get other user
                    // it is an array (take() gives array)
                    const userProfile = await ctx.db.query("users").filter(q => q.eq(q.field("_id"), otherUserId)).take(1); // get user profile details 

                    userDetails = userProfile[0];
                }
                // if not group then just add the lastMessage
                const lastMessage = await ctx.db.query("messages").filter((q) => q.eq(q.field("conversation"), conversation._id)).order("desc").take(1)

                // RETURN SHOULD BE IN THIS ORDER ONLY, OTHERWISE THE _ID FIELD WILL BE OVERWRITTEN
                return {
                    ...userDetails,
                    ...conversation,
                    lastMessage: lastMessage[0] || null,
                }
            })
        )
        return conversationsWithDetails;
    }
});

export const kickUser =  mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users")
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new ConvexError("Unauthorized");

        const conversation = await ctx.db
        .query("conversations")
        .filter((q) => q.eq(q.field("_id"), args.conversationId))
        .unique();

        if(!conversation) throw new ConvexError("Conversation not found");

        await ctx.db.patch(args.conversationId, {
            participants: conversation.participants.filter((id) => id !== args.userId)
        })
    }
})

// asynchronous mutation function that generates a URL for uploading files to a storage service. 
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
})

