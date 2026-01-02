<script lang="ts">
	import { map, reduce, derive } from '$lib/RemoteResource.svelte'
	import {
		getRandomNumberById,
		getFlakyData,
		getUser,
		getPosts,
		getPrice
	} from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'

	const PRESETS = [10, 50, 100, 250, 500, 1000]

	let count = $state(10)
	let refreshKey = $state(0)

	type TableRow = {
		id: number
		user: ReturnType<typeof getUser>
		userName: ReturnType<typeof then<Awaited<ReturnType<typeof getUser>>, string>>
		posts: ReturnType<typeof getPosts>
		postCount: ReturnType<typeof then<Awaited<ReturnType<typeof getPosts>>, number>>
		price: ReturnType<typeof getPrice>
		priceFormatted: ReturnType<typeof then<number, string>>
		score: ReturnType<typeof getRandomNumberById>
		status: ReturnType<typeof getFlakyData>
	}

	// Create a single row - called in staggered batches to avoid SvelteKit query batching
	const createRow = (id: number, key: number): TableRow => {
		const uniqueId = key * 10000 + id
		const user = getUser(((id - 1) % 10) + 1)
		const posts = getPosts(uniqueId)
		const price = getPrice(uniqueId)
		const score = getRandomNumberById(uniqueId)
		const status = getFlakyData(uniqueId)

		return {
			id,
			user,
			userName: derive(user, u => u.name),
			posts,
			postCount: derive(posts, p => p.length),
			price,
			priceFormatted: derive(price, p => `$${p.toFixed(2)}`),
			score,
			status
		}
	}

	// Stagger row creation across macrotasks to prevent SvelteKit from batching all queries together
	// This demonstrates true parallel streaming where each row's queries are independent
	const createTableRowsStaggered = (n: number, key: number) => {
		// Clear existing rows
		tableRows = []

		// Batch size - how many rows to create per macrotask
		// Smaller = more visible streaming, larger = faster total completion
		const batchSize = Math.max(1, Math.ceil(n / 20)) // ~20 batches

		let created = 0
		const createBatch = () => {
			const end = Math.min(created + batchSize, n)
			for (let i = created; i < end; i++) {
				tableRows.push(createRow(i + 1, key))
			}
			// Force Svelte to see the mutation
			tableRows = tableRows
			created = end
			if (created < n) {
				setTimeout(createBatch, 0) // Next macrotask = new batch
			}
		}
		createBatch()
	}

	let tableRows = $state<TableRow[]>([])

	// Sorting state
	type SortColumn = 'id' | 'user' | 'posts' | 'price' | 'score' | 'status'
	type SortDirection = 'asc' | 'desc'
	let sortColumn = $state<SortColumn>('id')
	let sortDirection = $state<SortDirection>('asc')

	const toggleSort = (column: SortColumn) => {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
		} else {
			sortColumn = column
			sortDirection = 'asc'
		}
	}

	// Sort rows based on current column - uses current values, falls back for loading cells
	const sortedRows = $derived(
		[...tableRows].sort((a, b) => {
			const dir = sortDirection === 'asc' ? 1 : -1

			switch (sortColumn) {
				case 'id':
					return (a.id - b.id) * dir
				case 'user': {
					const aName = a.userName.ready ? a.userName.current ?? '' : ''
					const bName = b.userName.ready ? b.userName.current ?? '' : ''
					return aName.localeCompare(bName) * dir
				}
				case 'posts': {
					const aCount = a.postCount.ready ? a.postCount.current ?? 0 : 0
					const bCount = b.postCount.ready ? b.postCount.current ?? 0 : 0
					return (aCount - bCount) * dir
				}
				case 'price': {
					const aPrice = a.price.ready ? a.price.current ?? 0 : 0
					const bPrice = b.price.ready ? b.price.current ?? 0 : 0
					return (aPrice - bPrice) * dir
				}
				case 'score': {
					const aScore = a.score.ready ? a.score.current?.value ?? 0 : 0
					const bScore = b.score.ready ? b.score.current?.value ?? 0 : 0
					return (aScore - bScore) * dir
				}
				case 'status': {
					const statusOrder = { fast: 0, normal: 1, slow: 2 }
					const aStatus = a.status.ready ? statusOrder[a.status.current?.status as keyof typeof statusOrder] ?? 3 : a.status.error ? 4 : 3
					const bStatus = b.status.ready ? statusOrder[b.status.current?.status as keyof typeof statusOrder] ?? 3 : b.status.error ? 4 : 3
					return (aStatus - bStatus) * dir
				}
				default:
					return 0
			}
		})
	)

	// Aggregate derived values from the table
	const tableUserNames = $derived(map(tableRows.map(r => r.user), u => u.name))
	const tableTotalPosts = $derived(reduce(tableRows.map(r => r.postCount), (sum, c) => sum + c, 0))
	const tableTotalPrice = $derived(reduce(tableRows.map(r => r.price), (sum, p) => sum + p, 0))
	const tableAvgScore = $derived(
		derive(
			reduce(tableRows.map(r => r.score), (sum, s) => sum + s.value, 0),
			sum => tableRows.length > 0 ? Math.round(sum / tableRows.length) : 0
		)
	)

	// Count ready cells for progress
	const readyCells = $derived(
		tableRows.reduce((acc, row) => {
			if (row.userName.ready) acc++
			if (row.postCount.ready) acc++
			if (row.priceFormatted.ready) acc++
			if (row.score.ready) acc++
			if (row.status.ready || row.status.error) acc++
			return acc
		}, 0)
	)
	const totalCells = $derived(tableRows.length * 5)

	const refresh = () => {
		refreshKey++
		createTableRowsStaggered(count, refreshKey)
	}

	// Initialize on mount
	$effect(() => {
		if (tableRows.length === 0) {
			createTableRowsStaggered(count, refreshKey)
		}
	})

	const setCount = (n: number) => {
		count = n
		refresh()
	}
</script>

<PageBoundary title="Datagrid: Reactive Table">
	<div class="page wide">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">Datagrid: Reactive Table</h1>
			<p class="page-description">
				Each row joins data from multiple independent queries. Cells update reactively as their source resolves.
				This demonstrates composing helpers like a database join.
			</p>
		</header>

		<div class="controls">
		<div class="count-controls">
			<label>
				<span>Rows:</span>
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
		<div class="progress-info">
			<span class="progress-text">{readyCells}/{totalCells} cells</span>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {(readyCells / totalCells) * 100}%"></div>
			</div>
		</div>
		{#if readyCells < totalCells}
			<button class="status status-loading" onclick={refresh}><span class="spinner"></span> #{refreshKey}</button>
		{:else}
			<button class="status status-success" onclick={refresh}>↻ #{refreshKey}</button>
		{/if}
	</div>

	<div class="table-aggregates">
		<div class="aggregate">
			<span class="label">Names</span>
			<span class="value" class:loading={tableUserNames.loading}>
				{#if tableUserNames.ready}
					{tableUserNames.current?.slice(0, 5).join(', ')}{tableUserNames.current && tableUserNames.current.length > 5 ? '...' : ''}
				{:else}
					...
				{/if}
			</span>
		</div>
		<div class="aggregate">
			<span class="label">Total Posts</span>
			<span class="value" class:loading={tableTotalPosts.loading}>
				{#if tableTotalPosts.ready}{tableTotalPosts.current}{:else}...{/if}
			</span>
		</div>
		<div class="aggregate">
			<span class="label">Total Price</span>
			<span class="value" class:loading={tableTotalPrice.loading}>
				{#if tableTotalPrice.ready}${tableTotalPrice.current?.toFixed(2)}{:else}...{/if}
			</span>
		</div>
		<div class="aggregate">
			<span class="label">Avg Score</span>
			<span class="value" class:loading={tableAvgScore.loading}>
				{#if tableAvgScore.ready}{tableAvgScore.current}{:else}...{/if}
			</span>
		</div>
	</div>

	<div class="pipeline-table-wrapper">
		<table class="pipeline-table">
			<thead>
				<tr>
					<th class="sortable" class:sorted={sortColumn === 'id'} onclick={() => toggleSort('id')}>
						ID {#if sortColumn === 'id'}<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>{/if}
					</th>
					<th class="sortable" class:sorted={sortColumn === 'user'} onclick={() => toggleSort('user')}>
						User {#if sortColumn === 'user'}<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>{/if}
					</th>
					<th class="sortable" class:sorted={sortColumn === 'posts'} onclick={() => toggleSort('posts')}>
						Posts {#if sortColumn === 'posts'}<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>{/if}
					</th>
					<th class="sortable" class:sorted={sortColumn === 'price'} onclick={() => toggleSort('price')}>
						Price {#if sortColumn === 'price'}<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>{/if}
					</th>
					<th class="sortable" class:sorted={sortColumn === 'score'} onclick={() => toggleSort('score')}>
						Score {#if sortColumn === 'score'}<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>{/if}
					</th>
					<th class="sortable" class:sorted={sortColumn === 'status'} onclick={() => toggleSort('status')}>
						Status {#if sortColumn === 'status'}<span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>{/if}
					</th>
				</tr>
			</thead>
			<tbody>
				{#each sortedRows as row}
					<tr>
						<td class="id-cell">{row.id}</td>
						<td class="cell" class:ready={row.userName.ready} class:loading={row.user.loading} class:error={row.user.error}>
							{#if row.userName.ready}
								<span class="user-name">{row.userName.current}</span>
								<span class="user-active" class:active={row.user.current?.active}>{row.user.current?.active ? '●' : '○'}</span>
							{:else if row.user.error}
								<span class="error-text">err</span>
							{:else}
								<span class="loading-text">...</span>
							{/if}
						</td>
						<td class="cell" class:ready={row.postCount.ready} class:loading={row.posts.loading}>
							{#if row.postCount.ready}
								<span class="post-count">{row.postCount.current}</span>
							{:else}
								<span class="loading-text">...</span>
							{/if}
						</td>
						<td class="cell" class:ready={row.priceFormatted.ready} class:loading={row.price.loading}>
							{#if row.priceFormatted.ready}
								<span class="price">{row.priceFormatted.current}</span>
							{:else}
								<span class="loading-text">...</span>
							{/if}
						</td>
						<td class="cell" class:ready={row.score.ready} class:loading={row.score.loading}>
							{#if row.score.ready}
								<span class="score">{row.score.current.value}</span>
							{:else}
								<span class="loading-text">...</span>
							{/if}
						</td>
						<td class="cell" class:ready={row.status.ready} class:loading={row.status.loading} class:error={row.status.error}>
							{#if row.status.ready}
								<span class="status-badge" class:fast={row.status.current.status === 'fast'} class:normal={row.status.current.status === 'normal'} class:slow={row.status.current.status === 'slow'}>
									{row.status.current.status}
								</span>
							{:else if row.status.error}
								<span class="status-badge error">fail</span>
							{:else}
								<span class="loading-text">...</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
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

	.progress-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.progress-text {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.progress-bar {
		width: 100px;
		height: 6px;
		background: var(--bg-tertiary);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent-primary);
		transition: width 0.2s;
	}

	.table-aggregates {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}

	.aggregate {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.aggregate .label {
		font-size: 0.75rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.aggregate .value {
		font-family: var(--font-mono);
		font-size: 0.9rem;
		color: var(--accent-primary);
	}

	.aggregate .value.loading {
		color: var(--text-muted);
	}

	.pipeline-table-wrapper {
		overflow-x: auto;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius);
	}

	.pipeline-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	.pipeline-table th {
		text-align: left;
		padding: 0.75rem 0.5rem;
		border-bottom: 2px solid var(--border-color);
		color: var(--text-muted);
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		position: sticky;
		top: 0;
		background: var(--bg-secondary);
	}

	.pipeline-table th.sortable {
		cursor: pointer;
		user-select: none;
		transition: color var(--transition-fast);
	}

	.pipeline-table th.sortable:hover {
		color: var(--accent-primary);
	}

	.pipeline-table th.sorted {
		color: var(--accent-primary);
	}

	.sort-indicator {
		margin-left: 0.25rem;
		font-size: 0.7rem;
	}

	.pipeline-table td {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.pipeline-table tr:last-child td {
		border-bottom: none;
	}

	.id-cell {
		font-family: var(--font-mono);
		color: var(--text-muted);
		width: 40px;
	}

	.cell {
		transition: background 0.2s;
	}

	.cell.loading {
		background: rgba(123, 97, 255, 0.1);
	}

	.cell.ready {
		background: rgba(0, 212, 170, 0.05);
	}

	.cell.error {
		background: rgba(255, 107, 107, 0.1);
	}

	.loading-text {
		color: var(--text-muted);
		font-style: italic;
	}

	.error-text {
		color: var(--accent-tertiary);
		font-size: 0.75rem;
	}

	.user-name {
		font-weight: 500;
	}

	.user-active {
		margin-left: 0.25rem;
		font-size: 0.7rem;
	}

	.user-active.active {
		color: var(--accent-primary);
	}

	.post-count {
		font-family: var(--font-mono);
	}

	.price {
		font-family: var(--font-mono);
		color: var(--accent-primary);
	}

	.score {
		font-family: var(--font-mono);
	}

	.status-badge {
		display: inline-block;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.status-badge.fast {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.status-badge.normal {
		background: var(--accent-secondary);
		color: white;
	}

	.status-badge.slow {
		background: var(--accent-warning);
		color: var(--bg-primary);
	}

	.status-badge.error {
		background: var(--accent-tertiary);
		color: white;
	}
</style>

