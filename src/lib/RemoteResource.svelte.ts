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
	transform: (value: _Value) => Awaited<_Result>
): RemoteResource<_Result> => {
	const current = $derived(
		resource.ready ? transform(resource.current) : undefined
	)

	const then = $derived.by(() => {
		const promise = resource.then()

		return ((resolve?: (v: _Result) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()
				return current as Awaited<_Result>
			})

			return resolve || reject ? result.then(resolve, reject) : result
		}) as Promise<Awaited<_Result>>['then']
	})

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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Result>
}

export const _then = <_Value, _Result>(
	resource: RemoteResource<_Value>,
	transform: (value: Awaited<_Value>) => Awaited<_Result>
): RemoteResource<_Result> => {
	const currentAndReady = $derived(
		resource.ready ? { current: transform(resource.current), ready: true } as const : { current: undefined, ready: false } as const
	)

	// const then = $derived.by(() => {
	// 	const promise = resource.then()

	// 	const getResult = async () => {
	// 		await promise
	// 		await tick()
	// 		return currentAndReady.current as Awaited<_Result>
	// 	}

	// 	function thenFn<TResult1 = Awaited<_Result>, TResult2 = never>(
	// 		onfulfilled?: ((value: Awaited<_Result>) => TResult1 | PromiseLike<TResult1>) | null,
	// 		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
	// 	): Promise<TResult1 | TResult2>
	// 	function thenFn(
	// 		onfulfilled?: ((value: Awaited<_Result>) => unknown) | null,
	// 		onrejected?: ((reason: any) => unknown) | null
	// 	) {
	// 		const result = getResult()
	// 		return onfulfilled || onrejected
	// 			? result.then(onfulfilled, onrejected)
	// 			: result
	// 	}

	// 	return thenFn

	// 	return getResult().then
	// }

	const then = $derived.by(() => {
		const promise = (
			resource
				.then(tick)
				.then(() => currentAndReady.current as Awaited<_Result>)
		)

		return promise.then.bind(promise)
	})

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
		// ...currentAndReady,

		get then() {
			return then
		},

		get catch() {
			return (reject: any) =>
				then(undefined, reject ?? undefined)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
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

	const then = $derived.by(() => {
		const promise = (
			resource
				.then()
				.then(() => {}, () => {})
		)

		return (
			(resolve?: (v: _Value) => unknown,
			reject?: (e: unknown) => unknown
		) => {
			const result = promise.then(async () => {
				await tick()
				return current as _Value
			})

			return resolve || reject ? result.then(resolve, reject) : result
		}) as Promise<_Value>['then']
	})

	return {
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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Value>
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

	const then = $derived.by(() => {
		const promise = Promise.race(resources)

		return ((resolve?: (v: _Value) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()

				return current as _Value
			})

			return resolve || reject ? result.then(resolve, reject) : result
		}) as Promise<_Value>['then']
	})

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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Value>
}

/**
 * Combines multiple RemoteResources, resolving when all succeed.
 */
export const all = <_Resources extends readonly RemoteResource<unknown>[]>(
	resources: _Resources
): RemoteResource<{ [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? _Value : never }> => {
	type _Result = { [_Key in keyof _Resources]: _Resources[_Key] extends RemoteResource<infer _Value> ? _Value : never }

	const ready = $derived(
		resources.every(resource => resource.ready)
	)

	const current = $derived(
		ready ? resources.map(resource => resource.current) as _Result : undefined
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

	const then = $derived.by(() => {
		const promise = Promise.all(resources)

		return ((resolve?: (v: _Result) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()
				return current as _Result
			})

			return resolve || reject ? result.then(resolve, reject) : result
		}) as Promise<_Result>['then']
	})

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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Result>
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
		resources.every(resource => resource.ready || resource.error)
	)

	const current = $derived(
		ready
			? resources.map(resource => resource.error
				? { ready: false as const, current: undefined, error: resource.error }
				: { ready: true as const, current: resource.current, error: undefined }
			) as _Result
			: undefined
	)

	const loading = $derived(
		resources.some(resource => resource.loading)
	)

	const then = $derived.by(() => {
		const promise = Promise.allSettled(resources)

		return ((resolve?: (v: _Result) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()
				return current as _Result
			})

			return (
				resolve || reject ?
					result.then(resolve, reject)
				:
					result
			)
		}) as Promise<_Result>['then']
	})

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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Result>
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

	const then = $derived.by(() => {
		const promise = Promise.all(resources)
		return ((resolve?: (v: _Result[]) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()
				return current
			})

			return (
				resolve || reject ?
					result.then(resolve, reject)
				:
					result
			)
		}) as Promise<_Result[]>['then']
	})

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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Result[]>
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

	const then = $derived.by(() => {
		const promise = Promise.all(resources)

		return ((resolve?: (v: _Value[]) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()
				return current
			})

			return (
				resolve || reject ?
					result.then(resolve, reject)
				:
					result
			)
		}) as Promise<_Value[]>['then']
	})

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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Value[]>
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

	const then = $derived.by(() => {
		const promise = Promise.all(resources)

		return ((resolve?: (v: _Accumulator) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()
				return current
			})

			return (
				resolve || reject ?
					result.then(resolve, reject)
				:
					result
			)
		}) as Promise<_Accumulator>['then']
	})

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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Accumulator>
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

	const then = $derived.by(() => {
		const promise = Promise.all(resources)

		return ((resolve?: (v: _Result[]) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()
				return current
			})

			return (
				resolve || reject ?
					result.then(resolve, reject)
				:
					result
			)
		}) as Promise<_Result[]>['then']
	})

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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Result[]>
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

	const then = $derived.by(() => {
		const promise = resource.then().then(() => {}, () => {})

		return ((resolve?: (v: _Result) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()
				return current as _Result
			})

			return (
				resolve || reject ?
					result.then(resolve, reject)
				:
					result
			)
		}) as Promise<_Result>['then']
	})

	return {
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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Result>
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

	const then = $derived.by(() => {
		current

		return ((resolve?: (v: _Value) => unknown, reject?: (e: unknown) => unknown) => {
			const result = tick().then(() => current)

			return (
				resolve || reject ?
					result.then(resolve, reject)
				:
					result
			)
		}) as Promise<_Value>['then']
	})

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
			return true
		},

		get then() {
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Value>
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

	const then = $derived.by(() => {
		const promise = resource.then().then(value => getNextResource(value))

		return ((resolve?: (v: _Result) => unknown, reject?: (e: unknown) => unknown) => {
			const result = promise.then(async () => {
				await tick()
				return current as _Result
			})

			return (
				resolve || reject ?
					result.then(resolve, reject)
				:
					result
			)
		}) as Promise<_Result>['then']
	})

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
			return then
		},

		get catch() {
			return (reject: any) => (
				then(undefined, reject ?? undefined)
			)
		},

		get finally() {
			return (fn?: () => void) => (
				then(
					value => {
						fn?.()
						return value
					},
					error => {
						fn?.()
						throw error
					}
				)
			)
		}
	} as RemoteResource<_Result>
}
