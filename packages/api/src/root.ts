import { authRouter } from "./router/auth";
import { dashboardRouter } from "./router/dashboard";
import { postRouter } from "./router/post";
import { productsRouter } from "./router/products";
import { widgetRouter } from "./router/widget";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  post: postRouter,
  products: productsRouter,
  widget: widgetRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
