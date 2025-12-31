import type { RemoteResource } from '@sveltejs/kit'
import { tick } from 'svelte'
import * as RR from './RemoteResource.svelte'

// ============================================================================
// PIPE FUNCTION
// ============================================================================

/**
 * Pipes a RemoteResource through a series of transformations.
 * Preserves individual resource reactivity at each step.
 */
export function pipe<_A>(a: _A): _A
export function pipe<_A, _B>(a: _A, ab: (a: _A) => _B): _B
export function pipe<_A, _B, _C>(a: _A, ab: (a: _A) => _B, bc: (b: _B) => _C): _C
export function pipe<_A, _B, _C, _D>(
	a: _A,
	ab: (a: _A) => _B,
	bc: (b: _B) => _C,
	cd: (c: _C) => _D
): _D
export function pipe<_A, _B, _C, _D, _E>(
	a: _A,
	ab: (a: _A) => _B,
	bc: (b: _B) => _C,
	cd: (c: _C) => _D,
	de: (d: _D) => _E
): _E
export function pipe<_A, _B, _C, _D, _E, _F>(
	a: _A,
	ab: (a: _A) => _B,
	bc: (b: _B) => _C,
	cd: (c: _C) => _D,
	de: (d: _D) => _E,
	ef: (e: _E) => _F
): _F
export function pipe<_A, _B, _C, _D, _E, _F, _G>(
	a: _A,
	ab: (a: _A) => _B,
	bc: (b: _B) => _C,
	cd: (c: _C) => _D,
	de: (d: _D) => _E,
	ef: (e: _E) => _F,
	fg: (f: _F) => _G
): _G
export function pipe<_A, _B, _C, _D, _E, _F, _G, _H>(
	a: _A,
	ab: (a: _A) => _B,
	bc: (b: _B) => _C,
	cd: (c: _C) => _D,
	de: (d: _D) => _E,
	ef: (e: _E) => _F,
	fg: (f: _F) => _G,
	gh: (g: _G) => _H
): _H
export function pipe<_A, _B, _C, _D, _E, _F, _G, _H, _I>(
	a: _A,
	ab: (a: _A) => _B,
	bc: (b: _B) => _C,
	cd: (c: _C) => _D,
	de: (d: _D) => _E,
	ef: (e: _E) => _F,
	fg: (f: _F) => _G,
	gh: (g: _G) => _H,
	hi: (h: _H) => _I
): _I
export function pipe(
	value: unknown,
	...fns: Array<(a: unknown) => unknown>
): unknown {
	return fns.reduce((acc, fn) => fn(acc), value)
}

// ============================================================================
// PIPEABLE OPERATORS (data-last curried versions)
// ============================================================================

/**
 * Pipeable version of then - transforms the value when ready.
 */
export const map = <_Value, _Result>(
	transform: (value: _Value) => _Result
) => (
	resource: RemoteResource<_Value>
): RemoteResource<_Result> =>
	RR.then(resource, transform)

/**
 * Pipeable version of catchError - provides fallback on error.
 */
export const catchError = <_Value>(
	onError: (error: unknown) => _Value
) => (
	resource: RemoteResource<_Value>
): RemoteResource<_Value> =>
	RR.catchError(resource, onError)

/**
 * Pipeable version of transform - handles both success and error.
 */
export const transform = <_Value, _Result>(
	handlers: { onSuccess: (value: _Value) => _Result; onError: (error: unknown) => _Result }
) => (
	resource: RemoteResource<_Value>
): RemoteResource<_Result> =>
	RR.transform(resource, handlers)

/**
 * Pipeable version of withDefault - provides default while loading.
 */
export const withDefault = <_Value>(
	defaultValue: _Value
) => (
	resource: RemoteResource<_Value>
): RemoteResource<_Value> =>
	RR.withDefault(resource, defaultValue)

/**
 * Pipeable version of chain - chains dependent resources.
 */
export const chain = <_Value, _Result>(
	getNextResource: (value: _Value) => RemoteResource<_Result>
) => (
	resource: RemoteResource<_Value>
): RemoteResource<_Result> =>
	RR.chain(resource, getNextResource)

/**
 * Pipeable version of flatMap for arrays - maps each to array and flattens.
 */
export const flatMapArray = <_Value, _Result>(
	transform: (value: _Value, index: number) => _Result[]
) => (
	resources: RemoteResource<_Value>[]
): RemoteResource<_Result[]> =>
	RR.flatMap(resources, transform)

// ============================================================================
// ARRAY PIPEABLE OPERATORS
// ============================================================================

/**
 * Pipeable version of map for arrays - transforms each resolved value.
 * Reactive to each individual resource.
 */
export const mapArray = <_Value, _Result>(
	transform: (value: _Value, index: number) => _Result
) => (
	resources: RemoteResource<_Value>[]
): RemoteResource<_Result[]> =>
	RR.map(resources, transform)

/**
 * Pipeable version of filter for arrays - filters by resolved values.
 * Reactive to each individual resource.
 */
export const filterArray = <_Value>(
	predicate: (value: _Value, index: number) => boolean
) => (
	resources: RemoteResource<_Value>[]
): RemoteResource<_Value[]> =>
	RR.filter(resources, predicate)

/**
 * Pipeable version of reduce for arrays - reduces to single value.
 * Reactive to each individual resource.
 */
export const reduceArray = <_Value, _Accumulator>(
	reducer: (accumulator: _Accumulator, value: _Value, index: number) => _Accumulator,
	initialValue: _Accumulator
) => (
	resources: RemoteResource<_Value>[]
): RemoteResource<_Accumulator> =>
	RR.reduce(resources, reducer, initialValue)

// ============================================================================
// COMBINATORS (work on arrays, return combined resource)
// ============================================================================

/**
 * Pipeable combinator - waits for all resources to succeed.
 * Reactive to each individual resource.
 */
export const all = <_Resources extends readonly RemoteResource<unknown>[]>(
	resources: _Resources
): RemoteResource<{ [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? _Value : never }> =>
	RR.all(resources)

/**
 * Pipeable combinator - waits for all resources to settle.
 * Reactive to each individual resource.
 */
export const allSettled = <_Resources extends readonly RemoteResource<unknown>[]>(
	resources: _Resources
): RemoteResource<{ [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? RR.SettledResult<_Value> : never }> =>
	RR.allSettled(resources)

/**
 * Pipeable combinator - returns first to settle.
 * Reactive to each individual resource.
 */
export const race = <_Value>(
	resources: RemoteResource<_Value>[]
): RemoteResource<_Value> =>
	RR.race(resources)

// ============================================================================
// EFFECT-TS BRIDGE
// ============================================================================

/**
 * Wraps an Effect into a RemoteResource while preserving reactivity.
 * The Effect is run immediately and the result tracked reactively.
 * 
 * @example
 * ```ts
 * import { Effect, pipe as effectPipe } from 'effect'
 * import { fromEffect } from '$lib/RemoteResourcePipeline.svelte'
 * 
 * const resource = fromEffect(
 *   effectPipe(
 *     Effect.succeed(42),
 *     Effect.map(n => n * 2)
 *   )
 * )
 * ```
 */
export const fromEffect = <_Value, _Error>(
	runEffect: () => Promise<_Value>
): RemoteResource<_Value> => {
	let loading = $state(true)
	let error = $state<unknown>(undefined)
	let current = $state<_Value | undefined>(undefined)
	let ready = $state(false)

	const promise = runEffect().then(
		(value) => {
			current = value
			ready = true
			loading = false
			return value
		},
		(err) => {
			error = err
			loading = false
			throw err
		}
	)

	const then = ((onFulfilled?: (v: _Value) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = promise.then(async () => { await tick(); return current as _Value })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Value>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return error },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Value>
}

/**
 * Converts a RemoteResource to an Effect-compatible Promise.
 * Useful for bridging back to Effect pipelines.
 */
export const toPromise = <_Value>(
	resource: RemoteResource<_Value>
): Promise<_Value> =>
	Promise.resolve(resource)

/**
 * Creates an array of RemoteResources from an array of Effect runners.
 * Each Effect runs independently, preserving individual reactivity.
 * 
 * @example
 * ```ts
 * const resources = fromEffects([
 *   () => Effect.runPromise(fetchUser(1)),
 *   () => Effect.runPromise(fetchUser(2)),
 *   () => Effect.runPromise(fetchUser(3))
 * ])
 * 
 * // Now use with array helpers - each one is individually reactive
 * const mapped = pipe(
 *   resources,
 *   mapArray(user => user.name)
 * )
 * ```
 */
export const fromEffects = <_Value>(
	runners: Array<() => Promise<_Value>>
): RemoteResource<_Value>[] =>
	runners.map(run => fromEffect(run))

/**
 * Combines multiple RemoteResources while preserving individual reactivity,
 * then applies an Effect-style transformation pipeline.
 * 
 * @example
 * ```ts
 * const result = combineWith(
 *   [userResource, profileResource, settingsResource],
 *   ([user, profile, settings]) => ({
 *     displayName: user.name,
 *     avatar: profile.avatar,
 *     theme: settings.theme
 *   })
 * )
 * ```
 */
export const combineWith = <_Resources extends readonly RemoteResource<unknown>[], _Result>(
	resources: _Resources,
	transform: (values: { [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? _Value : never }) => _Result
): RemoteResource<_Result> =>
	RR.then(RR.all(resources), transform)

/**
 * Creates a reactive tuple from multiple independent RemoteResources.
 * Each resource maintains its own loading/error state.
 * 
 * @example
 * ```ts
 * const [user, posts, comments] = tuple(
 *   getUser(userId),
 *   getPosts(userId),
 *   getComments(postId)
 * )
 * 
 * // Access individual states
 * if (user.ready) console.log(user.current.name)
 * if (posts.loading) console.log('Loading posts...')
 * if (comments.error) console.log('Failed to load comments')
 * ```
 */
export const tuple = <_Resources extends RemoteResource<unknown>[]>(
	...resources: _Resources
): _Resources =>
	resources

// ============================================================================
// ADVANCED COMPOSITION
// ============================================================================

/**
 * Applies a transformation only if the resource is ready, otherwise passes through.
 * Useful for conditional pipelines.
 */
export const when = <_Value>(
	predicate: (value: _Value) => boolean,
	transform: (value: _Value) => _Value
) => (
	resource: RemoteResource<_Value>
): RemoteResource<_Value> =>
	RR.then(resource, v => predicate(v) ? transform(v) : v)

/**
 * Taps into a resource without transforming it.
 * Useful for side effects like logging.
 */
export const tap = <_Value>(
	effect: (value: _Value) => void
) => (
	resource: RemoteResource<_Value>
): RemoteResource<_Value> =>
	RR.then(resource, v => { effect(v); return v })

/**
 * Applies a fallback resource if the primary errors.
 */
export const orElse = <_Value>(
	fallback: () => RemoteResource<_Value>
) => (
	resource: RemoteResource<_Value>
): RemoteResource<_Value> => {
	const current = $derived(
		resource.error ? fallback().current : resource.current
	)
	const ready = $derived(
		resource.error ? fallback().ready : resource.ready
	)
	const loading = $derived(
		resource.error ? fallback().loading : resource.loading
	)
	const error = $derived(
		resource.error ? fallback().error : undefined
	)

	const then = ((onFulfilled?: (v: _Value) => unknown, onRejected?: (e: unknown) => unknown) => {
		// Wait for primary, on error wait for fallback
		const result = Promise.resolve(resource).catch(() => Promise.resolve(fallback())).then(async () => { await tick(); return current as _Value })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Value>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return error },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Value>
}

/**
 * Retries a resource creation on failure.
 * Uses promise chaining to handle retries correctly.
 */
export const retry = <_Value>(
	createResource: () => RemoteResource<_Value>,
	maxAttempts: number
): RemoteResource<_Value> => {
	let loading = $state(true)
	let error = $state<unknown>(undefined)
	let current = $state<_Value | undefined>(undefined)
	let ready = $state(false)

	const attemptWithRetry = async (attempt: number): Promise<_Value> => {
		try {
			return await Promise.resolve(createResource())
		} catch (e) {
			if (attempt < maxAttempts) {
				return attemptWithRetry(attempt + 1)
			}
			throw e
		}
	}

	const promise = attemptWithRetry(1).then(
		(value) => {
			current = value
			ready = true
			loading = false
			return value
		},
		(err) => {
			error = err
			loading = false
			throw err
		}
	)

	const then = ((onFulfilled?: (v: _Value) => unknown, onRejected?: (e: unknown) => unknown) => {
		const result = promise.then(async () => { await tick(); return current as _Value })
		return onFulfilled || onRejected ? result.then(onFulfilled, onRejected) : result
	}) as Promise<_Value>['then']

	return {
		get current() { return current },
		get loading() { return loading },
		get error() { return error },
		get ready() { return ready },
		get then() { return then },
		get catch() { return (r: ((e: unknown) => unknown) | null | undefined) => then(undefined, r ?? undefined) },
		get finally() { return (f: (() => void) | null | undefined) => then(v => { f?.(); return v }, e => { f?.(); throw e }) }
	} as unknown as RemoteResource<_Value>
}

