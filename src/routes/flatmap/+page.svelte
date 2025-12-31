<script lang="ts">
	import { flatMap } from '$lib/RemoteResource.svelte'
	import { getUser } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="flatMap()">
	{@const users = [1, 2, 3].map(id => getUser(id))}
	{@const allTags = flatMap(users, user => {
		const baseTags = [user.name.toLowerCase(), user.active ? 'active' : 'inactive']
		if (user.id === 1) baseTags.push('admin', 'verified')
		if (user.id === 2) baseTags.push('moderator')
		return baseTags
	})}
	{@const emailParts = flatMap(users, user => user.email.split('@'))}
	{@const userActions = flatMap(users, (user, i) => [
		{ userId: user.id, action: 'view', order: i * 3 },
		{ userId: user.id, action: 'edit', order: i * 3 + 1 },
		{ userId: user.id, action: 'delete', order: i * 3 + 2 }
	])}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">flatMap()</h1>
			<p class="page-description">
				Maps each resolved value to an array, then flattens all results into a single array.
				Like <code>Array#flatMap</code> but for RemoteResources.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { flatMap } from '$lib/RemoteResource.svelte'

const users = [1, 2, 3].map(id => getUser(id))

// Each user produces multiple tags, all flattened into one array
const allTags = flatMap(users, user => [
  user.name.toLowerCase(),
  user.active ? 'active' : 'inactive'
])
// Result: ['alice', 'active', 'bob', 'inactive', 'charlie', 'active']`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if allTags.loading}
					<button class="status status-loading" onclick={() => users.forEach(u => u.refresh())}><span class="spinner"></span> Loading...</button>
				{:else}
					<button class="status status-success" onclick={() => users.forEach(u => u.refresh())}>↻ Refresh</button>
				{/if}
			</div>

			<div class="demo-box">
				<h4 style="color: var(--text-secondary); margin-bottom: 0.75rem;">Source Users</h4>
				<div class="source-grid">
					{#each users as user, i}
						<div class="source-item" class:ready={user.ready}>
							{#if user.ready}
								<span class="name">{user.current.name}</span>
								<span class="status-tag" class:active={user.current.active}>
									{user.current.active ? 'active' : 'inactive'}
								</span>
							{:else}
								<span class="loading">Loading user {i + 1}...</span>
							{/if}
						</div>
					{/each}
				</div>

				<h4 style="color: var(--text-secondary); margin: 1.5rem 0 0.75rem;">
					All Tags (flattened from {users.length} users)
				</h4>
				<div class="tags-container">
					{#each allTags.current ?? [] as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>

				<h4 style="color: var(--text-secondary); margin: 1.5rem 0 0.75rem;">
					Email Parts (split and flattened)
				</h4>
				<div class="tags-container">
					{#each emailParts.current ?? [] as part}
						<span class="tag email">{part}</span>
					{/each}
				</div>

				<h4 style="color: var(--text-secondary); margin: 1.5rem 0 0.75rem;">
					User Actions (3 per user, flattened)
				</h4>
				<div class="actions-list">
					{#each userActions.current ?? [] as action}
						<div class="action-item">
							<span class="user-id">User {action.userId}</span>
							<span class="action-type" class:view={action.action === 'view'} class:edit={action.action === 'edit'} class:delete={action.action === 'delete'}>
								{action.action}
							</span>
						</div>
					{/each}
				</div>
			</div>
		</section>
	</div>
</PageBoundary>

<style>
	.source-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.source-item {
		background: var(--bg-tertiary);
		padding: 1rem;
		border-radius: var(--border-radius);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.source-item .name {
		font-weight: 600;
		font-size: 1.1rem;
	}

	.status-tag {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		background: var(--accent-tertiary);
		color: white;
	}

	.status-tag.active {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		background: var(--bg-tertiary);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		border: 1px solid var(--border-color);
	}

	.tag.email {
		background: var(--accent-secondary);
		color: white;
		border-color: transparent;
	}

	.actions-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.action-item {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		background: var(--bg-tertiary);
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
	}

	.user-id {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.action-type {
		font-size: 0.75rem;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		font-weight: 600;
	}

	.action-type.view {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.action-type.edit {
		background: var(--accent-secondary);
		color: white;
	}

	.action-type.delete {
		background: var(--accent-tertiary);
		color: white;
	}
</style>
