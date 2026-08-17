var i=`<p>Every other thing I&#39;ve built lives at some <code>*.ryan-brock.com</code> subdomain, deployed to GitHub
Pages out of an Angular repo. This one is no different, with one addition that matters more
than it sounds: every route here is prerendered to real HTML at build time.</p>
<h2>The problem with a plain SPA blog</h2>
<p>A client-rendered single-page app ships an empty <code>&lt;div&gt;</code> and fills it in with JavaScript.
Google will eventually run that JavaScript. The bots that generate link previews \u2014 Slack,
LinkedIn, Discord, iMessage \u2014 will not.</p>
<p>So on a normal Angular SPA, every post I share produces the same blank preview card. For a
format whose entire distribution model is <em>someone shares a link</em>, that&#39;s the whole game.</p>
<h2>What fixes it</h2>
<p>Angular&#39;s static output mode prerenders each route to its own <code>index.html</code>, then hydrates
into a normal SPA once loaded:</p>
<pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">  "outputMode"</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">"static"</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">  "server"</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF">"src/main.server.ts"</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">}</span></span></code></pre><p>Posts are markdown files in this repo. A build script parses the frontmatter, renders the
body, and splits each post&#39;s HTML into its own lazy chunk so the index stays small:</p>
<pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0"> matter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(raw);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF"> html</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8"> marked.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0">parse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8">(content);</span></span></code></pre><p>The nice side effect is that prerendered routes produce real file paths on disk, so GitHub
Pages serves deep links natively \u2014 no <code>404.html</code> redirect hack needed for anything that
actually exists.</p>
<p>If you&#39;re reading this in view-source with JavaScript disabled, it worked.</p>
`;export{i as default};