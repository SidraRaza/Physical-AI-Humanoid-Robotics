const path = require('path');
const fs = require('fs');

module.exports = function (context, options) {
  return {
    name: 'content-loader',
    async loadContent() {
      const { siteDir } = context;
      const externalContentPath = path.join(siteDir, '..', 'content'); // Adjust this path to your external folder

      if (!fs.existsSync(externalContentPath)) {
        console.warn(`External content path not found: ${externalContentPath}`);
        return {};
      }

      const contentFiles = fs.readdirSync(externalContentPath).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));

      const loadedContent = {};
      for (const file of contentFiles) {
        const filePath = path.join(externalContentPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const id = path.parse(file).name; // Use filename as ID

        // Docusaurus expects content in a specific format for its docs plugin
        // We'll mimic a basic structure here. A more robust solution might involve
        // generating intermediate MDX files or using Docusaurus's content-plugin API directly.
        loadedContent[id] = {
          id: id,
          title: id.replace(/-/g, ' '), // Basic title from filename
          content: fileContent,
          permalink: `/docs/${id}`, // Example permalink
          // You might need to add more metadata here depending on how you want to integrate
          // with Docusaurus's docs features (e.g., sidebar_position, frontMatter)
        };
      }
      return loadedContent;
    },
    async contentLoaded({ content, actions }) {
      const { createData, addRoute } = actions;

      // Create a data JSON for the loaded content (optional, but good for debugging/access)
      const contentJson = await createData(
        'external-content.json',
        JSON.stringify(content, null, 2)
      );

      // Add routes for each piece of external content
      // This is a simplified approach. For full Docusaurus docs integration,
      // you'd typically integrate with @docusaurus/plugin-content-docs API.
      // For now, we'll create basic pages.
      for (const id in content) {
        const { title, permalink, content: fileContent } = content[id];
        addRoute({
          path: permalink,
          component: '@docusaurus/theme-classic/lib/theme/DocItem', // A simple way to render Markdown
          // component: path.resolve(__dirname, './components/ExternalContentPage.js'), // Or a custom React component
          exact: true,
          modules: {
            content: {
              __import: true,
              path: contentJson, // Point to the data file
              query: `$.${id}.content`, // Extract specific content
              type: 'string',
            },
            metadata: {
              __import: true,
              path: contentJson,
              query: `$.${id}`,
              type: 'json',
            }
          }
        });
      }
    },
  };
};
