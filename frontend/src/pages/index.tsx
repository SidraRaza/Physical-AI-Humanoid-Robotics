import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function TableOfContents() {
  const chapters = [
    {
      id: 1,
      title: 'Introduction to Physical AI',
      description: 'Learn the fundamentals of AI systems that interact with the physical world.',
      path: '/docs/chapter1'
    },
    {
      id: 2,
      title: 'Basics of Humanoid Robotics',
      description: 'Explore mechanical design, actuators, sensors, and control systems.',
      path: '/docs/chapter2'
    },
    {
      id: 3,
      title: 'ROS 2 Fundamentals',
      description: 'Master the industry-standard framework for robot software development.',
      path: '/docs/chapter3'
    },
    {
      id: 4,
      title: 'Perception Systems',
      description: 'Understand vision, depth sensing, SLAM, and sensor fusion in robots.',
      path: '/docs/chapter4'
    },
    {
      id: 5,
      title: 'Motion Planning & Control',
      description: 'Learn how humanoid robots plan, balance, and move safely.',
      path: '/docs/chapter5'
    },
    {
      id: 6,
      title: 'Learning for Robotics',
      description: 'Apply machine learning and reinforcement learning to physical agents.',
      path: '/docs/chapter6'
    },
    {
      id: 7,
      title: 'Real-World Deployment & Ethics',
      description: 'Challenges, safety, ethics, and future of humanoid AI systems.',
      path: '/docs/chapter7'
    },
    {
      id: 8,
      title: 'Advanced Robotics Simulation',
      description: 'Explore simulation environments, robot modeling, and virtual testing.',
      path: '/docs/chapter8'
    },
    {
      id: 9,
      title: 'Human-Robot Interaction & Safety',
      description: 'Understand human-robot interaction principles, safety protocols, and collaboration with humans.',
      path: '/docs/chapter9'
    }
  ];

  return (
    <section className={styles.tocSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Physical AI & Humanoid Robotics — Core Concepts
          </Heading>
          <p className={styles.sectionSubtitle}>
            A comprehensive guide to building intelligent physical systems
          </p>
        </div>

        <div className="row">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="col col--4 margin-bottom--lg">
              <div className={styles.chapterCard}>
                <div className={styles.chapterHeader}>
                  <h3 className={styles.chapterTitle}>
                    Chapter {chapter.id}: {chapter.title}
                  </h3>
                </div>
                <p className={styles.chapterDescription}>
                  {chapter.description}
                </p>
                <div className={styles.chapterFooter}>
                  <Link
                    to={chapter.path}
                    className={clsx('button button--primary button--block', styles.chapterButton)}
                  >
                    Read Chapter →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
              {siteConfig.title}
            </Heading>
            <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
              A comprehensive guide to building intelligent physical systems
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--secondary button--lg"
                to="/docs/chapter1">
                Start Learning
              </Link>
              <Link
                className={clsx('button button--lg', styles.buttonOutline)}
                to="/chatbot">
                Try AI Chatbot
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img
              src="https://media.istockphoto.com/id/2216193545/photo/human-and-robot-hand-interaction-symbolizing-future-collaboration-and-technological.webp?a=1&b=1&s=612x612&w=0&k=20&c=bzZHRtpLDc0dFA2uCJuOQCtpjfOhH0wcLSwz874CR14="
              alt="Human and robot hand interaction"
              className={styles.robotImage}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Physical AI & Humanoid Robotics`}
      description="A comprehensive textbook for learning Physical AI and Humanoid Robotics, from fundamentals to advanced concepts.">
      <HomepageHeader />
      <main>
        <TableOfContents />
      </main>
    </Layout>
  );
}
