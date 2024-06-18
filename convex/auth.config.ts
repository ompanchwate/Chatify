const authConfig = {
	providers: [
		{
			// Here I'm getting the domain value from process.env.CLERK_ISSUER_URL. If you want to do the same thing set this as an environment variable in your Convex Dashboard
			// This is something I updated after the video. The reason is: we would like to keep our secrets out of our codebase.
			//
			domain: "https://polite-haddock-27.clerk.accounts.dev",
			applicationID: "convex",
		},
	],
};

export default authConfig;