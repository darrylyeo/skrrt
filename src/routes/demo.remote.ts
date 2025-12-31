import { query } from '$app/server'

// ============================================================================
// Demo data types
// ============================================================================

export type User = {
	id: number
	name: string
	email: string
	active: boolean
}

export type Post = {
	id: number
	userId: number
	title: string
}

export type Comment = {
	id: number
	postId: number
	text: string
	author: string
}

// ============================================================================
// Demo queries - simulating various async operations with randomization
// ============================================================================

const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack']
const DOMAINS = ['example.com', 'mail.io', 'work.co', 'dev.net', 'test.org']

const randomUser = (id: number): User => ({
	id,
	name: NAMES[(id - 1) % NAMES.length],
	email: `${NAMES[(id - 1) % NAMES.length].toLowerCase()}@${DOMAINS[Math.floor(Math.random() * DOMAINS.length)]}`,
	active: Math.random() > 0.3
})

/**
 * Returns a list of users after a random delay
 */
export const getUsers = query(async () => {
	await delay(400 + Math.random() * 600)
	return Array.from({ length: 5 }, (_, i) => randomUser(i + 1))
})

/**
 * Returns a single user by ID with random delay
 */
export const getUser = query('unchecked', async (id: number) => {
	await delay(100 + Math.random() * 300)
	if (id < 1 || id > 10) throw new Error(`User ${id} not found`)
	return randomUser(id)
})

const POST_TITLES = [
	'Getting started with SvelteKit',
	'Understanding Remote Functions',
	'CSS Grid Mastery',
	'TypeScript Tips',
	'Building Fast Web Apps',
	'State Management Patterns',
	'Testing Best Practices',
	'Performance Optimization',
	'Accessibility Guide',
	'Deployment Strategies'
]

/**
 * Returns posts for a specific user with random content and wide delay variance
 */
export const getPosts = query('unchecked', async (userId: number) => {
	await delay(100 + Math.random() * 900)
	const count = 1 + Math.floor(Math.random() * 3)
	return Array.from({ length: count }, (_, i) => ({
		id: userId * 10 + i,
		userId,
		title: POST_TITLES[Math.floor(Math.random() * POST_TITLES.length)]
	}))
})

/**
 * A fast query - resolves in ~200ms with variance
 */
export const getFast = query(async () => {
	await delay(150 + Math.random() * 100)
	return { source: 'fast', timestamp: Date.now(), latency: Math.floor(Math.random() * 50) }
})

/**
 * A medium-speed query - resolves in ~500ms with variance
 */
export const getMedium = query(async () => {
	await delay(400 + Math.random() * 200)
	return { source: 'medium', timestamp: Date.now(), latency: Math.floor(Math.random() * 100) }
})

/**
 * A slow query - resolves in ~1000ms with variance
 */
export const getSlow = query(async () => {
	await delay(800 + Math.random() * 400)
	return { source: 'slow', timestamp: Date.now(), latency: Math.floor(Math.random() * 200) }
})

const SUCCESS_MESSAGES = [
	'Operation completed successfully',
	'All systems operational',
	'Request processed',
	'Task finished',
	'Action completed'
]

/**
 * A query that always succeeds with random message
 */
export const getSuccess = query(async () => {
	await delay(200 + Math.random() * 400)
	return {
		status: 'success',
		message: SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)],
		code: 200 + Math.floor(Math.random() * 3) * 100
	}
})

const FAILURE_MESSAGES = [
	'Simulated failure for demonstration',
	'Connection timeout',
	'Service unavailable',
	'Rate limit exceeded',
	'Internal server error'
]

/**
 * A query that always fails with random error
 */
export const getFailure = query(async () => {
	await delay(200 + Math.random() * 400)
	throw new Error(FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)])
})

/**
 * A query that might fail based on seed (even = fail)
 */
export const getMayFail = query('unchecked', async (seed: number) => {
	await delay(200 + Math.random() * 200)
	if (seed % 2 === 0) {
		throw new Error(`Failed with seed ${seed}`)
	}
	return { seed, value: Math.random(), score: Math.floor(Math.random() * 100) }
})

/**
 * Returns randomized prices
 */
export const getPrices = query(async () => {
	await delay(300 + Math.random() * 400)
	return Array.from({ length: 5 }, () => Math.round((10 + Math.random() * 90) * 100) / 100)
})

/**
 * Returns a single random price by index with wide variance
 */
export const getPrice = query('unchecked', async (index: number) => {
	await delay(50 + Math.random() * 950)
	return Math.round((10 + Math.random() * 90) * 100) / 100
})

const PRODUCT_NAMES = ['Laptop', 'Headphones', 'Coffee Maker', 'Desk Chair', 'Monitor', 'Keyboard', 'Mouse', 'Webcam']
const CATEGORIES = ['electronics', 'kitchen', 'furniture', 'accessories']

/**
 * Returns products with randomized properties
 */
export const getProducts = query(async () => {
	await delay(400 + Math.random() * 400)
	return Array.from({ length: 5 }, (_, i) => ({
		id: i + 1,
		name: PRODUCT_NAMES[Math.floor(Math.random() * PRODUCT_NAMES.length)],
		price: Math.round((50 + Math.random() * 950) * 100) / 100,
		category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
		inStock: Math.random() > 0.3
	}))
})

const CONDITIONS = ['Sunny', 'Cloudy', 'Rainy', 'Clear', 'Stormy', 'Windy', 'Foggy']

/**
 * Returns weather data with randomized values
 */
export const getWeather = query('unchecked', async (city: string) => {
	await delay(400 + Math.random() * 500)
	return {
		city,
		temp: Math.floor(40 + Math.random() * 60),
		condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
		humidity: Math.floor(30 + Math.random() * 60)
	}
})

const STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD']

/**
 * Returns stock data with random fluctuations
 */
export const getStocks = query(async () => {
	await delay(200 + Math.random() * 400)
	return STOCK_SYMBOLS.slice(0, 4).map(symbol => ({
		symbol,
		price: Math.round((100 + Math.random() * 300) * 100) / 100,
		change: Math.round((Math.random() - 0.5) * 10 * 100) / 100,
		volume: Math.floor(Math.random() * 10000000)
	}))
})

const NOTIFICATION_MESSAGES = [
	'New follower: @${name}',
	'Your post was liked',
	'New comment on your article',
	'Weekly digest ready',
	'New message from ${name}',
	'Someone mentioned you',
	'New reply to your comment',
	'Your subscription renewed'
]

/**
 * Returns notifications with randomized content
 */
export const getNotifications = query(async () => {
	await delay(200 + Math.random() * 300)
	return Array.from({ length: 3 + Math.floor(Math.random() * 4) }, (_, i) => ({
		id: i + 1,
		message: NOTIFICATION_MESSAGES[Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)]
			.replace('${name}', NAMES[Math.floor(Math.random() * NAMES.length)]),
		read: Math.random() > 0.5,
		time: Date.now() - Math.floor(Math.random() * 86400000)
	}))
})

// ============================================================================
// Stress test queries - randomized values
// ============================================================================

/**
 * Returns a random number after random delay (100-500ms)
 */
export const getRandomNumber = query(async () => {
	await delay(100 + Math.random() * 400)
	return Math.floor(Math.random() * 1000)
})

/**
 * Returns a random number with highly variable delay to demonstrate parallel loading
 */
export const getRandomNumberById = query('unchecked', async (id: number) => {
	// Wide variance: 50-1500ms to clearly show out-of-order completion
	await delay(50 + Math.random() * 1450)
	return { id, value: Math.floor(Math.random() * 1000), timestamp: Date.now() }
})

/**
 * Random success/failure (configurable probability)
 */
export const getRandomResult = query('unchecked', async (failRate: number = 0.3) => {
	await delay(100 + Math.random() * 200)
	if (Math.random() < failRate) {
		throw new Error(`Random failure (${Math.floor(failRate * 100)}% rate)`)
	}
	return { success: true, value: Math.random(), timestamp: Date.now() }
})

/**
 * Returns random array of numbers
 */
export const getRandomArray = query('unchecked', async (size: number = 5) => {
	await delay(200 + Math.random() * 300)
	return Array.from({ length: size }, () => Math.floor(Math.random() * 100))
})

/**
 * Simulates flaky API - sometimes fast, sometimes slow, sometimes fails
 * Wide variance to clearly show out-of-order completion
 */
export const getFlakyData = query('unchecked', async (id: number) => {
	const scenario = Math.random()
	if (scenario < 0.15) {
		await delay(20 + Math.random() * 80)
		return { id, status: 'fast', value: Math.random() }
	} else if (scenario < 0.5) {
		await delay(200 + Math.random() * 600)
		return { id, status: 'normal', value: Math.random() }
	} else if (scenario < 0.85) {
		await delay(800 + Math.random() * 1200)
		return { id, status: 'slow', value: Math.random() }
	} else {
		await delay(50 + Math.random() * 150)
		throw new Error(`Flaky failure for id ${id}`)
	}
})

/**
 * Returns random stock-like data with price fluctuations
 */
export const getRandomStock = query('unchecked', async (symbol: string) => {
	await delay(100 + Math.random() * 200)
	const basePrice = symbol.length * 50 + Math.random() * 100
	const change = (Math.random() - 0.5) * 10
	return {
		symbol,
		price: Math.round(basePrice * 100) / 100,
		change: Math.round(change * 100) / 100,
		timestamp: Date.now()
	}
})

/**
 * Simulates polling data that changes each call
 */
export const getPollingData = query(async () => {
	await delay(100)
	return {
		counter: Math.floor(Math.random() * 1000),
		status: ['active', 'idle', 'processing', 'waiting'][Math.floor(Math.random() * 4)],
		timestamp: Date.now()
	}
})

// ============================================================================
// E-commerce Dashboard queries
// ============================================================================

export type Order = {
	id: string
	customerId: number
	items: Array<{ productId: number; quantity: number; price: number }>
	total: number
	status: 'pending' | 'processing' | 'shipped' | 'delivered'
	createdAt: number
}

export type Customer = {
	id: number
	name: string
	email: string
	tier: 'bronze' | 'silver' | 'gold' | 'platinum'
	totalSpent: number
}

export type ShippingStatus = {
	orderId: string
	carrier: string
	trackingNumber: string
	estimatedDelivery: number
	currentLocation: string
}

export type InventoryItem = {
	productId: number
	name: string
	stock: number
	reorderPoint: number
	supplier: string
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered'] as const
const CUSTOMER_TIERS = ['bronze', 'silver', 'gold', 'platinum'] as const
const CARRIERS = ['FedEx', 'UPS', 'USPS', 'DHL']
const LOCATIONS = ['Warehouse', 'In Transit', 'Local Hub', 'Out for Delivery']
const SUPPLIERS = ['Acme Corp', 'Global Parts', 'FastShip Inc', 'Quality Goods']

/**
 * Get recent orders - sometimes fails to simulate network issues
 */
export const getRecentOrders = query('unchecked', async (limit: number = 10) => {
	await delay(200 + Math.random() * 600)
	if (Math.random() < 0.1) throw new Error('Orders service temporarily unavailable')
	return Array.from({ length: limit }, (_, i) => ({
		id: `ORD-${1000 + i + Math.floor(Math.random() * 100)}`,
		customerId: Math.floor(Math.random() * 50) + 1,
		items: Array.from({ length: 1 + Math.floor(Math.random() * 4) }, () => ({
			productId: Math.floor(Math.random() * 100) + 1,
			quantity: Math.floor(Math.random() * 5) + 1,
			price: Math.round((10 + Math.random() * 90) * 100) / 100
		})),
		total: Math.round((50 + Math.random() * 450) * 100) / 100,
		status: ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)],
		createdAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
	})) satisfies Order[]
})

/**
 * Get a single order by ID
 */
export const getOrder = query('unchecked', async (orderId: string) => {
	await delay(100 + Math.random() * 400)
	return {
		id: orderId,
		customerId: Math.floor(Math.random() * 50) + 1,
		items: Array.from({ length: 1 + Math.floor(Math.random() * 4) }, () => ({
			productId: Math.floor(Math.random() * 100) + 1,
			quantity: Math.floor(Math.random() * 5) + 1,
			price: Math.round((10 + Math.random() * 90) * 100) / 100
		})),
		total: Math.round((50 + Math.random() * 450) * 100) / 100,
		status: ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)],
		createdAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
	} satisfies Order
})

/**
 * Get customer by ID - variable delay based on tier
 */
export const getCustomer = query('unchecked', async (id: number) => {
	await delay(50 + Math.random() * 300)
	const tier = CUSTOMER_TIERS[Math.floor(Math.random() * CUSTOMER_TIERS.length)]
	return {
		id,
		name: NAMES[id % NAMES.length],
		email: `${NAMES[id % NAMES.length].toLowerCase()}@${DOMAINS[id % DOMAINS.length]}`,
		tier,
		totalSpent: Math.round((tier === 'platinum' ? 5000 : tier === 'gold' ? 2000 : tier === 'silver' ? 500 : 100) * (0.5 + Math.random()) * 100) / 100
	} satisfies Customer
})

/**
 * Get shipping status - sometimes slow, sometimes fails
 */
export const getShippingStatus = query('unchecked', async (orderId: string) => {
	const scenario = Math.random()
	if (scenario < 0.15) {
		await delay(50 + Math.random() * 100)
	} else if (scenario < 0.7) {
		await delay(300 + Math.random() * 500)
	} else if (scenario < 0.9) {
		await delay(800 + Math.random() * 700)
	} else {
		await delay(100)
		throw new Error(`Tracking unavailable for ${orderId}`)
	}
	return {
		orderId,
		carrier: CARRIERS[Math.floor(Math.random() * CARRIERS.length)],
		trackingNumber: `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
		estimatedDelivery: Date.now() + Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000),
		currentLocation: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
	} satisfies ShippingStatus
})

/**
 * Get inventory for products
 */
export const getInventory = query('unchecked', async (productIds: number[]) => {
	await delay(200 + Math.random() * 400)
	return productIds.map(productId => ({
		productId,
		name: PRODUCT_NAMES[productId % PRODUCT_NAMES.length],
		stock: Math.floor(Math.random() * 200),
		reorderPoint: 20 + Math.floor(Math.random() * 30),
		supplier: SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)]
	})) satisfies InventoryItem[]
})

/**
 * Get analytics metric - fast for quick dashboard loading
 */
export const getMetric = query('unchecked', async (metric: 'revenue' | 'orders' | 'customers' | 'conversion') => {
	await delay(50 + Math.random() * 200)
	const values = {
		revenue: { value: Math.round(50000 + Math.random() * 100000), change: Math.round((Math.random() - 0.3) * 20) },
		orders: { value: Math.floor(200 + Math.random() * 300), change: Math.round((Math.random() - 0.4) * 15) },
		customers: { value: Math.floor(50 + Math.random() * 100), change: Math.round((Math.random() - 0.2) * 25) },
		conversion: { value: Math.round((2 + Math.random() * 3) * 10) / 10, change: Math.round((Math.random() - 0.5) * 10) / 10 }
	}
	return values[metric]
})

/**
 * Get customer orders - for chain demonstration
 */
export const getCustomerOrders = query('unchecked', async (customerId: number) => {
	await delay(150 + Math.random() * 350)
	const count = Math.floor(Math.random() * 5) + 1
	return Array.from({ length: count }, (_, i) => ({
		id: `ORD-${customerId * 100 + i}`,
		customerId,
		items: Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => ({
			productId: Math.floor(Math.random() * 100) + 1,
			quantity: Math.floor(Math.random() * 3) + 1,
			price: Math.round((10 + Math.random() * 50) * 100) / 100
		})),
		total: Math.round((30 + Math.random() * 200) * 100) / 100,
		status: ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)],
		createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
	})) satisfies Order[]
})

/**
 * Validate promo code - for transform demonstration
 */
export const validatePromoCode = query('unchecked', async (code: string) => {
	await delay(100 + Math.random() * 200)
	const valid = code.length >= 4 && Math.random() > 0.3
	if (!valid) throw new Error(`Invalid promo code: ${code}`)
	return {
		code,
		discount: Math.floor(5 + Math.random() * 25),
		type: Math.random() > 0.5 ? 'percent' : 'fixed' as const,
		expiresAt: Date.now() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
	}
})

// ============================================================================
// Helper function
// ============================================================================

const delay = (ms: number) =>
	new Promise(resolve => setTimeout(resolve, ms))

