import { ConvexError, v } from 'convex/values';
import { internalMutation, query } from './_generated/server';
// Internal mutation can only be called by other parts of app but not from the client, so it provides security
export const createUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        email: v.string(),
        name: v.string(),
        image: v.string()
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("users", {
            tokenIdentifier: args.tokenIdentifier,
            email: args.email,
            name: args.name,
            image: args.image,
            isOnline: true

        })
    }
})

export const updateUser = internalMutation({
    args: { tokenIdentifier: v.string(), image : v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier)).unique()

        if (!user) {
            throw new ConvexError("user not found")
        }

        await ctx.db.patch(user._id, {image: args.image})
    }
})

export const setUserOffline = internalMutation({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        // finds the user, by_tokenIdentifier is an index of the data 
        const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier)).unique();

        if (!user) {
            throw new ConvexError("User not found");
        }

        // updating the online status
        await ctx.db.patch(user._id, { isOnline: false })
    }
})

export const setUserOnline = internalMutation({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.tokenIdentifier)).unique()

        if (!user) {
            throw new ConvexError("user not found")
        }

        await ctx.db.patch(user._id, {isOnline: true})
    }
})

export const getUsers =  query({
    args : {},
    handler: async(ctx, args) =>{
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError("Unauthorized");
        }

        const users = await ctx.db.query("users").collect();
        return users
    }
})

export const getMe =  query({
    args : {},
    handler: async(ctx, args) =>{
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new ConvexError("Unauthorized");
        }

        const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();

        if(!user) {
            throw new ConvexError("User not found");
        }
        return user;
    }
})

// get group members
