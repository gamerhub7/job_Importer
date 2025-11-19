import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(r => r.json());

export default function ImportsPage() {
  const { data, error } = useSWR('http://localhost:4000/api/imports?limit=50', fetcher);

  if (error) return <div>Error loading imports</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Import History</h1>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Source (fileName)</th>
            <th>Total</th>
            <th>New</th>
            <th>Updated</th>
            <th>Failed</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map(it => (
            <tr key={it._id}>
              <td>{new Date(it.timestamp).toLocaleString()}</td>
              <td style={{ maxWidth: 350 }}>{it.sourceUrl}</td>
              <td>{it.totalImported ?? 0}</td>
              <td>{it.newJobs ?? 0}</td>
              <td>{it.updatedJobs ?? 0}</td>
              <td>{(it.failedJobs && it.failedJobs.length) || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
