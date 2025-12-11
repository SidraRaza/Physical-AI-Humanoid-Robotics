const path = require('path');
const fs = require('fs');

// Parse frontmatter from markdown content
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatterStr = match[1];
    const body = match[2];
    const frontmatter = {};

    // Simple YAML parsing for key: value pairs
    frontmatterStr.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        frontmatter[key] = value;
      }
    });

    return { frontmatter, body };
  }

  return { frontmatter: {}, body: content };
}

// Extract title from content if no frontmatter title
function extractTitleFromContent(content, fallbackId) {
  // Look for first heading
  const headingMatch = content.match(/^#{1,2}\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  // Fallback to formatted ID
  return fallbackId.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

module.exports = function contentLoaderPlugin(context, options) {
  return {
    name: 'content-loader',

    async loadContent() {
      const { siteDir } = context;

      // Load content folder OUTSIDE frontend
      const externalContentPath = path.resolve(siteDir, '..', 'content');

      if (!fs.existsSync(externalContentPath)) {
        console.warn(`⚠ External content folder NOT found: ${externalContentPath}`);
        return null;
      }

      const files = fs.readdirSync(externalContentPath)
        .filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

      const items = files.map(file => {
        const filePath = path.join(externalContentPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const id = path.parse(file).name;

        const { frontmatter, body } = parseFrontmatter(fileContent);
        const title = frontmatter.title || extractTitleFromContent(body, id);

        return {
          id,
          title,
          description: frontmatter.description || '',
          content: fileContent,
          permalink: `/docs/${id}`,
        };
      });

      return items;
    },

    async contentLoaded({ content, actions }) {
      if (!content) return;

      const { createData, addRoute } = actions;

      for (const doc of content) {
        // Save MDX content as temp file in .docusaurus
        const mdxFilePath = await createData(
          `${doc.id}.mdx`,
          doc.content
        );

        // Create metadata object that MDXPage expects
        const metadata = {
          title: doc.title,
          description: doc.description,
          permalink: doc.permalink,
          source: `@site/../content/${doc.id}.md`,
        };

        const metadataPath = await createData(
          `${doc.id}-metadata.json`,
          JSON.stringify(metadata)
        );

        addRoute({
          path: doc.permalink,
          component: '@theme/MDXPage',
          modules: {
            content: mdxFilePath,
            metadata: metadataPath,
          },
          exact: true,
        });
      }
    },
  };
};
