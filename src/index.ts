import type { Env } from "./types";
import { MyDurableObject } from "./MyDurableObject";
export { MyDurableObject };

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);
		const pathParts = url.pathname.split("/").filter(Boolean);

		if (pathParts[0] === "room" && pathParts[1]) {
			const roomId = pathParts[1];
			const stub = env.GAME_SESSION.getByName(roomId);
			return stub.fetch(request);
		}

		if (url.pathname === "/create-room") {
			const id = env.GAME_SESSION.newUniqueId();
			return new Response(id.toString(), { status: 200 });
		}

		return new Response("Not Found: " + url.pathname, { status: 404 });
	},
} satisfies ExportedHandler<Env>;
