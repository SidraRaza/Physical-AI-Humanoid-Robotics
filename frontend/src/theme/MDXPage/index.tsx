import React from 'react';
import clsx from 'clsx';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import MDXContent from '@theme/MDXContent';

interface Props {
  readonly content: React.ComponentType;
  readonly metadata?: {
    title?: string;
    description?: string;
    permalink?: string;
  };
}

export default function MDXPage(props: Props): JSX.Element {
  const {content: MDXPageContent, metadata} = props;

  // Handle case where metadata might be undefined or a JSON module
  const resolvedMetadata = metadata && typeof metadata === 'object'
    ? (metadata as any).default || metadata
    : {};

  const {title = 'Page', description = ''} = resolvedMetadata;

  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.mdxPages,
        ThemeClassNames.page.mdxPage,
      )}>
      <PageMetadata title={title} description={description} />
      <Layout>
        <main className="container container--fluid margin-vert--lg">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <article>
                <MDXContent>
                  <MDXPageContent />
                </MDXContent>
              </article>
            </div>
          </div>
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
