<script lang="ts">
	import { all, race, map, filter, reduce, catchError, allSettled } from '$lib/RemoteResource.svelte'
	import {
		getRandomNumberById,
		getFlakyData,
		getRandomStock
	} from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'

	const PRESETS = [10, 50, 100, 250, 500, 1000]

	// Generate stock symbols dynamically for any count
	const generateSymbol = (i: number): string => {
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		if (i < 26) return letters[i] + 'X'
		if (i < 676) return letters[Math.floor(i / 26)] + letters[i % 26]
		return letters[Math.floor(i / 676) % 26] + letters[Math.floor(i / 26) % 26] + letters[i % 26]
	}

	let count = $state(10)
	let refreshKey = $state(0)

	const createResources = (n: number) => {
		const numbers = Array.from({ length: n }, (_, i) => getRandomNumberById(i + 1))
		const flaky = Array.from({ length: n }, (_, i) => getFlakyData(i + 1))
		const stocks = Array.from({ length: n }, (_, i) => getRandomStock(generateSymbol(i)))
		return { numbers, flaky, stocks }
	}

	let resources = $state(createResources(10))

	// Derived resources using helpers
	const numbersSum = $derived(
		reduce(resources.numbers, (sum, n) => sum + n.value, 0)
	)

	const stocksTotal = $derived(
		reduce(resources.stocks, (sum, s) => sum + s.price, 0)
	)

	const positiveStocks = $derived(
		filter(resources.stocks, s => s.change > 0)
	)

	const flakyResults = $derived(
		allSettled(resources.flaky)
	)

	const fastestFlaky = $derived(
		race(resources.flaky)
	)

	const allNumbers = $derived(
		all(resources.numbers)
	)

	const safeFlakyData = $derived(
		resources.flaky.map(f => catchError(f, () => ({ id: -1, status: 'error', value: 0 })))
	)

	const mappedNumbers = $derived(
		map(resources.numbers, n => n.value * 2)
	)

	const refresh = () => {
		refreshKey++
		resources = createResources(count)
	}

	const setCount = (n: number) => {
		count = n
		refresh()
	}
</script>

<PageBoundary title="Chaos: Stress Testing">
	<div class="page wide">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">Chaos: Stress Testing</h1>
			<p class="page-description">
				Test helpers with queries that return randomized values.
				Adjust the item count to stress test with more resources.
			</p>
		</header>

		<div class="controls">
		<div class="count-controls">
			<label>
				<span>Items:</span>
				<input
					type="number"
					min="1"
					max="1000"
					bind:value={count}
					onchange={refresh}
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
		{#if numbersSum.loading}
			<button class="status status-loading" onclick={refresh}><span class="spinner"></span> #{refreshKey} ({count})</button>
		{:else}
			<button class="status status-success" onclick={refresh}>↻ #{refreshKey} ({count})</button>
		{/if}
	</div>

	<div class="stress-grid">
		<section class="stress-card">
			<h2>reduce: Sum of Random Numbers</h2>
			<div class="result">
				{#if numbersSum.loading}
					<span class="loading">Calculating...</span>
				{:else if numbersSum.ready}
					<span class="value">{numbersSum.current}</span>
				{/if}
			</div>
			<div class="details">
				<h4>Individual Values:</h4>
				<div class="values-row">
					{#each resources.numbers as n, i}
						<div class="value-cell" class:ready={n.ready} class:loading={n.loading}>
							{#if n.ready}{n.current.value}{:else}...{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section class="stress-card">
			<h2>map: Doubled Values</h2>
			<div class="result">
				{#if mappedNumbers.loading}
					<span class="loading">Mapping...</span>
				{/if}
			</div>
			<div class="details">
				<div class="values-row">
					{#each mappedNumbers.current ?? [] as val}
						<div class="value-cell ready">{val}</div>
					{/each}
				</div>
			</div>
		</section>

		<section class="stress-card">
			<h2>filter: Positive Stock Changes</h2>
			<div class="result">
				{#if positiveStocks.loading}
					<span class="loading">Filtering...</span>
				{/if}
			</div>
			<div class="details">
				<div class="stocks-grid">
					{#each positiveStocks.current ?? [] as stock}
						<div class="stock-chip positive">
							<span class="symbol">{stock.symbol}</span>
							<span class="change">+{stock.change.toFixed(1)}%</span>
						</div>
					{/each}
				</div>
				{#if positiveStocks.ready && (positiveStocks.current?.length ?? 0) === 0}
					<div class="empty">No positive changes this round</div>
				{/if}
			</div>
		</section>

		<section class="stress-card">
			<h2>reduce: Total Stock Value</h2>
			<div class="result">
				{#if stocksTotal.loading}
					<span class="loading">Summing...</span>
				{:else if stocksTotal.ready}
					<span class="value">${stocksTotal.current?.toFixed(2)}</span>
				{/if}
			</div>
			<div class="details">
				<div class="stocks-grid">
					{#each resources.stocks as stock}
						<div class="stock-chip" class:ready={stock.ready}>
							{#if stock.ready}
								<span class="symbol">{stock.current.symbol}</span>
								<span class="price">${stock.current.price.toFixed(0)}</span>
							{:else}
								<span class="loading-small">...</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section class="stress-card">
			<h2>race: Fastest Flaky Response</h2>
			<div class="result">
				{#if fastestFlaky.loading}
					<span class="loading">Racing...</span>
				{:else if fastestFlaky.ready}
					<span class="value">ID {fastestFlaky.current?.id}: {fastestFlaky.current?.status}</span>
				{:else if fastestFlaky.error}
					<span class="error">First to fail: {fastestFlaky.error}</span>
				{/if}
			</div>
		</section>

		<section class="stress-card">
			<h2>all: Wait for All Numbers</h2>
			<div class="result">
				{#if allNumbers.loading}
					<span class="loading">Waiting for all...</span>
				{:else if allNumbers.ready}
					<span class="value">All ready!</span>
				{:else if allNumbers.error}
					<span class="error">Failed: {allNumbers.error}</span>
				{/if}
			</div>
			<div class="details">
				<div class="progress-bar">
					{#each resources.numbers as n}
						<div class="progress-segment" class:done={n.ready}></div>
					{/each}
				</div>
			</div>
		</section>

		<section class="stress-card wide">
			<h2>allSettled: Flaky Results Summary</h2>
			<div class="result">
				{#if flakyResults.loading}
					<span class="loading">Settling...</span>
				{:else if flakyResults.ready}
					<span class="value">
						{flakyResults.current?.filter(r => r.ready).length} succeeded,
						{flakyResults.current?.filter(r => !r.ready).length} failed
					</span>
				{/if}
			</div>
			<div class="details">
				<div class="settled-grid">
					{#each flakyResults.current ?? [] as result, i}
						<div class="settled-item" class:success={result.ready} class:failure={!result.ready}>
							<span class="id">#{i + 1}</span>
							{#if result.ready}
								<span class="status">{result.current.status}</span>
							{:else}
								<span class="status">error</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section class="stress-card wide">
			<h2>catchError: Safe Flaky Data</h2>
			<div class="details">
				<div class="safe-grid">
					{#each safeFlakyData as data, i}
						<div class="safe-item" class:ready={data.ready} class:error={data.current?.id === -1}>
							{#if data.ready}
								{#if data.current.id === -1}
									<span class="recovered">Recovered</span>
								{:else}
									<span class="ok">ID: {data.current.id}</span>
								{/if}
							{:else}
								<span class="pending">...</span>
							{/if}
						</div>
					{/each}
				</div>
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
		width: 70px;
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
		padding: 0.4rem 0.75rem;
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

	.stress-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	.stress-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
		padding: 1.5rem;
	}

	.stress-card.wide {
		grid-column: 1 / -1;
	}

	.stress-card h2 {
		font-size: 1rem;
		color: var(--text-secondary);
		margin-bottom: 1rem;
		font-family: var(--font-mono);
	}

	.result {
		margin-bottom: 1rem;
	}

	.result .value {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--accent-primary);
	}

	.result .loading {
		color: var(--text-muted);
		font-style: italic;
	}

	.result .error {
		color: var(--accent-tertiary);
	}

	.details h4 {
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-bottom: 0.5rem;
	}

	.values-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.value-cell {
		background: var(--bg-tertiary);
		padding: 0.4rem 0.6rem;
		border-radius: 6px;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		min-width: 40px;
		text-align: center;
	}

	.value-cell.ready {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.value-cell.loading {
		opacity: 0.5;
	}

	.empty {
		color: var(--text-muted);
		font-style: italic;
		padding: 0.5rem;
	}

	.loading-small {
		color: var(--text-muted);
	}

	.stocks-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.stock-chip {
		display: flex;
		gap: 0.4rem;
		align-items: center;
		background: var(--bg-tertiary);
		padding: 0.3rem 0.6rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.stock-chip.ready {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.stock-chip .symbol {
		font-weight: 600;
	}

	.stock-chip .price {
		font-family: var(--font-mono);
		opacity: 0.8;
	}

	.stock-chip.positive {
		background: rgba(0, 212, 170, 0.2);
		border: 1px solid var(--accent-primary);
		color: var(--accent-primary);
	}

	.stock-chip .change {
		font-family: var(--font-mono);
	}

	.progress-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}

	.progress-segment {
		width: 12px;
		height: 12px;
		background: var(--bg-tertiary);
		border-radius: 3px;
		transition: background 0.2s;
	}

	.progress-segment.done {
		background: var(--accent-primary);
	}

	.settled-grid {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.settled-item {
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		display: flex;
		gap: 0.35rem;
		align-items: center;
		font-size: 0.75rem;
	}

	.settled-item.success {
		background: rgba(0, 212, 170, 0.2);
		border: 1px solid var(--accent-primary);
	}

	.settled-item.failure {
		background: rgba(255, 107, 107, 0.2);
		border: 1px solid var(--accent-tertiary);
	}

	.settled-item .id {
		font-weight: 600;
	}

	.safe-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.safe-item {
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		background: var(--bg-tertiary);
		min-width: 60px;
		text-align: center;
		font-size: 0.8rem;
	}

	.safe-item.error {
		background: rgba(255, 107, 107, 0.2);
	}

	.safe-item .recovered {
		color: var(--accent-warning);
	}

	.safe-item .ok {
		color: var(--accent-primary);
	}

	.safe-item .pending {
		color: var(--text-muted);
	}
</style>

