<script lang="ts">
	import { then, all, reduce } from '$lib/RemoteResource.svelte'
	import { getPollingData, getRandomStock } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'

	const ALL_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'NFLX', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'UBER', 'SPOT', 'SNAP', 'PINS', 'TWTR', 'LYFT']
	const PRESETS = [5, 10, 15, 20]

	let count = $state(5)
	let pollCount = $state(0)
	let isPolling = $state(false)
	let pollInterval: ReturnType<typeof setInterval> | null = null

	const symbols = $derived(ALL_SYMBOLS.slice(0, count))

	let stockResources = $state(ALL_SYMBOLS.slice(0, 5).map(s => getRandomStock(s)))
	let pollingResource = $state(getPollingData())

	// History of polling results
	let history = $state<Array<{ counter: number; status: string; timestamp: number }>>([])

	// Derived calculations
	const totalValue = $derived(
		reduce(stockResources, (sum, s) => sum + s.price, 0)
	)

	const avgChange = $derived(
		reduce(stockResources, (sum, s) => sum + s.change, 0)
	)

	const allStocksReady = $derived(
		all(stockResources as const)
	)

	const pollingStatus = $derived(
		then(pollingResource, data => data.status)
	)

	const refreshStocks = () => {
		stockResources = symbols.map(s => getRandomStock(s))
	}

	const startPolling = () => {
		if (isPolling) return
		isPolling = true
		pollInterval = setInterval(() => {
			pollCount++
			refreshStocks()
			const oldPolling = pollingResource
			pollingResource = getPollingData()
			if (oldPolling.ready) {
				history = [...history.slice(-19), oldPolling.current]
			}
		}, 1500)
	}

	const stopPolling = () => {
		isPolling = false
		if (pollInterval) {
			clearInterval(pollInterval)
			pollInterval = null
		}
	}

	const manualRefresh = () => {
		pollCount++
		refreshStocks()
		pollingResource = getPollingData()
	}

	const setCount = (n: number) => {
		count = n
		refreshStocks()
	}
</script>

<PageBoundary title="Realtime: Live Updates">
	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">Realtime: Live Updates</h1>
			<p class="page-description">
				Tests reactivity with continuous polling. Adjust stocks count and start/stop polling.
			</p>
		</header>

		<div class="controls">
		<div class="count-controls">
			<label>
				<span>Stocks:</span>
				<input
					type="number"
					min="1"
					max="20"
					bind:value={count}
					onchange={() => refreshStocks()}
				/>
			</label>
			<div class="presets">
				{#each PRESETS as preset}
					<button
						class="preset"
						class:active={count === preset}
						onclick={() => setCount(preset)}
					>
						{preset}
					</button>
				{/each}
			</div>
		</div>
		{#if isPolling}
			<button class="status status-loading" onclick={stopPolling}><span class="spinner"></span> Stop (#{pollCount})</button>
		{:else}
			<button class="status status-success" onclick={startPolling}>▶ Start</button>
		{/if}
		<button class="status status-pending" onclick={manualRefresh}>↻ Manual</button>
	</div>

	<div class="polling-grid">
		<section class="poll-card">
			<h2>Current Polling Status</h2>
			<div class="status-display">
				{#if pollingResource.loading}
					<div class="status-value loading">Fetching...</div>
				{:else if pollingResource.ready}
					<div class="status-value">{pollingResource.current.status}</div>
					<div class="counter">Counter: {pollingResource.current.counter}</div>
				{/if}
			</div>
		</section>

		<section class="poll-card">
			<h2>then: Derived Status</h2>
			<div class="status-display">
				{#if pollingStatus.loading}
					<div class="status-value loading">...</div>
				{:else if pollingStatus.ready}
					<div class="status-value derived">{pollingStatus.current}</div>
				{/if}
			</div>
		</section>

		<section class="poll-card wide">
			<h2>reduce: Total Portfolio Value</h2>
			<div class="portfolio-value">
				{#if totalValue.loading}
					<span class="loading">Calculating...</span>
				{:else if totalValue.ready}
					<span class="value">${totalValue.current?.toFixed(2)}</span>
				{/if}
			</div>
			<div class="stocks-grid">
				{#each stockResources as stock, i}
					<div class="stock-card" class:ready={stock.ready} class:loading={stock.loading}>
						<div class="symbol">{symbols[i]}</div>
						{#if stock.ready}
							<div class="price">${stock.current.price}</div>
							<div class="change" class:positive={stock.current.change > 0} class:negative={stock.current.change < 0}>
								{stock.current.change > 0 ? '+' : ''}{stock.current.change}%
							</div>
						{:else}
							<div class="price">--</div>
							<div class="change">--</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<section class="poll-card">
			<h2>reduce: Average Change</h2>
			<div class="avg-change" class:positive={avgChange.current && avgChange.current > 0} class:negative={avgChange.current && avgChange.current < 0}>
				{#if avgChange.loading}
					<span class="loading">...</span>
				{:else if avgChange.ready}
					{avgChange.current && avgChange.current > 0 ? '+' : ''}{(avgChange.current ?? 0 / 5).toFixed(2)}%
				{/if}
			</div>
		</section>

		<section class="poll-card">
			<h2>all: Stocks Ready State</h2>
			<div class="ready-state">
				{#if allStocksReady.loading}
					<div class="loading-indicator">
						<span class="spinner"></span>
						Loading...
					</div>
				{:else if allStocksReady.ready}
					<div class="ready-indicator">✓ All Ready</div>
				{/if}
			</div>
		</section>

		<section class="poll-card wide">
			<h2>Polling History (last 20)</h2>
			<div class="history-grid">
				{#each history as entry}
					<div class="history-item">
						<span class="history-status" class:active={entry.status === 'active'} class:idle={entry.status === 'idle'} class:processing={entry.status === 'processing'}>
							{entry.status}
						</span>
						<span class="history-counter">{entry.counter}</span>
					</div>
				{/each}
				{#if history.length === 0}
					<div class="empty">Start polling to see history</div>
				{/if}
			</div>
		</section>
		</div>
	</div>
</PageBoundary>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
		margin: 1.5rem 0;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: var(--border-radius);
		border: 1px solid var(--border-color);
	}

	.count-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.count-controls label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.count-controls input {
		width: 60px;
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 0.9rem;
	}

	.count-controls input:focus {
		outline: none;
		border-color: var(--accent-primary);
	}

	.presets {
		display: flex;
		gap: 0.25rem;
	}

	.preset {
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--bg-tertiary);
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-family: var(--font-mono);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.preset:hover {
		background: var(--bg-hover);
		border-color: var(--accent-primary);
	}

	.preset.active {
		background: var(--accent-primary);
		color: var(--bg-primary);
		border-color: var(--accent-primary);
	}

	.polling-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.poll-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		padding: 1.5rem;
	}

	.poll-card.wide {
		grid-column: 1 / -1;
	}

	.poll-card h2 {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin-bottom: 1rem;
		font-family: var(--font-mono);
	}

	.status-display {
		text-align: center;
	}

	.status-value {
		font-size: 2rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--accent-primary);
	}

	.status-value.loading {
		color: var(--text-muted);
		font-size: 1.5rem;
	}

	.status-value.derived {
		color: var(--accent-secondary);
	}

	.counter {
		color: var(--text-muted);
		font-family: var(--font-mono);
		margin-top: 0.5rem;
	}

	.portfolio-value {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.portfolio-value .value {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--accent-primary);
	}

	.portfolio-value .loading {
		color: var(--text-muted);
	}

	.stocks-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.stock-card {
		background: var(--bg-tertiary);
		padding: 0.6rem 0.8rem;
		border-radius: 6px;
		text-align: center;
		transition: opacity 0.2s;
		min-width: 70px;
	}

	.stock-card.loading {
		opacity: 0.5;
	}

	.stock-card .symbol {
		font-weight: 600;
		font-size: 0.8rem;
		margin-bottom: 0.25rem;
	}

	.stock-card .price {
		font-family: var(--font-mono);
		font-size: 0.9rem;
	}

	.stock-card .change {
		font-size: 0.7rem;
		margin-top: 0.15rem;
	}

	.stock-card .change.positive {
		color: var(--accent-primary);
	}

	.stock-card .change.negative {
		color: var(--accent-tertiary);
	}

	.avg-change {
		font-size: 2rem;
		font-weight: 700;
		text-align: center;
	}

	.avg-change.positive {
		color: var(--accent-primary);
	}

	.avg-change.negative {
		color: var(--accent-tertiary);
	}

	.ready-state {
		text-align: center;
		padding: 1rem;
	}

	.loading-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: var(--text-muted);
	}

	.ready-indicator {
		font-size: 1.5rem;
		color: var(--accent-primary);
		font-weight: 600;
	}

	.history-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.history-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--bg-tertiary);
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		min-width: 70px;
	}

	.history-status {
		font-size: 0.7rem;
		text-transform: uppercase;
		font-weight: 600;
	}

	.history-status.active {
		color: var(--accent-primary);
	}

	.history-status.idle {
		color: var(--text-muted);
	}

	.history-status.processing {
		color: var(--accent-secondary);
	}

	.history-counter {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.empty {
		color: var(--text-muted);
		font-style: italic;
	}

	.error-boundary {
		padding: 2rem;
		background: rgba(255, 107, 107, 0.1);
		border: 1px solid var(--error-color);
		border-radius: var(--border-radius);
		margin-top: 1.5rem;
	}

	.error-boundary p {
		color: var(--error-color);
		margin-bottom: 1rem;
	}

	.error-boundary pre {
		background: var(--bg-tertiary);
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		margin-bottom: 1rem;
		font-size: 0.85rem;
	}
</style>

