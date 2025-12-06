import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/chapter-1-introduction-to-physical-ai">
            Get Started →  
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Physical AI & Humanoid Robotics Textbook"
      description="Learn to build intelligent physical systems with ROS 2, simulation, and AI models">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Table of Contents</h2>
              </div>
            </div>
            <div className="row">
              {/* Chapter Cards */}
              {[
                {icon: '🧠', title: 'Chapter 1', subtitle: 'Introduction to Physical AI', link: '/docs/chapter-1-introduction-to-physical-ai', desc: 'Learn the fundamentals of AI systems that interact with the physical world.'},
                {icon: '🤖', title: 'Chapter 2', subtitle: 'Basics of Humanoid Robotics', link: '/docs/chapter-2-basics-of-humanoid-robotics', desc: 'Explore mechanical design, actuators, sensors, and control systems.'},
                {icon: '⚙️', title: 'Chapter 3', subtitle: 'ROS 2 Fundamentals', link: '/docs/chapter-3-ros-2-fundamentals', desc: 'Master the industry-standard framework for robot software development.'},
                {icon: '🌐', title: 'Chapter 4', subtitle: 'Digital Twin Simulation', link: '/docs/chapter-4-digital-twin-simulation', desc: 'Use Gazebo and Isaac Sim to test robots in virtual environments.'},
                {icon: '👁️', title: 'Chapter 5', subtitle: 'Vision-Language-Action Systems', link: '/docs/chapter-5-vision-language-action-systems', desc: 'Build AI models that understand vision, language, and generate actions.'},
                {icon: '🎓', title: 'Chapter 6', subtitle: 'Capstone Project', link: '/docs/chapter-6-capstone-ai-robot-pipeline', desc: 'Integrate all concepts to build a complete AI-robot pipeline.'}
              ].map((chapter, idx) => (
                <div className="col col--4" key={idx}>
                  <div className="card margin-bottom--lg">
                    <div className="card__header">
                      <div style={{fontSize: '3rem', marginBottom: '0.5rem'}}>{chapter.icon}</div>
                      <h3>{chapter.title}</h3>
                    </div>
                    <div className="card__body">
                      <p><strong>{chapter.subtitle}</strong></p>
                      <p>{chapter.desc}</p>
                    </div>
                    <div className="card__footer">
                      <Link to={chapter.link}>Read Chapter →</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
