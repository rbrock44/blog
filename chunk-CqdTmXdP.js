import{E as Xu,F as fC,I as g,J as um,P as em,a as AT,c as FE,d as I_,f as Ju,j as _I,y as Qg}from"./main-3KNA2PWD.js";import{t as g$1}from"./chunk-C4R55sfY.js";var e={title:`About`,description:`Ryan Brock builds small, useful web applications and writes about how they were put together.`,html:`<p>I build small, useful web applications and then write about how they were put together.</p>
<p>Most of what I make ends up on a subdomain of <code>ryan-brock.com</code> \u2014 recipe collections,
puzzle implementations, scorekeeping tools, a woodworking gallery, a handful of utilities.
Almost all of it is Angular on the front end, deployed to GitHub Pages, with a Kotlin and
Spring Boot API behind the pieces that need one.</p>
<p>This blog is where the reasoning goes. The finished projects show what got built; the
posts cover why a particular approach won, what the tradeoffs actually were, and which
parts turned out to be harder than they looked.</p>
<h2>Elsewhere</h2>
<ul>
<li><a href="https://directory.ryan-brock.com/">Every project I&#39;ve published</a></li>
<li><a href="https://github.com/rbrock44">GitHub</a></li>
<li><a href="https://www.linkedin.com/in/ryan-brock-4b8123262/">LinkedIn</a></li>
<li><a href="/rss.xml">RSS feed</a></li>
</ul>
`};var f=class i{title=e.title;body=g(I_).bypassSecurityTrustHtml(e.html);constructor(){g(g$1).setPage(e.title,e.description,`/about`)}static ɵfac=function(t){return new(t||i)};static ɵcmp=fC({type:i,selectors:[[`app-about`]],decls:3,vars:2,consts:[[1,`post-body`,3,`innerHTML`]],template:function(t,a){t&1&&(Xu(0,`h1`),AT(1),Ju(),Qg(2,`div`,0)),t&2&&(_I(),um(a.title),_I(),em(`innerHTML`,a.body,FE))},encapsulation:2})};export{f as About};