import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const sendTextMessage = mutation({
    args: {
        sender: v.string(),
        content: v.string(),
        conversation: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Not authenticated");
        }

        const modifiedTokenIdentifier = identity.tokenIdentifier.replace("https://", "");
        // get the current user
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", modifiedTokenIdentifier))
            .unique();

        if (!user) {
            throw new ConvexError("User not found");
        }

        const conversation = await ctx.db
            .query("conversations")
            .filter((q) => q.eq(q.field("_id"), args.conversation))
            .first();

        if (!conversation) {
            throw new ConvexError("Conversation not found");
        }

        if (!conversation.participants.includes(user._id)) {
            throw new ConvexError("You are not part of this conversation");
        }

        await ctx.db.insert("messages", {
            sender: args.sender,
            content: args.content,
            conversation: args.conversation,
            messageType: "text",
        });

        // TODO => add @gpt check later
        // if (args.content.startsWith("@gpt")) {
        // 	// Schedule the chat action to run immediately
        // 	await ctx.scheduler.runAfter(0, api.openai.chat, {
        // 		messageBody: args.content,
        // 		conversation: args.conversation,
        // 	});
        // }

        // if (args.content.startsWith("@dall-e")) {
        // 	await ctx.scheduler.runAfter(0, api.openai.dall_e, {
        // 		messageBody: args.content,
        // 		conversation: args.conversation,
        // 	});
        // }
    }
});