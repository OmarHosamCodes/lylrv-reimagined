import { initAuth } from "@lylrv/auth";
import { reactStartCookies } from "better-auth/react-start";

import { env } from "~/env";
import { getBaseUrl, getProductionUrl } from "~/lib/url";

export const auth = initAuth({
	baseUrl: getBaseUrl(),
	productionUrl: getProductionUrl(),
	secret: env.AUTH_SECRET,

	extraPlugins: [reactStartCookies()],
});
