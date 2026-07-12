import { useEffect } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ImageViewer } from "./ImageViewer";

const runtimeMock = vi.hoisted(() => ({ moduleLoads: 0, mounts: 0, unmounts: 0 }));

vi.mock("./ImageViewerRuntime", () => {
	runtimeMock.moduleLoads += 1;

	function ImageViewerRuntimeMock({ open, onRuntimeMounted }: { open: boolean; onRuntimeMounted: () => void }) {
		useEffect(() => {
			runtimeMock.mounts += 1;
			onRuntimeMounted();

			return () => {
				runtimeMock.unmounts += 1;
			};
		}, [onRuntimeMounted]);

		return open ? <div role="dialog">Lazy runtime mock</div> : null;
	}

	return {
		default: ImageViewerRuntimeMock
	};
});

afterEach(() => {
	runtimeMock.moduleLoads = 0;
	runtimeMock.mounts = 0;
	runtimeMock.unmounts = 0;
});

describe("ImageViewer lazy runtime", () => {
	it("не загружает runtime в закрытом состоянии и сохраняет его mounted после первого открытия", async () => {
		const { rerender, unmount } = render(<ImageViewer open={false} images={[]} onClose={() => undefined} />);

		await Promise.resolve();
		expect(runtimeMock.moduleLoads).toBe(0);
		expect(runtimeMock.mounts).toBe(0);

		rerender(<ImageViewer open images={[]} onClose={() => undefined} />);

		await screen.findByRole("dialog");
		await waitFor(() => expect(runtimeMock.mounts).toBe(1));
		expect(runtimeMock.moduleLoads).toBe(1);

		rerender(<ImageViewer open={false} images={[]} onClose={() => undefined} />);

		expect(screen.queryByRole("dialog")).toBeNull();
		expect(runtimeMock.mounts).toBe(1);
		expect(runtimeMock.unmounts).toBe(0);

		rerender(<ImageViewer open images={[]} onClose={() => undefined} />);

		await screen.findByRole("dialog");
		expect(runtimeMock.moduleLoads).toBe(1);
		expect(runtimeMock.mounts).toBe(1);

		unmount();
		expect(runtimeMock.unmounts).toBe(1);
	});
});
