import type { RemoteResource } from '@sveltejs/kit'
import { tick } from 'svelte'


// ============================================================================
// PROMISE-LIKE HELPERS
// ============================================================================

/**
 * Transforms the value of a RemoteResource when it becomes ready.
 */
export const then = <_Value, _Result>(
	resource: RemoteResource<_Value>,
	transform: (value: _Value) => _Result
): RemoteResource<_Result> => {
	const current = $derived(
		resource.ready ? transform(resource.current) : undefined
	)

	const then = ((onFulfilled?: (v: _Result) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = Promise.resolve(resource).then(async () => { await tick(); return current as _Result })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Result>['then']

	return {
		get current() { return current },
		get loading() { return resource.loading },
		get error() { return resource.error },
		get ready() { return resource.ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Result>
}

/**
 * Provides a fallback value if the RemoteResource errors.
 */
export const catchError = <_Value>(
	resource: RemoteResource<_Value>,
	onError: (error: unknown) => _Value
): RemoteResource<_Value> => {
	const current = $derived(
		resource.error ? onError(resource.error) : resource.current
	)
	const ready = $derived(
		resource.ready || !!resource.error
	)

	const then = ((onFulfilled?: (v: _Value) => unknown, onRejected?: (e: unknown) => unknown) => {
		// Settle on success or error, then return current
		const result = Promise.resolve(resource).then(() => {}, () => {}).then(async () => { await tick(); return current as _Value })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Value>['then']

	return {
		get current() { return current },
		get loading() { return resource.loading },
		get error() { return undefined },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Value>
}

/**
 * Returns the first RemoteResource to settle.
 */
export const race = <_Value>(resources: RemoteResource<_Value>[]): RemoteResource<_Value> => {
	const winner = $derived.by(() => {
		for (const r of resources) {
			if (r.ready) return { current: r.current, error: undefined, ready: true as const }
			if (r.error) return { current: undefined as _Value | undefined, error: r.error, ready: false as const }
		}
		return { current: undefined as _Value | undefined, error: undefined, ready: false as const }
	})
	const loading = $derived(
		!winner.ready && !winner.error && resources.some(r => r.loading)
	)

	const then = ((onFulfilled?: (v: _Value) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = Promise.race(resources.map(r => Promise.resolve(r))).then(async () => { await tick(); return winner.current as _Value })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Value>['then']

	return {
		get current() { return winner.current },
		get loading() { return loading },
		get error() { return winner.error },
		get ready() { return winner.ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Value>
}

/**
 * Combines multiple RemoteResources, resolving when all succeed.
 */
export const all = <_Resources extends readonly RemoteResource<unknown>[]>(
	resources: _Resources
): RemoteResource<{ [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? _Value : never }> => {
	type _Result = { [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? _Value : never }

	const ready = $derived(
		resources.every(r => r.ready)
	)
	const current = $derived(
		ready ? resources.map(r => r.current) as _Result : undefined
	)
	const loading = $derived(
		resources.some(r => r.loading)
	)
	const error = $derived(
		resources.find(r => r.error)?.error
	)

	const then = ((onFulfilled?: (v: _Result) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = Promise.all(resources.map(r => Promise.resolve(r))).then(async () => { await tick(); return current as _Result })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Result>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return error },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Result>
}

/**
 * Result type for allSettled - mirrors RemoteResource terminology.
 */
export type SettledResult<_Value> =
	| { ready: true; current: _Value; error: undefined }
	| { ready: false; current: undefined; error: unknown }

/**
 * Combines multiple RemoteResources, resolving when all settle.
 */
export const allSettled = <_Resources extends readonly RemoteResource<unknown>[]>(
	resources: _Resources
): RemoteResource<{ [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? SettledResult<_Value> : never }> => {
	type _Result = { [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? SettledResult<_Value> : never }

	const ready = $derived(
		resources.every(r => r.ready || r.error)
	)
	const current = $derived(
		ready
			? resources.map(r => r.error
				? { ready: false as const, current: undefined, error: r.error }
				: { ready: true as const, current: r.current, error: undefined }
			) as _Result
			: undefined
	)
	const loading = $derived(
		resources.some(r => r.loading)
	)

	const then = ((onFulfilled?: (v: _Result) => unknown, onRejected?: (e: unknown) => unknown) => {
		// Wait for all to settle (success or error)
		const result = Promise.allSettled(resources.map(r => Promise.resolve(r))).then(async () => { await tick(); return current as _Result })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Result>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return undefined },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Result>
}

// ============================================================================
// ARRAY HELPERS
// ============================================================================

/**
 * Maps over an array of RemoteResources, transforming each resolved value.
 * Updates reactively as each resource resolves.
 */
export const map = <_Value, _Result>(
	resources: RemoteResource<_Value>[],
	transform: (value: _Value, index: number) => _Result
): RemoteResource<_Result[]> => {
	const current = $derived.by(() => {
		const results: _Result[] = []
		for (let i = 0; i < resources.length; i++) {
			if (resources[i].ready) results.push(transform(resources[i].current as _Value, i))
		}
		return results
	})
	const ready = $derived(
		resources.every(r => r.ready)
	)
	const loading = $derived(
		resources.some(r => r.loading)
	)
	const error = $derived(
		resources.find(r => r.error)?.error
	)

	const then = ((onFulfilled?: (v: _Result[]) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = Promise.all(resources.map(r => Promise.resolve(r))).then(async () => { await tick(); return current })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Result[]>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return error },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Result[]>
}

/**
 * Filters an array of RemoteResources based on their resolved values.
 * Updates reactively as each resource resolves.
 */
export const filter = <_Value>(
	resources: RemoteResource<_Value>[],
	predicate: (value: _Value, index: number) => boolean
): RemoteResource<_Value[]> => {
	const current = $derived.by(() => {
		const results: _Value[] = []
		for (let i = 0; i < resources.length; i++) {
			const r = resources[i]
			if (r.ready && predicate(r.current, i)) results.push(r.current)
		}
		return results
	})
	const ready = $derived(
		resources.every(r => r.ready)
	)
	const loading = $derived(
		resources.some(r => r.loading)
	)
	const error = $derived(
		resources.find(r => r.error)?.error
	)

	const then = ((onFulfilled?: (v: _Value[]) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = Promise.all(resources.map(r => Promise.resolve(r))).then(async () => { await tick(); return current })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Value[]>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return error },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Value[]>
}

/**
 * Reduces an array of RemoteResources to a single value.
 * Updates reactively as each resource resolves.
 */
export const reduce = <_Value, _Accumulator>(
	resources: RemoteResource<_Value>[],
	reducer: (accumulator: _Accumulator, value: _Value, index: number) => _Accumulator,
	initialValue: _Accumulator
): RemoteResource<_Accumulator> => {
	const current = $derived.by(() => {
		let acc = initialValue
		for (let i = 0; i < resources.length; i++) {
			if (resources[i].ready) acc = reducer(acc, resources[i].current as _Value, i)
		}
		return acc
	})
	const ready = $derived(
		resources.every(r => r.ready)
	)
	const loading = $derived(
		resources.some(r => r.loading)
	)
	const error = $derived(
		resources.find(r => r.error)?.error
	)

	const then = ((onFulfilled?: (v: _Accumulator) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = Promise.all(resources.map(r => Promise.resolve(r))).then(async () => { await tick(); return current })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Accumulator>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return error },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Accumulator>
}

/**
 * Maps each resolved value to an array and flattens the results.
 * Like Array#flatMap but for RemoteResources.
 */
export const flatMap = <_Value, _Result>(
	resources: RemoteResource<_Value>[],
	transform: (value: _Value, index: number) => _Result[]
): RemoteResource<_Result[]> => {
	const current = $derived.by(() => {
		const results: _Result[] = []
		for (let i = 0; i < resources.length; i++) {
			if (resources[i].ready) results.push(...transform(resources[i].current as _Value, i))
		}
		return results
	})
	const ready = $derived(
		resources.every(r => r.ready)
	)
	const loading = $derived(
		resources.some(r => r.loading)
	)
	const error = $derived(
		resources.find(r => r.error)?.error
	)

	const then = ((onFulfilled?: (v: _Result[]) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = Promise.all(resources.map(r => Promise.resolve(r))).then(async () => { await tick(); return current })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Result[]>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return error },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Result[]>
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Combines then and catchError in one call.
 */
export const transform = <_Value, _Result>(
	resource: RemoteResource<_Value>,
	handlers: { onSuccess: (value: _Value) => _Result; onError: (error: unknown) => _Result }
): RemoteResource<_Result> => {
	const current = $derived(
		resource.error
			? handlers.onError(resource.error)
			: resource.ready
				? handlers.onSuccess(resource.current)
				: undefined
	)
	const ready = $derived(
		resource.ready || !!resource.error
	)

	const then = ((onFulfilled?: (v: _Result) => unknown, onRejected?: (e: unknown) => unknown) => {
		// Settle on success or error, then return current
		const result = Promise.resolve(resource).then(() => {}, () => {}).then(async () => { await tick(); return current as _Result })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Result>['then']

	return {
		get current() { return current },
		get loading() { return resource.loading },
		get error() { return undefined },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Result>
}

/**
 * Provides a default value while the resource is loading or on error.
 */
export const withDefault = <_Value>(
	resource: RemoteResource<_Value>,
	defaultValue: _Value
): RemoteResource<_Value> => {
	const current = $derived(
		resource.ready ? resource.current : defaultValue
	)

	// ready is always true, so resolve immediately
	const then = ((onFulfilled?: (v: _Value) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = (async () => { await tick(); return current as _Value })()
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Value>['then']

	return {
		get current() { return current },
		get loading() { return resource.loading },
		get error() { return resource.error },
		get ready() { return true },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Value>
}

/**
 * Chains RemoteResource transformations where each step depends on the previous.
 * Also known as bind/flatMap in monadic terms.
 */
export const chain = <_Value, _Result>(
	resource: RemoteResource<_Value>,
	getNextResource: (value: _Value) => RemoteResource<_Result>
): RemoteResource<_Result> => {
	let cachedValue: _Value | undefined
	let cachedNext: RemoteResource<_Result> | undefined
	const getNext = (): RemoteResource<_Result> | undefined => {
		if (!resource.ready) return undefined
		if (resource.current !== cachedValue) {
			cachedValue = resource.current
			cachedNext = getNextResource(resource.current)
		}
		return cachedNext
	}

	const current = $derived(
		getNext()?.current
	)
	const ready = $derived(
		getNext()?.ready ?? false
	)
	const loading = $derived(
		resource.loading || (getNext()?.loading ?? false)
	)
	const error = $derived(
		resource.error ?? getNext()?.error
	)

	const then = ((onFulfilled?: (v: _Result) => unknown, onRejected?: (e: unknown) => unknown) => {
		// Wait for first resource, then wait for chained resource
		const result = Promise.resolve(resource).then(v => Promise.resolve(getNextResource(v))).then(async () => { await tick(); return current as _Result })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Result>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return error },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Result>
}
