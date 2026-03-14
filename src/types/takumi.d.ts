import type { ReactNode } from "react";

declare module "@takumi-rs/image-response" {
	interface ImageResponseOptions {
		width: number;
		height: number;
		format?: "png" | "jpeg" | "webp";
		quality?: number;
		headers?: Record<string, string>;
	}

	class ImageResponse {
		constructor(component: ReactNode, options: ImageResponseOptions);
	}
}

export { ImageResponse };