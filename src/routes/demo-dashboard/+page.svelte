<script lang="ts">
	import {
		then,
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
		withDefault
	} from '$lib/RemoteResource.svelte'
	import {
		getRecentOrders,
		getCustomer,
		getShippingStatus,
		getMetric,
		getCustomerOrders,
		validatePromoCode,
		type Order
	} from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="Showcase: All Helpers">
{@const orderIds = ['ORD-1001', 'ORD-1002', 'ORD-1003']}

{@const revenueMetric = getMetric('revenue')}
{@const ordersMetric = getMetric('orders')}
{@const customersMetric = getMetric('customers')}
{@const conversionMetric = getMetric('conversion')}
{@const allMetricResources = [revenueMetric, ordersMetric, customersMetric, conversionMetric]}
{@const refreshMetrics = () => allMetricResources.forEach(m => m.refresh())}

{@const firstMetric = race([revenueMetric, ordersMetric])}
{@const allMetrics = all(allMetricResources)}
{@const metricsDisplay = then(allMetrics, ([revenue, orders, customers, conversion]) => ({
	revenue: `$${revenue.value.toLocaleString()}`,
	orders: orders.value.toString(),
	customers: customers.value.toString(),
	conversion: `${conversion.value}%`
}))}

{@const recentOrdersResource = getRecentOrders(5)}
{@const ordersWithDefault = withDefault(recentOrdersResource, [] as Order[])}
{@const refreshOrders = () => recentOrdersResource.refresh()}

{@const shippingResources = orderIds.map(id => getShippingStatus(id))}
{@const shippingStatuses = shippingResources.map((resource, i) => catchError(resource, () => ({
	orderId: orderIds[i],
	carrier: 'Unknown',
	trackingNumber: 'N/A',
	estimatedDelivery: 0,
	currentLocation: 'Unavailable'
})))}
{@const settledShipping = allSettled(shippingStatuses)}
{@const refreshShipping = () => shippingResources.forEach(s => s.refresh())}

{@const customerResources = [1, 2, 3, 4, 5].map(id => getCustomer(id))}
{@const customerNames = map(customerResources, c => `${c.name} (${c.tier})`)}
{@const highValueCustomers = filter(customerResources, c => c.tier === 'gold' || c.tier === 'platinum')}
{@const totalCustomerSpend = reduce(customerResources, (sum, c) => sum + c.totalSpent, 0)}
{@const refreshCustomers = () => customerResources.forEach(c => c.refresh())}

{@const ordersForFlatMapResource = getRecentOrders(3)}
{@const allProductIds = flatMap([ordersForFlatMapResource], orders => orders.flatMap(o => o.items.map(i => i.productId)))}
{@const refreshFlatMap = () => ordersForFlatMapResource.refresh()}

{@const selectedCustomer = getCustomer(1)}
{@const customerOrdersChained = chain(selectedCustomer, customer => getCustomerOrders(customer.id))}
{@const customerOrderCount = then(customerOrdersChained, orders => orders.length)}
{@const customerTotalSpent = then(customerOrdersChained, orders => orders.reduce((sum, o) => sum + o.total, 0))}
{@const refreshChain = () => selectedCustomer.refresh()}

{@const promoResource = validatePromoCode('SAVE20')}
{@const promoResult = transform<Awaited<ReturnType<typeof validatePromoCode>>, { valid: boolean; message: string }>(promoResource, {
	onSuccess: (promo) => ({ valid: true, message: `${promo.discount}% off with ${promo.code}!` }),
	onError: (err) => ({ valid: false, message: `Promo failed: ${(err as Error).message}` })
})}
{@const refreshPromo = () => promoResource.refresh()}

{@const vipCustomerResources = [6, 7, 8, 9, 10].map(id => getCustomer(id))}
{@const vipCustomerSummary = then(filter(vipCustomerResources, (c) => c.totalSpent > 1000), (customers) => customers.map(c => c.name))}
{@const refreshVip = () => vipCustomerResources.forEach(c => c.refresh())}

{@const readyCount = (firstMetric.ready ? 1 : 0) + (allMetrics.ready ? 1 : 0) + (ordersWithDefault.ready ? 1 : 0) + (settledShipping.ready ? 1 : 0) + (customerNames.ready ? 1 : 0) + (highValueCustomers.ready ? 1 : 0) + (totalCustomerSpend.ready ? 1 : 0) + (allProductIds.ready ? 1 : 0) + (customerOrdersChained.ready ? 1 : 0) + (promoResult.ready ? 1 : 0) + (vipCustomerSummary.ready ? 1 : 0)}
{@const totalSections = 11}
{@const refreshAll = () => {
	refreshMetrics()
	refreshOrders()
	refreshShipping()
	refreshCustomers()
	refreshFlatMap()
	refreshChain()
	refreshPromo()
	refreshVip()
}}

<div class="page" style="max-width: 1400px;">
	<a href="/" class="page-back">← Back to Home</a>

	<header class="page-header">
		<h1 class="page-title">Showcase: All Helpers</h1>
		<p class="page-description">
			A realistic dashboard demonstrating <strong>every helper function</strong> working together.
			Each section showcases a different helper with real e-commerce data patterns.
		</p>
	</header>

	<div class="controls">
		<div class="progress-info">
			<span class="progress-text">{readyCount}/{totalSections} sections</span>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {(readyCount / totalSections) * 100}%"></div>
			</div>
		</div>
		{#if readyCount < totalSections}
			<button class="status status-loading" onclick={refreshAll}><span class="spinner"></span> Loading...</button>
		{:else}
			<button class="status status-success" onclick={refreshAll}>↻ Refresh All</button>
		{/if}
	</div>

	<div class="dashboard-grid">
		<!-- 1. RACE -->
		<section class="card">
			<div class="card-header">
				<h2>race()</h2>
				<span class="helper-tag">Promise-like</span>
				{#if firstMetric.loading}
					<button class="status-mini status-loading" onclick={refreshMetrics} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshMetrics} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 2. ALL -->
		<section class="card wide">
			<div class="card-header">
				<h2>all()</h2>
				<span class="helper-tag">Promise-like</span>
				{#if allMetrics.loading}
					<button class="status-mini status-loading" onclick={refreshMetrics} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshMetrics} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 3. withDefault -->
		<section class="card">
			<div class="card-header">
				<h2>withDefault()</h2>
				<span class="helper-tag">Utility</span>
				{#if ordersWithDefault.loading}
					<button class="status-mini status-loading" onclick={refreshOrders} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshOrders} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 4 & 5. catchError + allSettled -->
		<section class="card">
			<div class="card-header">
				<h2>catchError() + allSettled()</h2>
				<span class="helper-tag">Promise-like</span>
				{#if settledShipping.loading}
					<button class="status-mini status-loading" onclick={refreshShipping} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshShipping} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 6. map -->
		<section class="card">
			<div class="card-header">
				<h2>map()</h2>
				<span class="helper-tag">Array Helper</span>
				{#if customerNames.loading}
					<button class="status-mini status-loading" onclick={refreshCustomers} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshCustomers} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 7. filter -->
		<section class="card">
			<div class="card-header">
				<h2>filter()</h2>
				<span class="helper-tag">Array Helper</span>
				{#if highValueCustomers.loading}
					<button class="status-mini status-loading" onclick={refreshCustomers} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshCustomers} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 8. reduce -->
		<section class="card">
			<div class="card-header">
				<h2>reduce()</h2>
				<span class="helper-tag">Array Helper</span>
				{#if totalCustomerSpend.loading}
					<button class="status-mini status-loading" onclick={refreshCustomers} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshCustomers} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 9. flatMap -->
		<section class="card">
			<div class="card-header">
				<h2>flatMap()</h2>
				<span class="helper-tag">Array Helper</span>
				{#if allProductIds.loading}
					<button class="status-mini status-loading" onclick={refreshFlatMap} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshFlatMap} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 10. chain -->
		<section class="card wide">
			<div class="card-header">
				<h2>chain()</h2>
				<span class="helper-tag">Utility</span>
				{#if customerOrdersChained.loading}
					<button class="status-mini status-loading" onclick={refreshChain} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshChain} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 12. transform -->
		<section class="card">
			<div class="card-header">
				<h2>transform()</h2>
				<span class="helper-tag">Utility</span>
				{#if promoResult.loading}
					<button class="status-mini status-loading" onclick={refreshPromo} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshPromo} aria-label="Refresh">↻</button>
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
		</section>

		<!-- 13. Composition -->
		<section class="card">
			<div class="card-header">
				<h2>filter() + then()</h2>
				<span class="helper-tag">Composition</span>
				{#if vipCustomerSummary.loading}
					<button class="status-mini status-loading" onclick={refreshVip} aria-label="Loading"><span class="spinner"></span></button>
				{:else}
					<button class="status-mini status-success" onclick={refreshVip} aria-label="Refresh">↻</button>
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
		</section>
	</div>

	<section class="helper-legend">
		<h2>Helpers Used</h2>
		<div class="legend-grid">
			<div class="legend-item"><code>then</code> Transform values</div>
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
		</div>
	</section>
</div>
</PageBoundary>

<style>

	p {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: var(--border-radius);
		border: 1px solid var(--border-color);
	}

	.progress-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.progress-text {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.progress-bar {
		width: 120px;
		height: 6px;
		background: var(--bg-tertiary);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent-primary);
		transition: width 0.3s;
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
		font-size: 1rem;
		font-family: var(--font-mono);
		color: var(--accent-primary);
		margin: 0;
	}

	.helper-tag {
		font-size: 0.65rem;
		padding: 0.2rem 0.5rem;
		background: var(--bg-tertiary);
		border-radius: 4px;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-mini {
		margin-left: auto;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.status-mini.status-loading {
		background: rgba(255, 193, 7, 0.2);
		color: #ffc107;
	}

	.status-mini.status-success {
		background: rgba(0, 212, 170, 0.2);
		color: var(--success-color);
	}

	.status-mini .spinner {
		width: 10px;
		height: 10px;
		border-width: 1.5px;
	}

	.card-desc {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	.card-content {
		min-height: 60px;
	}

	.metric-loading, .loading-text {
		color: var(--text-muted);
		font-style: italic;
	}

	.metric-value {
		font-size: 2rem;
		font-weight: 700;
		font-family: var(--font-mono);
		color: var(--accent-primary);
	}

	.metric-change {
		font-size: 0.9rem;
		font-family: var(--font-mono);
	}

	.metric-change.positive { color: var(--success-color); }
	.metric-change.negative { color: var(--error-color); }

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.metric-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.metric-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.metric-val {
		font-size: 1.25rem;
		font-weight: 600;
		font-family: var(--font-mono);
		color: var(--accent-primary);
	}

	.order-count {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.loading-indicator {
		margin-left: 0.5rem;
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
	}

	.settled-item.ready { background: rgba(0, 212, 170, 0.1); }
	.settled-item.error { background: rgba(255, 107, 107, 0.1); }

	.settled-id {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.settled-status {
		font-size: 0.85rem;
		color: var(--success-color);
	}

	.settled-error {
		font-size: 0.85rem;
		color: var(--error-color);
	}

	.name-list, .customer-list, .vip-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.name-chip, .customer-chip, .vip-chip {
		padding: 0.35rem 0.75rem;
		background: var(--bg-tertiary);
		border-radius: 20px;
		font-size: 0.8rem;
	}

	.customer-chip.gold { background: #ffd700; color: #333; }
	.customer-chip.platinum { background: #e5e4e2; color: #333; }

	.vip-chip {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.vip-label {
		width: 100%;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.empty-text {
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	.total-value {
		font-size: 2rem;
		font-weight: 700;
		font-family: var(--font-mono);
		color: var(--accent-primary);
	}

	.total-label {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.product-ids {
		font-family: var(--font-mono);
	}

	.id-preview {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
	}

	.chain-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.chain-step {
		flex: 1;
		padding: 1rem;
		background: var(--bg-tertiary);
		border-radius: 8px;
	}

	.step-label {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		display: block;
		margin-bottom: 0.5rem;
	}

	.step-value {
		font-weight: 600;
	}

	.chain-arrow {
		font-size: 1.5rem;
		color: var(--accent-primary);
	}

	.promo-result {
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-weight: 500;
	}

	.promo-result.valid {
		background: rgba(0, 212, 170, 0.15);
		color: var(--success-color);
	}

	.promo-result.invalid {
		background: rgba(255, 107, 107, 0.15);
		color: var(--error-color);
	}

	.helper-legend {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		padding: 1.5rem;
	}

	.helper-legend h2 {
		font-size: 1rem;
		margin: 0 0 1rem;
		color: var(--text-secondary);
	}

	.legend-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.5rem;
	}

	.legend-item {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.legend-item code {
		font-family: var(--font-mono);
		color: var(--accent-primary);
		margin-right: 0.5rem;
	}
</style>
