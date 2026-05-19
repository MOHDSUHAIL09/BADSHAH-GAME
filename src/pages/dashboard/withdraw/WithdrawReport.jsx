import React, { useState, useEffect } from 'react'
import apiClient from '../../../api/apiClient'  // ✅ apiClient import karo
import CustomTable from '../../../components/ui/CustomTable'
import Pagination from '../../../components/ui/Pagination'

const WithdrawReport = () => {
  const [loading, setLoading] = useState(true)
  const [withdrawData, setWithdrawData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Get regNo from localStorage (token apiClient me already handle ho raha hai)
  const getRegNo = () => {
    return localStorage.getItem('RegNo') || localStorage.getItem('regNo') || '1'
  }

  // Fetch withdrawal report from API
  const fetchWithdrawReport = async () => {
    const regNo = getRegNo()

    try {
      const response = await apiClient.get(
        `/IncomePayout/withdraw-report/${regNo}`
      )

      console.log('Awithdrae report', response.data)

      if (response.data.success && response.data.response?.data) {
        setWithdrawData(response.data.response.data)
      } else {
        setWithdrawData([])
      }
    } catch (error) {
      console.error('Error fetching withdraw report:', error)
      setWithdrawData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawReport()
  }, [])

  // Columns for CustomTable
  const columns = ['S.No', 'Amount', 'Charges', 'Status', 'Date & Time']

  // Pagination calculation
  const lastIndex = currentPage * itemsPerPage
  const firstIndex = lastIndex - itemsPerPage
  const currentData = withdrawData.slice(firstIndex, lastIndex)
  const totalPages = Math.ceil(withdrawData.length / itemsPerPage)

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get status style
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return { color: '#00ffb3', background: '#00ffb320', icon: '✅' }
      case 'pending':
        return { color: '#ffd700', background: '#ffd70020', icon: '⏳' }
      case 'processing':
        return { color: '#00c6ff', background: '#00c6ff20', icon: '🔄' }
      case 'failed':
        return { color: '#ff4757', background: '#ff475720', icon: '❌' }
      default:
        return { color: '#fff', background: '#ffffff20', icon: '📌' }
    }
  }

  // Calculate total withdrawn amount
  const totalWithdrawnAmount = withdrawData.reduce((sum, item) => sum + (item.amount || 0), 0)

  return (
    <div className="container py-4">
      
      {/* Header with Total Amount */}
      <div className="withdraw-card mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h3 className="text-warning mb-1">💰 Withdrawal Report</h3>
            <p className="text-white-50 mb-0">Complete withdrawal transaction history</p>
          </div>
          {/* <div className="p-3 rounded-3" style={{ background: 'linear-gradient(135deg, #ffd70020, #ff8c0020)', borderRadius: '16px' }}>
            <span className="text-white-50 small">Total Withdrawn</span>
            <h3 className="text-warning mb-0">₹{totalWithdrawnAmount.toFixed(2)}</h3>
          </div> */}
        </div>
      </div>



      {/* Custom Table */}
      <CustomTable 
        columns={columns} 
        loading={loading}
        emptyMessage="📭 No withdrawal records found"
      >
        {currentData.map((item, index) => {
          const statusStyle = getStatusStyle(item.status)
          const serialNo = firstIndex + index + 1
          return (
            <tr key={item.id || index}>
              <td className="py-3 px-4" style={{ color: '#fff', fontWeight: 'bold' }}>
                {serialNo}
              </td>
              <td className="py-3 px-4" style={{ color: '#00ffb3', fontWeight: 'bold' }}>
                ₹{(item.debit || 0).toFixed(2)}
              </td>
              <td className="py-3 px-4" style={{ color: '#fff' }}>
                ₹{(item.charges || 0).toFixed(2)}
              </td>
              <td className="py-3 px-4">
                <span style={{
                  background: statusStyle.background,
                  color: statusStyle.color,
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  {item.txnstatus || 'N/A'}
                </span>
              </td>
              <td className="py-3 px-4" style={{ color: '#fff' }}>
                {item.edate || new Date(item.createdAt).toLocaleString() }
              </td>
            </tr>
          )
        })}
      </CustomTable>

      {/* Pagination Component */}
      {!loading && withdrawData.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={withdrawData.length}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

export default WithdrawReport