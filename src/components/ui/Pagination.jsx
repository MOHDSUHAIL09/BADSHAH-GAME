import React from 'react'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalRecords,
  onPageChange 
}) => {
  
  if (totalPages <= 1) return null

  const getPaginationItems = () => {
    if (totalRecords === 0 || totalPages === 1) return [1]
    
    const pages = [1]
    let start = Math.max(2, currentPage - 1)
    let end = Math.min(totalPages - 1, currentPage + 1)
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    
    if (end < totalPages - 1) pages.push('...')
    if (!pages.includes(totalPages)) pages.push(totalPages)
    
    return pages
  }

  return (
    <div className="d-flex justify-content-center align-items-center mt-4 mb-3 flex-wrap gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: '38px',
          height: '38px',
          padding: 0,
          background: currentPage === 1 ? '#1e293b' : '#ffd70020',
          border: '1px solid rgba(255,215,0,0.3)',
          color: currentPage === 1 ? '#666' : '#ffd700',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}
      >
        ←
      </button>

      {/* Page Numbers */}
      {getPaginationItems().map((page, index) => (
        <button
          key={index}
          onClick={() => page !== '...' && onPageChange(page)}
          disabled={page === '...'}
          className="btn rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: '38px',
            height: '38px',
            padding: 0,
            background: currentPage === page ? '#ffd700' : '#1e293b',
            border: currentPage === page ? 'none' : '1px solid rgba(255,215,0,0.3)',
            color: currentPage === page ? '#000' : '#ffd700',
            fontWeight: currentPage === page ? 'bold' : 'normal',
            opacity: page === '...' ? 0.7 : 1,
            cursor: page === '...' ? 'default' : 'pointer'
          }}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: '38px',
          height: '38px',
          padding: 0,
          background: currentPage === totalPages ? '#1e293b' : '#ffd70020',
          border: '1px solid rgba(255,215,0,0.3)',
          color: currentPage === totalPages ? '#666' : '#ffd700',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}
      >
        →
      </button>
    </div>
  )
}

export default Pagination