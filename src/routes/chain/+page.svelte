<script lang="ts">
	import { chain, derive } from '$lib/RemoteResource.svelte'
	import { getUsers, getPosts } from '../demo.remote'
	import PageBoundary from '$lib/components/PageBoundary.svelte'
</script>

<PageBoundary title="chain()">
	{@const users = getUsers()}
	{@const firstUser = derive(users, users => users[0])}
	{@const firstUserPosts = chain(users, users => getPosts(users[0].id))}
	{@const secondUserPosts = chain(users, users => getPosts(users[1]?.id ?? 1))}

	<div class="page">
		<a href="/" class="page-back">← Back to Home</a>

		<header class="page-header">
			<h1 class="page-title">chain()</h1>
			<p class="page-description">
				Chains multiple RemoteResource transformations, where each step depends on the previous result.
				Also known as bind/flatMap in monadic terms.
			</p>
		</header>

		<section class="section">
			<h2>Usage</h2>
			<div class="code-block">
			<pre><code>{`import { chain } from '$lib/RemoteResource.svelte'

// First get users, then get posts for the first user
const firstUserPosts = chain(
  getUsers(),
  users => getPosts(users[0].id)
)
// Automatically chains: users are fetched first,
// then posts are fetched using the first user's ID`}</code></pre>
		</div>
		</section>

		<section class="section">
			<div class="section-header">
				<h2>Result</h2>
				{#if firstUserPosts.loading}
					<button class="status status-loading" onclick={() => users.refresh()}><span class="spinner"></span> Chaining...</button>
				{:else}
					<button class="status status-success" onclick={() => users.refresh()}>↻ Refresh</button>
				{/if}
			</div>

			<div class="demo-box">
				<div class="comparison mb-lg">
					<div class="comparison-item">
						<div class="comparison-label">Step 1: Users</div>
						<div class="data-grid">
							<div class="data-row">
								<span class="data-label">ready</span>
								<span class="data-value">{users.ready}</span>
							</div>
							<div class="data-row">
								<span class="data-label">loading</span>
								<span class="data-value">{users.loading}</span>
							</div>
							<div class="data-row">
								<span class="data-label">count</span>
								<span class="data-value">{users.current?.length ?? '...'}</span>
							</div>
						</div>
					</div>

					<div class="comparison-item">
						<div class="comparison-label">Step 2: Posts (chained)</div>
						<div class="data-grid">
							<div class="data-row">
								<span class="data-label">ready</span>
								<span class="data-value">{firstUserPosts.ready}</span>
							</div>
							<div class="data-row">
								<span class="data-label">loading</span>
								<span class="data-value">{firstUserPosts.loading}</span>
							</div>
							<div class="data-row">
								<span class="data-label">count</span>
								<span class="data-value">{firstUserPosts.current?.length ?? '...'}</span>
							</div>
						</div>
					</div>
				</div>

				{#if firstUser.ready && firstUserPosts.ready}
					<div class="fade-in">
						<h4 class="subsection-title">
							Posts by {firstUser.current?.name} (User ID: {firstUser.current?.id})
						</h4>
						{#if firstUserPosts.current?.length === 0}
							<div class="item text-muted">
								No posts found
							</div>
						{:else}
							<div class="item-list">
								{#each firstUserPosts.current ?? [] as post}
									<div class="item">
										<div class="item-icon secondary">
											📝
										</div>
										<div class="item-content">
											<div class="item-title">{post.title}</div>
											<div class="item-subtitle">Post ID: {post.id}</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}

				{#if users.ready && secondUserPosts.ready}
					<div class="mt-lg">
						<h4 class="subsection-title">
							Posts by {users.current?.[1]?.name} (User ID: {users.current?.[1]?.id})
						</h4>
						{#if secondUserPosts.current?.length === 0}
							<div class="item text-muted">
								No posts found
							</div>
						{:else}
							<div class="item-list">
								{#each secondUserPosts.current ?? [] as post}
									<div class="item">
										<div class="item-icon tertiary">
											📝
										</div>
										<div class="item-content">
											<div class="item-title">{post.title}</div>
											<div class="item-subtitle">Post ID: {post.id}</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>
	</div>
</PageBoundary>
