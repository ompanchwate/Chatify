import {defineSchema, defineTable} from 'convex/server'
import { v } from 'convex/values'  // validator

export default defineSchema({
    // create file named tasks, and write the queries
    tasks: defineTable({
        text: v.string(),
        completed: v.boolean()
    }),
    products: defineTable({
        name: v.string(),
        price : v.number(),
    }),
})