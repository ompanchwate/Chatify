import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
	path: "/clerk",
	method: "POST",
	handler: httpAction(async (ctx, req) => {
		const payloadString = await req.text();
		const headerPayload = req.headers;

		try {
            // clerk is another file and fulfill is the function and we send all the headers and payload to it
			const result = await ctx.runAction(internal.clerk.fulfill, {
				payload: payloadString,
				headers: {
					"svix-id": headerPayload.get("svix-id")!,
					"svix-signature": headerPayload.get("svix-signature")!,
					"svix-timestamp": headerPayload.get("svix-timestamp")!,
				},
			});

            // actions (type of request :- CREATE/UPDATE/SESSION_CREATED/SESSION_ENDED)
			switch (result.type) {
				case "user.created":
                    // data.id : clerk ID 
					await ctx.runMutation(internal.users.createUser, {
						tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.id}`,
						email: result.data.email_addresses[0]?.email_address,
						name: `${result.data.first_name ?? "Guest"} ${result.data.last_name ?? ""}`,
						image: result.data.image_url,
					});
					break;
				case "user.updated":
					await ctx.runMutation(internal.users.updateUser, {
						tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.id}`,
						image: result.data.image_url,
					});
					break;
				case "session.created":
                    // user_id : 
					await ctx.runMutation(internal.users.setUserOnline, {
						tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.user_id}`,
					});
					break;
				case "session.ended":
					await ctx.runMutation(internal.users.setUserOffline, {
						tokenIdentifier: `${process.env.CLERK_APP_DOMAIN}|${result.data.user_id}`,
					});
					break;
			}

			return new Response(null, {
				status: 200,
			});
		} catch (error) {
			console.log("Webhook Error🔥🔥", error);
			return new Response("Webhook Error", {
				status: 400,
			});
		}
	}),
});

export default http;

// https://docs.convex.dev/functions/http-actions
// Internal functions can only be called by other functions and cannot be called directly from a Convex client.


/* data.user_id ::  When a session is created or ended ("session.created" and "session.ended" events), 
data.user_id represents the unique identifier of the user associated with the session. 
This is used to update the user's online/offline status in your system.
Example: In the "session.created" case, data.user_id is combined with your CLERK_APP_DOMAIN to create a unique tokenIdentifier 
that is used to set the user as online in your application. 

data.id (clerk related) :: When a user is created or updated ("user.created" and "user.updated" events), data.id represents the unique identifier assigned to the user by Clerk. 
This is used to create or update the user record in your system.
Example: In the "user.created" case, data.id is combined with your CLERK_APP_DOMAIN to create a unique tokenIdentifier that is used to 
identify the user within your application.

*/