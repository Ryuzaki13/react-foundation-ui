import React from "react";

import { SkeletonLine } from "./SkeletonLine";

interface LazyValueProps {
	value: React.ReactNode;
	isLoading?: boolean;
}

export function LazyValue({ value, isLoading }: LazyValueProps) {
	return isLoading ? <SkeletonLine>Загрузка...</SkeletonLine> : (value ?? "-");
}
