import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Beginner Friendly',
    icon: '📚',
    description: (
      <>
        Start from the basics and progressively build your understanding of deep
        learning concepts with clear explanations and practical examples.
      </>
    ),
  },
  {
    title: 'Interactive Learning',
    icon: '💬',
    description: (
      <>
        Use our AI-powered chatbot to ask questions about any topic in the
        textbook. Get instant answers and deeper explanations.
      </>
    ),
  },
  {
    title: 'Hands-on Projects',
    icon: '🛠️',
    description: (
      <>
        Apply what you learn with real-world projects and code examples that
        reinforce your understanding of neural networks and AI.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Why Learn With Us?
          </Heading>
          <p className={styles.sectionSubtitle}>
            Everything you need to master deep learning fundamentals
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
