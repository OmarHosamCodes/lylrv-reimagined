import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { widgetRouter } from "./router/widget";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
	auth: authRouter,
	post: postRouter,
	widget: widgetRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
