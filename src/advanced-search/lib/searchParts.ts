export function buildSearchParts(searchTerm: string) {
	const term = searchTerm.trim();
	if (!term) {
		return [];
	}

	const searchParts = term
		.split("*")
		.map((part) => part.trim())
		.filter((part) => part.length);

	return searchParts;

	// const filterConditions = searchKeys.map((key) => {
	// 	return searchParts.map((part) => `substringof('${part}',${String(key)})`).join(" and ");
	// });

	// return `(${filterConditions.join(" or ")})`;
}

export function filterBySearchParts<T extends Record<string, string>>(items: T[], searchParts: string[], searchKeys: (keyof T)[]) {
	const lowerSearchParts = searchParts.map((part) => part.toLowerCase());

	return items.filter((item) => {
		for (const key of searchKeys) {
			const value = String(item[key] || "").toLowerCase();

			let lastIndex = 0;
			let allPartsFound = true;

			// Ищем каждую часть строго после предыдущей
			for (const part of lowerSearchParts) {
				const index = value.indexOf(part, lastIndex);
				if (index === -1) {
					allPartsFound = false;
					break;
				}
				lastIndex = index + part.length; // следующая часть после найденной
			}

			if (allPartsFound) return true;
		}
		return false;
	});

	// С регуляркой медленнее в 2-3 раза

	// // Паттерн: первая часть, затем любое количество символов, затем вторая часть
	// const searchPattern = searchParts.join(".*?");
	// const regExp = new RegExp(searchPattern, "i");

	// return items.filter((item) => {
	// 	for (const key of searchKeys) {
	// 		if (regExp.test(item[key])) {
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// });
}
