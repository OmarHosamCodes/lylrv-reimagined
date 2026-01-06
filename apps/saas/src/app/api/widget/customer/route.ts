import { and, eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import {
    activity,
    clients,
    coupons,
    customers,
    referrals,
} from "@lylrv/db/schema";
import type { NextRequest } from "next/server";

/**
 * Public REST endpoint for customer loyalty data
 * Called by widget from external client sites
 */

const setCorsHeaders = (res: Response) => {
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.headers.set("Access-Control-Allow-Headers", "*");
    res.headers.set("Cache-Control", "private, max-age=0, no-cache");
};

export const OPTIONS = () => {
    const response = new Response(null, { status: 204 });
    setCorsHeaders(response);
    return response;
};

export const GET = async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    const email = searchParams.get("email");

    if (!shop) {
        const response = Response.json(
            { error: "Missing 'shop' query parameter" },
            { status: 400 },
        );
        setCorsHeaders(response);
        return response;
    }

    if (!email) {
        const response = Response.json(
            { error: "Missing 'email' query parameter" },
            { status: 400 },
        );
        setCorsHeaders(response);
        return response;
    }

    try {
        // Find client by createSource (shop identifier)
        const client = await db.query.clients.findFirst({
            where: eq(clients.createSource, shop),
        });

        if (!client) {
            const response = Response.json(
                { error: "Shop not found" },
                { status: 404 },
            );
            setCorsHeaders(response);
            return response;
        }

        // Find customer by email and client
        const customer = await db.query.customers.findFirst({
            where: and(eq(customers.clientId, client.id), eq(customers.email, email)),
        });

        if (!customer) {
            const response = Response.json({
                exists: false,
                customer: null,
            });
            setCorsHeaders(response);
            return response;
        }

        // Get customer's referral code
        const referral = await db.query.referrals.findFirst({
            where: and(
                eq(referrals.customerId, customer.id),
                eq(referrals.isActive, true),
            ),
        });

        // Get customer's recent activity
        const recentActivity = await db.query.activity.findMany({
            where: eq(activity.customerId, customer.id),
            orderBy: (a, { desc }) => [desc(a.createdAt)],
            limit: 10,
        });

        // Get customer's active coupons
        const activeCoupons = await db.query.coupons.findMany({
            where: and(
                eq(coupons.customerId, customer.id),
                eq(coupons.isActive, true),
            ),
        });

        const response = Response.json({
            exists: true,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                totalPoints: customer.totalPoints || 0,
                referralCode: referral?.code || null,
                recentActivity: recentActivity.map((a) => ({
                    id: a.id,
                    amount: a.amount,
                    reason: a.reason,
                    createdAt: a.createdAt,
                })),
                activeCoupons: activeCoupons.map((c) => ({
                    id: c.id,
                    code: c.code,
                    amount: c.amount,
                })),
            },
        });
        setCorsHeaders(response);
        return response;
    } catch (error) {
        console.error("Widget customer error:", error);
        const response = Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
        setCorsHeaders(response);
        return response;
    }
};
