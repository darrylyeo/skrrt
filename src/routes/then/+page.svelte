<script lang="ts">
	import { then } from '$lib/RemoteResource.svelte'
	import { getUsers } from '../demo.remote'

	const users = getUsers()
	const userNames = then(users, users => users.map(u => u.name))
	const userCount = then(users, users => users.length)
	const firstUser = then(users, users => users[0])

	const refresh = () => users.refresh()
</script>

<svelte:boundary>
	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">then()</h1>
			<p class="page-description">
				Transforms the value of a RemoteResource when it becomes ready.
				Equivalent to <code>Promise.prototype.then</code>.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { then } from '$lib/RemoteResource.svelte'

const users = getUsers()
const userNames = then(users, users => users.map(u => u.name))
const userCount = then(users, users => users.length)
const firstUser = then(users, users => users[0])`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if userNames.loading}
					<button class="status status-loading" onclick={refresh}><span class="spinner"></span> Loading</button>
				{:else}
					<button class="status status-success" onclick={refresh}>↻ Refresh</button>
				{/if}
			</div>

			<div class="demo-box">
				{#if userNames.ready}
					<div class="fade-in">
						<div class="stats-grid">
							<div class="stat">
								<div class="stat-value">{userCount.current}</div>
								<div class="stat-label">Total Users</div>
							</div>
							<div class="stat">
								<div class="stat-value">{firstUser.current?.name}</div>
								<div class="stat-label">First User</div>
							</div>
						</div>

						<h4 style="margin: 1.5rem 0 1rem; color: var(--text-secondary);">User Names</h4>
						<div class="item-list">
							{#each userNames.current ?? [] as name, i}
								<div class="item">
									<div class="item-icon" style="background: var(--accent-primary); color: var(--bg-primary);">
										{i + 1}
									</div>
									<div class="item-content">
										<div class="item-title">{name}</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<p class="loading">Loading users...</p>
				{/if}
			</div>
		</section>
	</div>

	{#snippet failed(error, retry)}
		<div class="page">
			<a href="/" class="page-back">← Back to Home</a>
			<h1 class="page-title">then()</h1>
			<div class="demo-box">
				<p class="error">Error: {error instanceof Error ? error.message : String(error)}</p>
				<button class="btn" onclick={retry}>↻ Retry</button>
			</div>
		</div>
	{/snippet}
</svelte:boundary>
