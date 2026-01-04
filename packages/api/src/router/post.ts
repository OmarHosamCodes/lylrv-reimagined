import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure, publicProcedure } from "../trpc";

// Post type for legacy template component
export interface Post {
	id: string;
	title: string;
	content: string;
}

// TODO: Post table needs to be added to schema
// This is a stub router for now
export const postRouter = {
	all: publicProcedure.query((): Post[] => {
		return [];
	}),

	byId: publicProcedure
		.input(z.object({ id: z.string() }))
		.query((): Post | null => {
			return null;
		}),

	create: protectedProcedure
		.input(z.object({ title: z.string(), content: z.string() }))
		.mutation((): Post | null => {
			return null;
		}),

	delete: protectedProcedure.input(z.string()).mutation(() => {
		return null;
	}),
} satisfies TRPCRouterRecord;
