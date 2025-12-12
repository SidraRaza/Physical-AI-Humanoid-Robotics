import React, { useEffect, useState } from 'react';

const styles = {
  container: {
    padding: '1.5rem',
    borderRadius: '0.75rem',
    backgroundColor: 'var(--ifm-background-surface-color)',
    border: '1px solid var(--ifm-color-emphasis-200)',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: 'var(--ifm-heading-color)',
  },
  message: {
    color: 'var(--ifm-font-color-base)',
    lineHeight: 1.6,
    margin: 0,
  },
  loading: {
    color: 'var(--ifm-color-emphasis-600)',
    fontStyle: 'italic',
  },
  error: {
    color: 'var(--ifm-color-danger)',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--ifm-color-danger-contrast-background)',
  },
};

function MyComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e.message);
      }
    }
    fetchData();
  }, [API_BASE_URL]);

  if (error) {
    return <div style={styles.error}>Error: {error}</div>;
  }

  if (!data) {
    return <div style={styles.loading}>Loading backend data...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Backend Response</h2>
      <p style={styles.message}>{data.message}</p>
    </div>
  );
}

export default MyComponent;