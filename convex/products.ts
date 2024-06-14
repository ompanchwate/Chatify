import { v } from 'convex/values'
import {mutation, query} from './_generated/server'

export const getProducts = query({
    args: {},
    handler: async (ctx, args) => {
        // ctx : context
        const products = await ctx.db.query("products").collect()
        return products
    }
})

export const addProducts = mutation({
    args : {
        name : v.string(),
        price : v.number()
    },
    handler : async(ctx, args) => {
        const prodId = ctx.db.insert("products", {name : args.name, price: args.price})
        return prodId
    }
})

export const updateProduct = mutation({
    args : {
        id : v.id("products"),
        new_price : v.number()
    },
    handler : async(ctx, args) => {
        await ctx.db.patch(args.id, {price : args.new_price } )
    }
})

export const deleteProduct = mutation({
    args : {
        id : v.id("products")
    },
    handler : async(ctx, args) => {
        ctx.db.delete(args.id)
    }
})