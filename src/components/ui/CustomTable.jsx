import React from 'react'

const CustomTable = ({ columns, children, loading = false, emptyMessage = "No data found" }) => {
  return (
    <div className="withdraw-card" style={{ overflowX: 'auto', padding: 0, background: '#111827', borderRadius: '16px' }}>
      <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
        <thead>
          <tr style={{ background: '#1e293b' }}>
            {columns.map((column, index) => (
              <th key={index} className="py-3 px-4 fw-semibold" style={{ color: '#ffd700', borderBottom: '2px solid #ffd700', textAlign: 'left' }}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-5">
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <div className="spinner-border text-warning" role="status" style={{ width: '40px', height: '40px' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="text-white"></span>
                </div>
              </td>
            </tr>
          ) : (
            children
          )}
          {!loading && (!children || React.Children.count(children) === 0) && (
            <tr>
              <td colSpan={columns.length} className="text-center py-5">
                <div>
                  <span style={{ fontSize: '48px' }}>📭</span>
                  <p className="text-white-50 mt-2">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default CustomTable