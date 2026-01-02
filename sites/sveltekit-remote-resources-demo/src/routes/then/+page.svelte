<script lang="ts">
	import { derive } from '$lib/RemoteResource.svelte'
	import { getUsers } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="derive()">
	{@const users = getUsers()}
	{@const userNames = derive(users, users => users.map(u => u.name))}
	{@const userCount = derive(users, users => users.length)}
	{@const firstUser = derive(users, users => users[0])}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">derive()</h1>
			<p class="page-description">
				Transforms the value of a RemoteResource when it becomes ready.
				Equivalent to <code>Promise.prototype.then</code>.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
				<pre><code>{`import { derive } from '$lib/RemoteResource.svelte'

const users = getUsers()
const userNames = derive(users, users => users.map(u => u.name))
const userCount = derive(users, users => users.length)
const firstUser = derive(users, users => users[0])`}</code></pre>
			</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if userNames.loading}
					<button class="status status-loading" onclick={() => users.refresh()}><span class="spinner"></span> Loading</button>
				{:else}
					<button class="status status-success" onclick={() => users.refresh()}>↻ Refresh</button>
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

						<h4 class="subsection-title spaced">User Names</h4>
						<div class="item-list">
							{#each userNames.current ?? [] as name, i}
								<div class="item">
									<div class="item-icon primary">
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
</PageBoundary>
