import React, { useEffect, useState } from 'react';

function MyComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  // Use the environment variable, or fallback for local development
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE_URL}/`); // Example: Fetch from root endpoint
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
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!data) {
    return <div>Loading backend data...</div>;
  }

  return (
    <div>
      <h2>Data from FastAPI Backend:</h2>
      <p>{data.message}</p>
    </div>
  );
}

export default MyComponent;