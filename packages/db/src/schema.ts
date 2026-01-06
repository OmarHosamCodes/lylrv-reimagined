import { sql } from "drizzle-orm";
import {
	bigint,
	boolean,
	check,
	foreignKey,
	index,
	integer,
	jsonb,
	numeric,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm/relations";

export const user = pgTable(
	"user",
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: boolean("email_verified").default(false),
		image: text(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_user_email").using(
			"btree",
			table.email.asc().nullsLast().op("text_ops"),
		),
		unique("user_email_key").on(table.email),
	],
);

export const session = pgTable(
	"session",
	{
		id: text().primaryKey().notNull(),
		userId: text("user_id").notNull(),
		token: text().notNull(),
		expiresAt: timestamp("expires_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_session_token").using(
			"btree",
			table.token.asc().nullsLast().op("text_ops"),
		),
		index("idx_session_user").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_fkey",
		}).onDelete("cascade"),
		unique("session_token_key").on(table.token),
	],
);

export const account = pgTable(
	"account",
	{
		id: text().primaryKey().notNull(),
		userId: text("user_id").notNull(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			withTimezone: true,
			mode: "string",
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			withTimezone: true,
			mode: "string",
		}),
		scope: text(),
		idToken: text("id_token"),
		password: text(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		uniqueIndex("idx_account_provider").using(
			"btree",
			table.providerId.asc().nullsLast().op("text_ops"),
			table.accountId.asc().nullsLast().op("text_ops"),
		),
		index("idx_account_user").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_fkey",
		}).onDelete("cascade"),
	],
);

export const verification = pgTable(
	"verification",
	{
		id: text().primaryKey().notNull(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: timestamp("expires_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_verification_identifier").using(
			"btree",
			table.identifier.asc().nullsLast().op("text_ops"),
		),
	],
);

export const clients = pgTable(
	"clients",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: text("user_id").notNull(),
		name: text(),
		email: text().notNull(),
		apiKey: uuid("api_key").defaultRandom().notNull(),
		type: text().default("free"),
		createSource: text("create_source").notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_clients_api_key").using(
			"btree",
			table.apiKey.asc().nullsLast().op("uuid_ops"),
		),
		index("idx_clients_user").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "clients_user_id_fkey",
		}).onDelete("cascade"),
		unique("clients_api_key_key").on(table.apiKey),
		unique("clients_create_source_key").on(table.createSource),
		check(
			"clients_type_check",
			sql`type = ANY (ARRAY['free'::text, 'hobby'::text, 'super'::text, 'agency'::text, 'pro'::text])`,
		),
	],
);

export const clientConfig = pgTable(
	"client_config",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		integrationType: text("integration_type").default("woocommerce").notNull(),
		storeUrl: text("store_url"),
		isActive: boolean("is_active").default(true),
		theme: jsonb().default({
			color: "#000000",
			buttonIcon: null,
			buttonTextColor: "#000000",
			buttonBackgroundColor: "#ffffff",
		}),
		language: jsonb().default({ locale: "en" }),
		pageSections: jsonb("page_sections").default([]),
		localizations: jsonb().default({}),
		conditions: jsonb().default([]),
		variables: jsonb().default([]),
		interactions: jsonb().default([]),
		earnSections: jsonb("earn_sections").default([]),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_config_client_id_fkey",
		}).onDelete("cascade"),
		unique("client_config_client_id_key").on(table.clientId),
	],
);

export const customers = pgTable(
	"customers",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		name: text().notNull(),
		email: text().notNull(),
		phone: text(),
		externalUserId: text("external_user_id"),
		totalPoints: integer("total_points").default(0),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_customers_client").using(
			"btree",
			table.clientId.asc().nullsLast().op("uuid_ops"),
		),
		index("idx_customers_email_client").using(
			"btree",
			table.email.asc().nullsLast().op("uuid_ops"),
			table.clientId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "customers_client_id_fkey",
		}).onDelete("cascade"),
		unique("customers_client_id_email_key").on(table.clientId, table.email),
	],
);

export const activity = pgTable(
	"activity",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		customerId: uuid("customer_id"),
		email: text().notNull(),
		name: text(),
		amount: integer().notNull(),
		reason: text().notNull(),
		expireDate: timestamp("expire_date", {
			withTimezone: true,
			mode: "string",
		}),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_activity_client_created").using(
			"btree",
			table.clientId.asc().nullsLast().op("uuid_ops"),
			table.createdAt.desc().nullsFirst().op("uuid_ops"),
		),
		index("idx_activity_customer").using(
			"btree",
			table.customerId.asc().nullsLast().op("uuid_ops"),
		),
		index("idx_activity_email_client").using(
			"btree",
			table.email.asc().nullsLast().op("text_ops"),
			table.clientId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "activity_client_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "activity_customer_id_fkey",
		}).onDelete("set null"),
	],
);

export const referrals = pgTable(
	"referrals",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		customerId: uuid("customer_id").notNull(),
		code: varchar({ length: 6 }).notNull(),
		isActive: boolean("is_active").default(false),
		usageCount: integer("usage_count").default(0),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_referrals_client_active")
			.using("btree", table.clientId.asc().nullsLast().op("uuid_ops"))
			.where(sql`(is_active = true)`),
		index("idx_referrals_code").using(
			"btree",
			table.code.asc().nullsLast().op("text_ops"),
		),
		index("idx_referrals_customer").using(
			"btree",
			table.customerId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "referrals_client_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "referrals_customer_id_fkey",
		}).onDelete("cascade"),
		unique("referrals_code_key").on(table.code),
	],
);

export const orders = pgTable(
	"orders",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		orderId: bigint("order_id", { mode: "number" }).notNull(),
		email: text(),
		phone: text(),
		status: text(),
		payment: text(),
		total: numeric({ precision: 10, scale: 2 }),
		billing: jsonb(),
		shipping: jsonb(),
		slugs: text().array(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_orders_client_status").using(
			"btree",
			table.clientId.asc().nullsLast().op("text_ops"),
			table.status.asc().nullsLast().op("uuid_ops"),
		),
		index("idx_orders_email_client").using(
			"btree",
			table.email.asc().nullsLast().op("uuid_ops"),
			table.clientId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "orders_client_id_fkey",
		}).onDelete("cascade"),
		unique("orders_client_id_order_id_key").on(table.clientId, table.orderId),
	],
);

export const products = pgTable(
	"products",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		productId: bigint("product_id", { mode: "number" }).notNull(),
		name: text(),
		slug: text(),
		shortDescription: text("short_description"),
		description: text(),
		isVisible: boolean("is_visible").default(true),
		views: integer().default(0),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_products_client").using(
			"btree",
			table.clientId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "products_client_id_fkey",
		}).onDelete("cascade"),
		unique("products_client_id_product_id_key").on(
			table.clientId,
			table.productId,
		),
		unique("products_client_id_slug_key").on(table.clientId, table.slug),
	],
);

export const reviews = pgTable(
	"reviews",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		productId: uuid("product_id"),
		email: text(),
		author: text(),
		type: text().default("product"),
		title: text(),
		body: text(),
		rating: numeric({ precision: 2, scale: 1 }).default("0"),
		images: text().array(),
		verified: boolean().default(false),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_reviews_client").using(
			"btree",
			table.clientId.asc().nullsLast().op("uuid_ops"),
		),
		index("idx_reviews_email_client").using(
			"btree",
			table.email.asc().nullsLast().op("uuid_ops"),
			table.clientId.asc().nullsLast().op("text_ops"),
		),
		index("idx_reviews_product").using(
			"btree",
			table.productId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "reviews_client_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "reviews_product_id_fkey",
		}).onDelete("set null"),
		check(
			"reviews_type_check",
			sql`type = ANY (ARRAY['product'::text, 'website'::text])`,
		),
		check(
			"reviews_rating_check",
			sql`(rating >= (0)::numeric) AND (rating <= (5)::numeric)`,
		),
	],
);

export const questions = pgTable(
	"questions",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		productId: uuid("product_id"),
		email: text(),
		author: text(),
		body: text(),
		answer: text(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_questions_client").using(
			"btree",
			table.clientId.asc().nullsLast().op("uuid_ops"),
		),
		index("idx_questions_product").using(
			"btree",
			table.productId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "questions_client_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "questions_product_id_fkey",
		}).onDelete("set null"),
	],
);

export const coupons = pgTable(
	"coupons",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		customerId: uuid("customer_id").notNull(),
		code: text().notNull(),
		amount: integer().default(0),
		isActive: boolean("is_active").default(true),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_coupons_customer").using(
			"btree",
			table.customerId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "coupons_customer_id_fkey",
		}).onDelete("cascade"),
	],
);

export const auditLogs = pgTable(
	"audit_logs",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id"),
		customerId: uuid("customer_id"),
		action: text().notNull(),
		type: text(),
		config: jsonb(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_audit_client").using(
			"btree",
			table.clientId.asc().nullsLast().op("uuid_ops"),
		),
		index("idx_audit_created").using(
			"btree",
			table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
		),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "audit_logs_client_id_fkey",
		}).onDelete("set null"),
		foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "audit_logs_customer_id_fkey",
		}).onDelete("set null"),
	],
);

export const supportTickets = pgTable(
	"support_tickets",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		ticketNumber: serial("ticket_number").notNull(),
		subject: text().notNull(),
		category: text(),
		status: text().default("new"),
		priority: text().default("normal"),
		assignedTo: text("assigned_to"),
		messages: jsonb().default([]),
		resolutionNotes: text("resolution_notes"),
		resolvedAt: timestamp("resolved_at", {
			withTimezone: true,
			mode: "string",
		}),
		satisfactionRating: integer("satisfaction_rating"),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		index("idx_tickets_client").using(
			"btree",
			table.clientId.asc().nullsLast().op("uuid_ops"),
		),
		index("idx_tickets_status")
			.using("btree", table.status.asc().nullsLast().op("text_ops"))
			.where(sql`(status <> ALL (ARRAY['resolved'::text, 'closed'::text]))`),
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "support_tickets_client_id_fkey",
		}).onDelete("cascade"),
		unique("support_tickets_ticket_number_key").on(table.ticketNumber),
		check(
			"support_tickets_category_check",
			sql`category = ANY (ARRAY['billing'::text, 'technical'::text, 'feature_request'::text, 'bug_report'::text, 'general'::text])`,
		),
		check(
			"support_tickets_status_check",
			sql`status = ANY (ARRAY['new'::text, 'open'::text, 'pending_customer'::text, 'pending_support'::text, 'resolved'::text, 'closed'::text])`,
		),
		check(
			"support_tickets_priority_check",
			sql`priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])`,
		),
		check(
			"support_tickets_satisfaction_rating_check",
			sql`(satisfaction_rating >= 1) AND (satisfaction_rating <= 5)`,
		),
	],
);

export const widgetSettings = pgTable(
	"widget_settings",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		clientId: uuid("client_id").notNull(),
		isEnabled: boolean("is_enabled").default(true),
		activeWidgets: jsonb("active_widgets")
			.$type<{
				loyalty: boolean;
				reviews: boolean;
				productReviews: boolean;
			}>()
			.default({ loyalty: false, reviews: false, productReviews: false }),
		appearance: jsonb()
			.$type<{
				primaryColor: string;
				position: "left" | "right";
			}>()
			.default({ primaryColor: "#000000", position: "right" }),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "widget_settings_client_id_fkey",
		}).onDelete("cascade"),
		unique("widget_settings_client_id_key").on(table.clientId),
	],
);

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	clients: many(clients),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
	user: one(user, {
		fields: [clients.userId],
		references: [user.id],
	}),
	clientConfigs: many(clientConfig),
	customers: many(customers),
	activities: many(activity),
	referrals: many(referrals),
	orders: many(orders),
	products: many(products),
	reviews: many(reviews),
	questions: many(questions),
	auditLogs: many(auditLogs),
	supportTickets: many(supportTickets),
	widgetSettings: one(widgetSettings),
}));

export const clientConfigRelations = relations(clientConfig, ({ one }) => ({
	client: one(clients, {
		fields: [clientConfig.clientId],
		references: [clients.id],
	}),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
	client: one(clients, {
		fields: [customers.clientId],
		references: [clients.id],
	}),
	activities: many(activity),
	referrals: many(referrals),
	coupons: many(coupons),
	auditLogs: many(auditLogs),
}));

export const activityRelations = relations(activity, ({ one }) => ({
	client: one(clients, {
		fields: [activity.clientId],
		references: [clients.id],
	}),
	customer: one(customers, {
		fields: [activity.customerId],
		references: [customers.id],
	}),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
	client: one(clients, {
		fields: [referrals.clientId],
		references: [clients.id],
	}),
	customer: one(customers, {
		fields: [referrals.customerId],
		references: [customers.id],
	}),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
	client: one(clients, {
		fields: [orders.clientId],
		references: [clients.id],
	}),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
	client: one(clients, {
		fields: [products.clientId],
		references: [clients.id],
	}),
	reviews: many(reviews),
	questions: many(questions),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
	client: one(clients, {
		fields: [reviews.clientId],
		references: [clients.id],
	}),
	product: one(products, {
		fields: [reviews.productId],
		references: [products.id],
	}),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
	client: one(clients, {
		fields: [questions.clientId],
		references: [clients.id],
	}),
	product: one(products, {
		fields: [questions.productId],
		references: [products.id],
	}),
}));

export const couponsRelations = relations(coupons, ({ one }) => ({
	customer: one(customers, {
		fields: [coupons.customerId],
		references: [customers.id],
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
	client: one(clients, {
		fields: [auditLogs.clientId],
		references: [clients.id],
	}),
	customer: one(customers, {
		fields: [auditLogs.customerId],
		references: [customers.id],
	}),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
	client: one(clients, {
		fields: [supportTickets.clientId],
		references: [clients.id],
	}),
}));

export const widgetSettingsRelations = relations(widgetSettings, ({ one }) => ({
	client: one(clients, {
		fields: [widgetSettings.clientId],
		references: [clients.id],
	}),
}));

// Stub schema for legacy posts component (no Post table exists)
import { z } from "zod";
export const CreatePostSchema = z.object({
	title: z.string().min(1),
	content: z.string().min(1),
});
