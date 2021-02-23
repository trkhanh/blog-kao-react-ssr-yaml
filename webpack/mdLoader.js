const unified = require("unified");
const remarkParse = require("remark-parse");
const remarkMath = require("remark-math");
const remarkRehype = require("remark-rehype");
const rehypeHighlight = require("rehype-highlight");
const rehypeKatex = require("rehype-katex");
const rehypeStringify = require("rehype-stringify");
const vfile = require("vfile");
const matter = require("vfile-matter");

// Markdown AST -> word count compiler
function retextCount() {
  this.Compiler = countWords;
}

function countWords(tree) {
  if (tree.type == "text") {
    return tree.value.trim().split(/\s+/).length;
  }
  return (tree.children || [])
    .map(countWords)
    .reduce((count, childCount) => count + childCount, 0);
}

module.exports = function (contents) {
  let file = vfile({ contents });
  matter(file, { strip: true });
  // Extract metadata
  const { title, summary, tags, created } = file.data.matter;

  // Extract rendered post content
  const body = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .processSync(file)
    .toString();

  // Calculate word count
  file = vfile({ contents }); // n.b. render process mutates the file
  matter(file, { strip: true });
  const wordCount = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(retextCount)
    .processSync(file).result;

  return `module.exports = ${JSON.stringify({
    title,
    summary,
    tags,
    wordCount,
    body,
    created: created.getTime(),
  })}`;
};
