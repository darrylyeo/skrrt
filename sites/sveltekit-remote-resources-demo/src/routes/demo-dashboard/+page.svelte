<script lang="ts">
	import {
		derive,
		catchError,
		race,
		all,
		allSettled,
		map,
		filter,
		reduce,
		flatMap,
		chain,
		transform,
		withDefault,
		timeout,
		delay
	} from 'sveltekit-remote-resources'
	import {
		getRecentOrders,
		getCustomer,
		getShippingStatus,
		getMetric,
		getCustomerOrders,
		validatePromoCode,
		getSlow,
		getFast,
		type Order
	} from '../demo.remote'
	import Boundary from '$lib/components/Boundary.svelte'
</script>

<div class="page wide">
	<a href="/" class="page-back">← Back to Home</a>

	<header class="page-header">
		<h1 class="page-title">Showcase: All Helpers</h1>
		<p class="page-description">
			A realistic dashboard demonstrating <strong>every helper function</strong> working together.
			Each section showcases a different helper with real e-commerce data patterns.
		</p>
	</header>

	<div class="dashboard-grid">
		<!-- 1. RACE -->
		<section class="card">
			<Boundary>
				{@const revenueMetric = getMetric('revenue')}
				{@const ordersMetric = getMetric('orders')}
				{@const firstMetric = race([revenueMetric, ordersMetric])}
				{@const refresh = () => { revenueMetric.refresh(); ordersMetric.refresh() }}
				<div class="card-header">
					<h2>race()</h2>
					<span class="helper-tag">Promise-like</span>
					{#if firstMetric.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Shows whichever metric loads first (revenue vs orders)</p>
				<div class="card-content">
					{#if firstMetric.loading}
						<div class="metric-loading">Racing...</div>
					{:else if firstMetric.ready}
						<div class="metric-value">{firstMetric.current.value.toLocaleString()}</div>
						<div class="metric-change" class:positive={firstMetric.current.change > 0} class:negative={firstMetric.current.change < 0}>
							{firstMetric.current.change > 0 ? '+' : ''}{firstMetric.current.change}%
						</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 2. ALL -->
		<section class="card wide">
			<Boundary>
				{@const revenueMetric = getMetric('revenue')}
				{@const ordersMetric = getMetric('orders')}
				{@const customersMetric = getMetric('customers')}
				{@const conversionMetric = getMetric('conversion')}
				{@const allMetricResources = [revenueMetric, ordersMetric, customersMetric, conversionMetric]}
				{@const allMetrics = all(allMetricResources)}
				{@const metricsDisplay = derive(allMetrics, ([revenue, orders, customers, conversion]) => ({
					revenue: `$${revenue.value.toLocaleString()}`,
					orders: orders.value.toString(),
					customers: customers.value.toString(),
					conversion: `${conversion.value}%`
				}))}
				{@const refresh = () => allMetricResources.forEach(m => m.refresh())}
				<div class="card-header">
					<h2>all()</h2>
					<span class="helper-tag">Promise-like</span>
					{#if allMetrics.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Combines all 4 metrics, waits for all to complete</p>
				<div class="card-content metrics-grid">
					{#if metricsDisplay.ready}
						<div class="metric-item">
							<span class="metric-label">Revenue</span>
							<span class="metric-val">{metricsDisplay.current.revenue}</span>
						</div>
						<div class="metric-item">
							<span class="metric-label">Orders</span>
							<span class="metric-val">{metricsDisplay.current.orders}</span>
						</div>
						<div class="metric-item">
							<span class="metric-label">Customers</span>
							<span class="metric-val">{metricsDisplay.current.customers}</span>
						</div>
						<div class="metric-item">
							<span class="metric-label">Conversion</span>
							<span class="metric-val">{metricsDisplay.current.conversion}</span>
						</div>
					{:else}
						<div class="metric-loading">Loading all metrics...</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 3. withDefault -->
		<section class="card">
			<Boundary>
				{@const recentOrdersResource = getRecentOrders(5)}
				{@const ordersWithDefault = withDefault(recentOrdersResource, [] as Order[])}
				{@const refresh = () => recentOrdersResource.refresh()}
				<div class="card-header">
					<h2>withDefault()</h2>
					<span class="helper-tag">Utility</span>
					{#if ordersWithDefault.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Shows empty array while orders load (no loading flash)</p>
				<div class="card-content">
					<div class="order-count">
						{(ordersWithDefault.current ?? []).length} orders
						{#if ordersWithDefault.loading}
							<span class="loading-indicator">⏳</span>
						{/if}
					</div>
					<div class="order-list">
						{#each (ordersWithDefault.current ?? []).slice(0, 3) as order}
							<div class="order-item">{order.id}: ${order.total.toFixed(2)}</div>
						{/each}
					</div>
				</div>
			</Boundary>
		</section>

		<!-- 4 & 5. catchError + allSettled -->
		<section class="card">
			<Boundary>
				{@const orderIds = ['ORD-1001', 'ORD-1002', 'ORD-1003']}
				{@const shippingResources = orderIds.map(id => getShippingStatus(id))}
				{@const shippingStatuses = shippingResources.map((resource, i) => catchError(resource, () => ({
					orderId: orderIds[i],
					carrier: 'Unknown',
					trackingNumber: 'N/A',
					estimatedDelivery: 0,
					currentLocation: 'Unavailable'
				})))}
				{@const settledShipping = allSettled(shippingStatuses)}
				{@const refresh = () => shippingResources.forEach(s => s.refresh())}
				<div class="card-header">
					<h2>catchError() + allSettled()</h2>
					<span class="helper-tag">Promise-like</span>
					{#if settledShipping.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Tracks shipping with graceful error handling</p>
				<div class="card-content">
					{#if settledShipping.ready}
						{#each settledShipping.current as result, i}
							<div class="settled-item" class:ready={result.ready} class:error={result.error}>
								<span class="settled-id">{orderIds[i]}</span>
								{#if result.ready}
									<span class="settled-status">{result.current.carrier} - {result.current.currentLocation}</span>
								{:else if result.error}
									<span class="settled-error">Tracking unavailable</span>
								{/if}
							</div>
						{/each}
					{:else}
						<div class="loading-text">Checking shipping...</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 6. map -->
		<section class="card">
			<Boundary>
				{@const customerResources = [1, 2, 3, 4, 5].map(id => getCustomer(id))}
				{@const customerNames = map(customerResources, c => `${c.name} (${c.tier})`)}
				{@const refresh = () => customerResources.forEach(c => c.refresh())}
				<div class="card-header">
					<h2>map()</h2>
					<span class="helper-tag">Array Helper</span>
					{#if customerNames.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Transforms customer resources to name+tier strings</p>
				<div class="card-content">
					{#if customerNames.ready}
						<div class="name-list">
							{#each customerNames.current ?? [] as name}
								<div class="name-chip">{name}</div>
							{/each}
						</div>
					{:else}
						<div class="loading-text">Loading {customerResources.filter(c => c.ready).length}/5 customers...</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 7. filter -->
		<section class="card">
			<Boundary>
				{@const customerResources = [1, 2, 3, 4, 5].map(id => getCustomer(id))}
				{@const highValueCustomers = filter(customerResources, c => c.tier === 'gold' || c.tier === 'platinum')}
				{@const refresh = () => customerResources.forEach(c => c.refresh())}
				<div class="card-header">
					<h2>filter()</h2>
					<span class="helper-tag">Array Helper</span>
					{#if highValueCustomers.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Shows only gold/platinum tier customers</p>
				<div class="card-content">
					{#if highValueCustomers.ready}
						<div class="customer-list">
							{#each highValueCustomers.current ?? [] as customer}
								<div class="customer-chip" class:gold={customer.tier === 'gold'} class:platinum={customer.tier === 'platinum'}>
									{customer.name} · ${customer.totalSpent.toFixed(0)}
								</div>
							{:else}
								<div class="empty-text">No high-value customers found</div>
							{/each}
						</div>
					{:else}
						<div class="loading-text">Filtering...</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 8. reduce -->
		<section class="card">
			<Boundary>
				{@const customerResources = [1, 2, 3, 4, 5].map(id => getCustomer(id))}
				{@const totalCustomerSpend = reduce(customerResources, (sum, c) => sum + c.totalSpent, 0)}
				{@const refresh = () => customerResources.forEach(c => c.refresh())}
				<div class="card-header">
					<h2>reduce()</h2>
					<span class="helper-tag">Array Helper</span>
					{#if totalCustomerSpend.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Calculates total spend across all customers</p>
				<div class="card-content">
					{#if totalCustomerSpend.ready}
						<div class="total-value">${totalCustomerSpend.current?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
						<div class="total-label">Total Customer Spend</div>
					{:else}
						<div class="loading-text">Calculating...</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 9. flatMap -->
		<section class="card">
			<Boundary>
				{@const ordersForFlatMapResource = getRecentOrders(3)}
				{@const allProductIds = flatMap([ordersForFlatMapResource], orders => orders.flatMap(o => o.items.map(i => i.productId)))}
				{@const refresh = () => ordersForFlatMapResource.refresh()}
				<div class="card-header">
					<h2>flatMap()</h2>
					<span class="helper-tag">Array Helper</span>
					{#if allProductIds.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Extracts all product IDs from nested order items</p>
				<div class="card-content">
					{#if allProductIds.ready}
						<div class="product-ids">
							{allProductIds.current.length} products
							<div class="id-preview">
								{allProductIds.current.slice(0, 8).join(', ')}{allProductIds.current.length > 8 ? '...' : ''}
							</div>
						</div>
					{:else}
						<div class="loading-text">Flattening...</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 10. chain -->
		<section class="card wide">
			<Boundary>
				{@const selectedCustomer = getCustomer(1)}
				{@const customerOrdersChained = chain(selectedCustomer, customer => getCustomerOrders(customer.id))}
				{@const customerOrderCount = derive(customerOrdersChained, orders => orders.length)}
				{@const customerTotalSpent = derive(customerOrdersChained, orders => orders.reduce((sum, o) => sum + o.total, 0))}
				{@const refresh = () => selectedCustomer.refresh()}
				<div class="card-header">
					<h2>chain()</h2>
					<span class="helper-tag">Utility</span>
					{#if customerOrdersChained.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Gets customer first, then fetches their orders (dependent query)</p>
				<div class="card-content chain-content">
					<div class="chain-step">
						<span class="step-label">Step 1: Customer</span>
						{#if selectedCustomer.ready}
							<div class="step-value">{selectedCustomer.current.name} ({selectedCustomer.current.tier})</div>
						{:else}
							<div class="loading-text">Loading customer...</div>
						{/if}
					</div>
					<div class="chain-arrow">→</div>
					<div class="chain-step">
						<span class="step-label">Step 2: Their Orders</span>
						{#if customerOrdersChained.ready}
							<div class="step-value">{customerOrderCount.current} orders · ${customerTotalSpent.current?.toFixed(2)}</div>
						{:else if selectedCustomer.ready}
							<div class="loading-text">Loading orders...</div>
						{:else}
							<div class="loading-text">Waiting...</div>
						{/if}
					</div>
				</div>
			</Boundary>
		</section>

		<!-- 11. transform -->
		<section class="card">
			<Boundary>
				{@const promoResource = validatePromoCode('SAVE20')}
				{@const promoResult = transform<Awaited<ReturnType<typeof validatePromoCode>>, { valid: boolean; message: string }>(promoResource, {
					onSuccess: (promo) => ({ valid: true, message: `${promo.discount}% off with ${promo.code}!` }),
					onError: (err) => ({ valid: false, message: `Promo failed: ${(err as Error).message}` })
				})}
				{@const refresh = () => promoResource.refresh()}
				<div class="card-header">
					<h2>transform()</h2>
					<span class="helper-tag">Utility</span>
					{#if promoResult.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Validates promo code with distinct success/error handlers</p>
				<div class="card-content">
					{#if promoResult.ready}
						{@const result = promoResult.current as { valid: boolean; message: string }}
						<div class="promo-result" class:valid={result.valid} class:invalid={!result.valid}>
							{result.message}
						</div>
					{:else}
						<div class="loading-text">Validating SAVE20...</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 12. Composition -->
		<section class="card">
			<Boundary>
				{@const vipCustomerResources = [6, 7, 8, 9, 10].map(id => getCustomer(id))}
				{@const vipCustomerSummary = derive(filter(vipCustomerResources, (c) => c.totalSpent > 1000), (customers) => customers.map(c => c.name))}
				{@const refresh = () => vipCustomerResources.forEach(c => c.refresh())}
				<div class="card-header">
					<h2>filter() + derive()</h2>
					<span class="helper-tag">Composition</span>
					{#if vipCustomerSummary.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Composes filter with transformation</p>
				<div class="card-content">
					{#if vipCustomerSummary.ready}
						<div class="vip-list">
							<div class="vip-label">VIP Customers ($1000+)</div>
							{#each vipCustomerSummary.current ?? [] as name}
								<div class="vip-chip">{name}</div>
							{:else}
								<div class="empty-text">No VIPs in this batch</div>
							{/each}
						</div>
					{:else}
						<div class="loading-text">Piping...</div>
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 13. TIMEOUT -->
		<section class="card">
			<Boundary>
				{@const slowResource = getSlow()}
				{@const timedResource = timeout(slowResource, 500)}
				{@const safeTimedResource = catchError(timedResource, (err) => ({ status: 'timeout', message: (err as Error).message }))}
				{@const refresh = () => slowResource.refresh()}
				<div class="card-header">
					<h2>timeout()</h2>
					<span class="helper-tag">Timing</span>
					{#if safeTimedResource.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Fails if slow query (~1s) doesn't complete in 500ms</p>
				<div class="card-content">
					{#if safeTimedResource.loading}
						<div class="timing-indicator">
							<span class="spinner"></span>
							<span>Racing against 500ms limit...</span>
						</div>
					{:else if safeTimedResource.ready}
						{@const result = safeTimedResource.current}
						{#if 'status' in result && result.status === 'timeout'}
							<div class="timing-result timeout">
								⏱️ {result.message}
							</div>
						{:else}
							<div class="timing-result success">
								✓ Completed in time!
							</div>
						{/if}
					{/if}
				</div>
			</Boundary>
		</section>

		<!-- 14. DELAY -->
		<section class="card">
			<Boundary>
				{@const fastResource = getFast()}
				{@const delayedResource = delay(fastResource, 800)}
				{@const refresh = () => fastResource.refresh()}
				<div class="card-header">
					<h2>delay()</h2>
					<span class="helper-tag">Timing</span>
					{#if delayedResource.loading}
						<button class="status-mini status-loading" onclick={refresh} aria-label="Loading"><span class="spinner"></span></button>
					{:else}
						<button class="status-mini status-success" onclick={refresh} aria-label="Refresh">↻</button>
					{/if}
				</div>
				<p class="card-desc">Fast query (~200ms) with 800ms minimum loading time</p>
				<div class="card-content">
					<div class="delay-comparison">
						<div class="delay-bar">
							<span class="delay-label">Original</span>
							<div class="delay-track">
								<div class="delay-fill" class:complete={fastResource.ready}>
									{#if fastResource.loading}<span class="spinner small"></span>{:else}✓{/if}
								</div>
							</div>
						</div>
						<div class="delay-bar">
							<span class="delay-label">+800ms</span>
							<div class="delay-track">
								<div class="delay-fill delayed" class:complete={delayedResource.ready}>
									{#if delayedResource.loading}<span class="spinner small"></span>{:else}✓{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			</Boundary>
		</section>
	</div>

	<section class="helper-legend">
		<h2>Helpers Used</h2>
		<div class="legend-grid">
			<div class="legend-item"><code>derive</code> Transform values</div>
			<div class="legend-item"><code>catchError</code> Error fallbacks</div>
			<div class="legend-item"><code>race</code> First to complete</div>
			<div class="legend-item"><code>all</code> Combine resources</div>
			<div class="legend-item"><code>allSettled</code> Track all outcomes</div>
			<div class="legend-item"><code>map</code> Transform arrays</div>
			<div class="legend-item"><code>filter</code> Filter arrays</div>
			<div class="legend-item"><code>reduce</code> Aggregate arrays</div>
			<div class="legend-item"><code>flatMap</code> Flatten nested</div>
			<div class="legend-item"><code>chain</code> Dependent queries</div>
			<div class="legend-item"><code>transform</code> Success/error</div>
			<div class="legend-item"><code>withDefault</code> Loading defaults</div>
			<div class="legend-item"><code>timeout</code> Time limits</div>
			<div class="legend-item"><code>delay</code> Min loading time</div>
		</div>
	</section>
</div>

<style>
	p {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		padding: 1.25rem;
	}

	.card.wide {
		grid-column: span 2;
	}

	@media (max-width: 768px) {
		.card.wide {
			grid-column: span 1;
		}
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.card-header h2 {
		font-family: var(--font-mono);
		font-size: 1rem;
		margin: 0;
		color: var(--accent-primary);
	}

	.helper-tag {
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		background: var(--bg-tertiary);
		border-radius: 4px;
		color: var(--text-muted);
		margin-right: auto;
	}

	.status-mini {
		width: 24px;
		height: 24px;
		padding: 0;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		display: grid;
		place-items: center;
		font-size: 0.9rem;
		background: var(--bg-tertiary);
		color: var(--text-secondary);
		transition: background 0.15s, transform 0.15s;
	}

	.status-mini:hover {
		background: var(--bg-primary);
		transform: scale(1.1);
	}

	.status-mini.status-loading {
		pointer-events: none;
	}

	.status-mini.status-success {
		color: var(--success);
	}

	.status-mini .spinner {
		width: 12px;
		height: 12px;
		border: 2px solid var(--border-color);
		border-top-color: var(--accent-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.card-desc {
		font-size: 0.85rem;
		color: var(--text-muted);
		margin: 0 0 1rem 0;
	}

	.card-content {
		min-height: 60px;
	}

	.metric-loading,
	.loading-text {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.metric-value {
		font-size: 2rem;
		font-weight: 600;
		font-family: var(--font-mono);
		color: var(--text-primary);
	}

	.metric-change {
		font-size: 0.9rem;
		font-family: var(--font-mono);
	}

	.metric-change.positive {
		color: var(--success);
	}

	.metric-change.negative {
		color: var(--error);
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	@media (max-width: 768px) {
		.metrics-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.metric-item {
		text-align: center;
	}

	.metric-label {
		display: block;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.metric-val {
		font-size: 1.25rem;
		font-weight: 600;
		font-family: var(--font-mono);
		color: var(--text-primary);
	}

	.order-count {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.loading-indicator {
		font-size: 0.9rem;
	}

	.order-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.order-item {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.settled-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 4px;
		margin-bottom: 0.25rem;
		background: var(--bg-tertiary);
	}

	.settled-item.ready {
		border-left: 3px solid var(--success);
	}

	.settled-item.error {
		border-left: 3px solid var(--error);
	}

	.settled-id {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.settled-status {
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.settled-error {
		font-size: 0.85rem;
		color: var(--error);
	}

	.name-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.name-chip {
		padding: 0.25rem 0.75rem;
		background: var(--bg-tertiary);
		border-radius: 999px;
		font-size: 0.85rem;
	}

	.customer-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.customer-chip {
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.85rem;
	}

	.customer-chip.gold {
		background: linear-gradient(135deg, #f5c842 0%, #d4a424 100%);
		color: #1a1a1a;
	}

	.customer-chip.platinum {
		background: linear-gradient(135deg, #e5e5e5 0%, #a0a0a0 100%);
		color: #1a1a1a;
	}

	.empty-text {
		color: var(--text-muted);
		font-size: 0.85rem;
		font-style: italic;
	}

	.total-value {
		font-size: 2rem;
		font-weight: 600;
		font-family: var(--font-mono);
		color: var(--success);
	}

	.total-label {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.product-ids {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.id-preview {
		font-size: 0.8rem;
		font-family: var(--font-mono);
		color: var(--text-muted);
		margin-top: 0.5rem;
	}

	.chain-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.chain-step {
		flex: 1;
	}

	.step-label {
		display: block;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.step-value {
		font-weight: 500;
	}

	.chain-arrow {
		font-size: 1.5rem;
		color: var(--accent-primary);
	}

	.promo-result {
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.promo-result.valid {
		background: rgba(74, 222, 128, 0.1);
		color: var(--success);
	}

	.promo-result.invalid {
		background: rgba(248, 113, 113, 0.1);
		color: var(--error);
	}

	.vip-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.vip-label {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.vip-chip {
		padding: 0.25rem 0.75rem;
		background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
		color: white;
		border-radius: 999px;
		font-size: 0.85rem;
		width: fit-content;
	}

	.timing-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary);
	}

	.timing-result {
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.timing-result.timeout {
		background: rgba(251, 191, 36, 0.1);
		color: #fbbf24;
	}

	.timing-result.success {
		background: rgba(74, 222, 128, 0.1);
		color: var(--success);
	}

	.delay-comparison {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.delay-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.delay-label {
		font-size: 0.8rem;
		color: var(--text-muted);
		min-width: 60px;
	}

	.delay-track {
		flex: 1;
		height: 28px;
		background: var(--bg-tertiary);
		border-radius: 4px;
		overflow: hidden;
	}

	.delay-fill {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-tertiary);
		color: var(--text-muted);
		transition: all 0.3s ease;
	}

	.delay-fill.complete {
		background: var(--success);
		color: white;
	}

	.spinner.small {
		width: 14px;
		height: 14px;
		border-width: 2px;
	}

	.helper-legend {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		padding: 1.5rem;
	}

	.helper-legend h2 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
	}

	.legend-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	.legend-item {
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.legend-item code {
		font-family: var(--font-mono);
		color: var(--accent-primary);
		background: var(--bg-tertiary);
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		margin-right: 0.5rem;
	}
</style>
