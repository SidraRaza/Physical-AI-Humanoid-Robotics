const path = require('path');
const fs = require('fs');

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
        return {
          id,
          title: id.replace(/-/g, ' '),
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
        // Save MDX as temp file in .docusaurus
        const mdxFilePath = await createData(
          `${doc.id}.mdx`,
          doc.content
        );

        addRoute({
          path: doc.permalink,
          component: '@theme/MDXPage',
          modules: {
            content: mdxFilePath,
          },
          exact: true,
        });
      }
    },
  };
};
