import type { RemoteResource } from '@sveltejs/kit'
import { tick } from 'svelte'


// ============================================================================
// PROMISE-LIKE HELPERS
// ============================================================================

/**
 * Transforms the value of a RemoteResource when it becomes ready.
 * Named `derive` instead of `then` to avoid module thenable detection issues during SSR.
 */
export const derive = <_Value, _Result>(
	resource: RemoteResource<_Value>,
	transform: (value: _Value) => Awaited<_Result>
): RemoteResource<_Result> => {
	const current = $derived(
		resource.ready ? transform(resource.current) : undefined
	)

	const promise = $derived(
		resource
			.then(tick)
			.then(() => current as Awaited<_Result>)
	)

	// @ts-expect-error current
	return {
		get current() {
			return current
		},

		get loading() {
			return resource.loading
		},

		get error() {
			return resource.error
		},

		get ready() {
			return resource.ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

export const _then = <_Value, _Result>(
	resource: RemoteResource<_Value>,
	transform: (value: Awaited<_Value>) => Awaited<_Result>
): RemoteResource<_Result> => {
	const currentAndReady = $derived(
		resource.ready ? { current: transform(resource.current), ready: true } as const : { current: undefined, ready: false } as const
	)

	const promise = $derived(
		resource
			.then(tick)
			.then(() => currentAndReady.current as Awaited<_Result>)
	)

	// @ts-expect-error
	return {
		get current() {
			return currentAndReady.current
		},

		get loading() {
			return resource.loading
		},

		get error() {
			return resource.error
		},

		get ready() {
			return currentAndReady.ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
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

	const promise = $derived(
		resource
			.then(() => {}, () => {})
			.then(tick)
			.then(() => current as Awaited<_Value>)
	)

	return {
		// @ts-expect-error current
		get current() {
			return current
		},

		get loading() {
			return resource.loading
		},

		get error() {
			return undefined
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

/**
 * Returns the first RemoteResource to settle (success or error).
 */
export const race = <_Value>(resources: RemoteResource<_Value>[]): RemoteResource<_Value> => {
	const winner = $derived(
		resources.find(resource => resource.ready || resource.error)
	)

	const current = $derived(
		winner?.current
	)

	const error = $derived(
		winner?.error
	)

	const ready = $derived(
		winner?.ready ?? false
	)

	const loading = $derived(
		!winner && resources.some(resource => resource.loading)
	)

	const promise = $derived(
		Promise.race(resources)
			.then(tick)
			.then(() => current as Awaited<_Value>)
	)

	// @ts-expect-error current
	return {
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return error
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

/**
 * Combines multiple RemoteResources, resolving when all succeed.
 */
export const all = <_Resources extends readonly RemoteResource<unknown>[]>(
	resources: _Resources
): RemoteResource<{ [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? _Value : never }> => {
	type _Result = Awaited<{ [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? _Value : never }>

	const ready = $derived(
		resources.every(resource => resource.ready)
	)

	const current = $derived(
		ready ? resources.map(resource => resource.current) as unknown as _Result : undefined
	)

	const loading = $derived(
		resources.some(resource => resource.loading)
	)

	const errors = $derived(
		resources.map(resource => resource.error).filter(Boolean)
	)

	const error = $derived(
		errors.length > 0 ? errors : undefined
	)

	const promise = $derived(
		Promise.all(resources)
			.then(tick)
			.then(() => current as _Result)
	)

	// @ts-expect-error
	return {
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return error
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
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
): RemoteResource<{ [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? SettledResult<Awaited<_Value>> : never }> => {
	type _Result = Awaited<{ [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? SettledResult<Awaited<_Value>> : never }>

	const ready = $derived(
		resources.every(resource => resource.ready || resource.error)
	)

	const current = $derived(
		ready
			? resources.map(resource => resource.error
				? { ready: false as const, current: undefined, error: resource.error }
				: { ready: true as const, current: resource.current, error: undefined }
			) as unknown as _Result
			: undefined
	)

	const loading = $derived(
		resources.some(resource => resource.loading)
	)

	const promise = $derived(
		Promise.allSettled(resources)
			.then(tick)
			.then(() => current as _Result)
	)

	// @ts-expect-error
	return {
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return undefined
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

// ============================================================================
// ARRAY HELPERS
// ============================================================================

/**
 * Maps over an array of RemoteResources, transforming each resolved value.
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
		resources.every(resource => resource.ready)
	)

	const loading = $derived(
		resources.some(resource => resource.loading)
	)

	const errors = $derived(
		resources.map(resource => resource.error).filter(Boolean)
	)

	const error = $derived(
		errors.length > 0 ? errors : undefined
	)

	const promise = $derived(
		Promise.all(resources)
			.then(tick)
			.then(() => current)
	)

	// @ts-expect-error current
	return {
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return error
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

/**
 * Filters an array of RemoteResources based on their resolved values.
 */
export const filter = <_Value>(
	resources: RemoteResource<_Value>[],
	predicate: (value: _Value, index: number) => boolean
): RemoteResource<_Value[]> => {
	const current = $derived.by(() => {
		const results: _Value[] = []
		for (let i = 0; i < resources.length; i++) {
			const resource = resources[i]
			if (resource.ready && predicate(resource.current, i)) results.push(resource.current)
		}
		return results
	})

	const ready = $derived(
		resources.every(resource => resource.ready)
	)

	const loading = $derived(
		resources.some(resource => resource.loading)
	)

	const errors = $derived(
		resources.map(resource => resource.error).filter(Boolean)
	)

	const error = $derived(
		errors.length > 0 ? errors : undefined
	)

	const promise = $derived(
		Promise.all(resources)
			.then(tick)
			.then(() => current)
	)

	// @ts-expect-error current
	return {
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return error
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

/**
 * Reduces an array of RemoteResources to a single value.
 */
export const reduce = <_Value, _Accumulator>(
	resources: RemoteResource<_Value>[],
	reducer: (accumulator: _Accumulator, value: _Value, index: number) => _Accumulator,
	initialValue: _Accumulator
): RemoteResource<_Accumulator> => {
	const current = $derived.by(() => {
		let accumulator = initialValue
		for (let i = 0; i < resources.length; i++) {
			if (resources[i].ready) accumulator = reducer(accumulator, resources[i].current as _Value, i)
		}
		return accumulator
	})

	const ready = $derived(
		resources.every(resource => resource.ready)
	)

	const loading = $derived(
		resources.some(resource => resource.loading)
	)

	const errors = $derived(
		resources.map(resource => resource.error).filter(Boolean)
	)

	const error = $derived(
		errors.length > 0 ? errors : undefined
	)

	const promise = $derived(
		Promise.all(resources)
			.then(tick)
			.then(() => current as Awaited<_Accumulator>)
	)

	return {
		// @ts-expect-error current
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return error
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

/**
 * Maps each resolved value to an array and flattens the results.
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
		resources.every(resource => resource.ready)
	)

	const loading = $derived(
		resources.some(resource => resource.loading)
	)

	const errors = $derived(
		resources.map(resource => resource.error).filter(Boolean)
	)

	const error = $derived(
		errors.length > 0 ? errors : undefined
	)

	const promise = $derived(
		Promise.all(resources)
			.then(tick)
			.then(() => current)
	)

	// @ts-expect-error current
	return {
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return error
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
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

	const promise = $derived(
		resource
			.then(() => {}, () => {})
			.then(tick)
			.then(() => current as Awaited<_Result>)
	)

	return {
		// @ts-expect-error current
		get current() {
			return current
		},

		get loading() {
			return resource.loading
		},

		get error() {
			return undefined
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

/**
 * Provides a default value while the resource is loading.
 */
export const withDefault = <_Value>(
	resource: RemoteResource<_Value>,
	defaultValue: _Value
): RemoteResource<_Value> => {
	const current = $derived(
		resource.ready ? resource.current : defaultValue
	)

	const promise = $derived(
		tick()
			.then(() => current as Awaited<_Value>)
	)

	return {
		// @ts-expect-error current
		get current() {
			return current
		},

		get loading() {
			return resource.loading
		},

		get error() {
			return resource.error
		},

		get ready() {
			return true
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

/**
 * Chains RemoteResource transformations where each step depends on the previous.
 */
export const chain = <_Value, _Result>(
	resource: RemoteResource<_Value>,
	getNextResource: (value: _Value) => RemoteResource<_Result>
): RemoteResource<_Result> => {
	const nextResource = $derived(
		resource.ready ? getNextResource(resource.current) : undefined
	)

	const current = $derived(
		nextResource?.current
	)

	const ready = $derived(
		nextResource?.ready ?? false
	)

	const loading = $derived(
		resource.loading || (nextResource?.loading ?? false)
	)

	const error = $derived(
		resource.error ?? nextResource?.error
	)

	const promise = $derived(
		resource
			.then(value => getNextResource(value))
			.then(tick)
			.then(() => current as Awaited<_Result>)
	)

	// @ts-expect-error current
	return {
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return error
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}


// ============================================================================
// TIMING HELPERS
// ============================================================================

/**
 * Fails with a timeout error if the resource doesn't settle within the specified time.
 */
export const timeout = <_Value>(
	resource: RemoteResource<_Value>,
	ms: number,
	message = `Timed out after ${ms}ms`
): RemoteResource<_Value> => {
	const timedOut = $state.raw({ value: false })

	const timeoutPromise = new Promise<never>((_, reject) => {
		const id = setTimeout(() => {
			timedOut.value = true
			reject(new Error(message))
		}, ms)

		resource.finally(
			() => clearTimeout(id)
		)
	})

	const current = $derived(
		resource.current
	)

	const error = $derived(
		timedOut.value ? new Error(message) : resource.error
	)

	const ready = $derived(
		resource.ready && !timedOut.value
	)

	const loading = $derived(
		resource.loading && !timedOut.value
	)

	const promise = $derived(
		Promise.race([resource, timeoutPromise])
			.then(tick)
			.then(() => current as Awaited<_Value>)
	)

	// @ts-expect-error current
	return {
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return error
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

/**
 * Adds a minimum delay before the resource is considered ready.
 * Prevents flash of loading state for fast queries.
 */
export const delay = <_Value>(
	resource: RemoteResource<_Value>,
	ms: number
): RemoteResource<_Value> => {
	const delayComplete = $state.raw({ value: false })

	setTimeout(() => {
		delayComplete.value = true
	}, ms)

	const current = $derived(
		resource.current
	)

	const ready = $derived(
		resource.ready && delayComplete.value
	)

	const loading = $derived(
		resource.loading || (resource.ready && !delayComplete.value)
	)

	const delayPromise = new Promise<void>(resolve => setTimeout(resolve, ms))

	const promise = $derived(
		Promise.all([resource, delayPromise])
			.then(tick)
			.then(() => current as Awaited<_Value>)
	)

	// @ts-expect-error current
	return {
		get current() {
			return current
		},

		get loading() {
			return loading
		},

		get error() {
			return resource.error
		},

		get ready() {
			return ready
		},

		get then() {
			return promise.then.bind(promise)
		},

		get catch() {
			return promise.catch.bind(promise)
		},

		get finally() {
			return promise.finally.bind(promise)
		},

		[Symbol.toStringTag]: 'RemoteResource',
	}
}

// ============================================================================
// PROXY HELPERS
// ============================================================================

const remoteResourceProperties = new Set([
	'current',
	'loading',
	'ready',
	'error',
	'then',
	'catch',
	'finally',
	Symbol.toStringTag,
	Symbol.toPrimitive,
])

/**
 * A proxied RemoteResource that allows accessing properties on the resource's value.
 * When accessing a property that isn't a RemoteResource property, it returns a proxied RemoteResource
 * for that property's value.
 */
export type ProxiedRemoteResource<_Value> = (
	RemoteResource<_Value>
	& (
		_Value extends object ?
			{
				[K in keyof _Value as K extends keyof RemoteResource<_Value> ? never : K]: (
					ProxiedRemoteResource<_Value[K]>
				)
			}
		:
			{}
	)
)

/**
 * Creates a proxy for a RemoteResource that allows accessing properties on the resource's value.
 * When accessing a property that isn't a RemoteResource property, it returns a proxied RemoteResource
 * for that property's value.
 */
export const proxy = <_Value>(
	resource: RemoteResource<_Value>
): ProxiedRemoteResource<_Value> => (
	Proxy.revocable(
		resource,
		{
			get(target, property, receiver) {
				if (remoteResourceProperties.has(property as string | symbol)){
					const value = Reflect.get(target, property, receiver)

					return (
						typeof value === 'function' ?
							value.bind(target)
						:
							value
					)
				}

				return proxy(
					derive(
						target,
						(value: _Value) => (
							value[property as keyof _Value] as Awaited<_Value[keyof _Value]>
						)
					)
				)
			}
		}
	)
		.proxy
)
