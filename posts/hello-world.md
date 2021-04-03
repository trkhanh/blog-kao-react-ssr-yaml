---
title: Hello World!
tags: [React, SSR]
created: 2020-04-03
summary: Brief overview and comparison of various modern approaches of creating websites
---

After writing and then re-writing a blogging engine, I thought I'd finally get round to publishing a blog post.

Depending on your point of view [reinventing the wheel](https://www.gatsbyjs.org) can be a learning experience, or downright stupid. I thought what better way to start blogging than by, uh, documenting my experience.

This article can be regarded as a living document. It will be updated to reflect new design choices.

## Web programming

For those unfamiliar with web programming, there are currently three distinct ways to create websites:

1. Serve a directory of HTML, CSS and images using a webserver like [NGiNX](https://www.nginx.com) or [IIS](https://www.iis.net). Typically programs called static site generators, such as [Jekyll](https://jekyllrb.com), are used to generate resources from intermediate markup. Rarely is it necessary to write HTML by hand.

2. Use an MVC framework like [Django](https://www.djangoproject.com) to serve pages generated dynamically from templates. Requests contain query or payload data to interact with the database and populate templates.

3. Serve the same page for every route with a bundle of JavaScript that manipulates the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) to facilitate rich interaction, and the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History) to simulate browsing. Such Single Page Applications are usually created with frameworks like [Angular](https://angular.io) and [React](https://reactjs.org). SPA code almost always needs to consume content from an API server.

Static resources are easier to cache, and static websites are more amenable to search engine optimisation. In practice, most modern websites are built using a combination of approaches because they need to support dynamic content and load efficiently.

## Isomorphic applications

Isomorphic applications are SPA-like websites that can "run" on both the server and the web browser. This blog is built as an isomorphic app, using React components:

- The app server runs in a [Node.js](https://nodejs.org) environment, and each controller renders a single page. In this scenario, React is effectively used as a templating engine.

- Client code uses the same top-level React component as the server but wraps it in a router. The router enables the frontend code to manipulate the aforementioned History API.

Rendering the first page requested on the server reduces the apparent time taken to paint it. Note that server-side rendering is not free: the server is under more load unless a caching strategy is employed.

The responsibility for rendering the correct page is delegated to the `App` component:

```javascript
const App = () => (
  <>
    <Route element={<Sidebar />} />
    <div id="content">
      <Routes>
        <Route element={<Posts />} />
        <Route path="about" element={<About />} />
        <Route path="posts">
          <Route element={<Posts />} />
          <Route path=":slug" element={<PostOr404 />} />
        </Route>
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </div>
  </>
);
```

On the server, each controller uses a `StaticRouter` instance to inform `App` which page it should display. For example, here is the controller that served the page you are viewing:

```javascript
router.get("/posts/:slug", (req, res) => {
  // Attempt to fetch a post by its slug
  const postOrNone = db.get(req.params.slug);
  // Provide data to `PostOr404` in `App` using the React Context API
  const stream = renderToNodeStream(
    <StaticRouter location={req.url}>
      <Context.Post.Provider value={postOrNone}>
        <App />
      </Context.Post.Provider>
    </StaticRouter>
  );
  res.status(postOrNone ? 200 : 404);
  // Write the header, which includes the path to client JavaScript
  res.write(
    `
      <!DOCTYPE html>
      <html lang="en">
        <head>${header(postOrNone)}</head>
        <body>
          <div id="root">
    `
  );
  stream.pipe(res, { end: false });
  // Terminate the response with the rest of the HTML
  stream.on("end", () => res.end("</div></body></html>"));
});
```

On the client, JavaScript takes over, enabling rapid (internal) navigation between various "pages" of the website. A `BrowserRouter` instance enables manipulation of the History API:

```javascript
// browser/index.jsx
hydrate(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
```

If navigation occurs, the server can supply additional metadata or markup to the browser through a JSON API. Lazily loading data in this manner reduces the size of the initial request.

Another advantage of isomorphic applications is that, sometimes, they may fall back to server-side rendering if the user has disabled browser scripting -- try doing this now.

## Build process

[Webpack](https://webpack.js.org/) is used as the module bundler. Two Webpack configurations are used to generate:

- client-side code and other assets under dist/static
- server-side code -- dist/server.js

By convention source code is stored according to whether it is shared or not:

```plaintext
client/
shared/
server/
```

### Publishing posts

Markup is versioned as source code. In this sense, the publishing mechanism is similar to that of Jekyll:

- Posts written in [Markdown](https://github.github.com/gfm/) are committed alongside code
- At build-time, the entries are rendered to HTML strings and bundled into the server code
- At runtime entries loaded into memory can be queried on demand

A custom Webpack loader processes the posts. Within markup, code and LaTeX snippets can be entered inline or in delimited blocks, like so:

````plaintext
# Complex numbers

Python supports complex numbers natively. For example, $1 + 2*j$ is written as

```python
1 + 2j
```
````

The loader is built using components from the [unified.js](https://unifiedjs.com/) ecosystem. Initially, when loading a page, a markdown parser transforms the markup to a syntax tree. Plugins are then chained to split nodes to support embedded languages. The snippet above is parsed to the following structure (simplified for the sake of illustration):

```plaintext
root
+-- heading
|   +-- text: "Complex numbers"
+-- paragraph
|   +-- text: "Python supports complex numbers natively. For example, $1 + 2*j$ is written as"
+-- code: "1 + 2j" lang: "python"
```

and then its paragraph content is transformed by the maths plugin to obtain two more nodes:

```plaintext
root
+-- heading
|   +-- text: "Complex numbers"
+-- paragraph
|   +-- text: "Python supports complex numbers natively. For example, "
|   +-- inlineMath: "1 + 2*j"
|   +-- text: " is written as"
+-- code: "1 + 2j" lang: "python"
```

The last tree is compiled into an HTML string. Highlighting is carried out by highlight.js, and katex.js renders inline and block math. Both these tools tag the HTML substrings they generate with classes that are targeted by CSS loaded on the client.

A syntax tree representation of markup makes it straightforward to extend the functionality of unified.js. In the loader, a custom compiler is used to compute accurate article word count:

```javascript
function wordCount(tree) {
  if (tree.type == "text") {
    return tree.value.trim().split(/\s+/).length;
  }
  return (tree.children || [])
    .map(wordCount)
    .reduce((count, childCount) => count + childCount, 0);
}
```

### Development

During development, Webpack watches the files and rebuilds the server and browser bundles on code change. Server-side code is run under [Nodemon](https://nodemon.io) so that the server can restart after recompilation.

### Production

For the production build, Webpack minifies code and carries out [tree-shaking](https://webpack.js.org/guides/tree-shaking/). This time the server-side code is run under a process manager so that the app can restart with the machine it runs on. NGiNX is used to serve static assets, but other requests are proxied to the Node.js app.

[Cloudflare](https://cloudflare.com) is used as a CDN and read-through cache. Write-though caching would be preferable, but I do not generate enough traffic nor content to warrant making the implementation effort!

## Further reading

If you are thinking about writing a blog, consider using a static site generator to create your website.

You could host the blog using a regular file server or through an object store such as [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html). If you do not want to deal with server or DNS record maintenance, then [GitHub Pages](https://pages.github.com) is a convenient option.

However, keep in mind that dynamic content in static websites is limited to embedded JavaScript. One typical operation which is hard to achieve with client-side scripting is filtering of posts by tag. If you want to allow the user to do this, then you have to build as many pages ahead-of-time as you have tags.
