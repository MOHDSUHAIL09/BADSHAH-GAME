import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useUser } from '../../context/UserContext';
import './Dashboard.css';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';

const Dashboard = () => {
  // ==================== USER CONTEXT ====================
  const { userData, refreshData } = useUser();

  // ==================== STATE VARIABLES ====================
  
  // Game States
  const [totalBet, setTotalBet] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [betAmounts, setBetAmounts] = useState(Array(12).fill(0));
  const [previewAmounts, setPreviewAmounts] = useState(Array(12).fill(0));
  
  // Result States
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [winningAmount, setWinningAmount] = useState(0);
  const [resultHistory, setResultHistory] = useState([]);
  
  // UI States
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ isWin: false, amount: 0, icon: null });
  const [showLast10Modal, setShowLast10Modal] = useState(false);
  const [last10TimeLeft, setLast10TimeLeft] = useState(10);
  
  // Timer & Game States
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIcon, setCurrentIcon] = useState(null);
  const [isBettingLocked, setIsBettingLocked] = useState(false);
  const [gameId, setGameId] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // ==================== REFS ====================
  const last10ModalShownRef = useRef(false);
  const timerRef = useRef(null);
  const isResultDeclaredRef = useRef(false);
  const modalTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // ==================== GAME ITEMS (12 CARDS) ====================
  const items = [
    { id: 0, name: 'Umbrella', emoji: '☂️', emojiCode: '1', value: 50, color: '#ff6b6b' },
    { id: 1, name: 'Ball', emoji: '⚽', emojiCode: '2', value: 45, color: '#4ecdc4' },
    { id: 2, name: 'Sun', emoji: '☀️', emojiCode: '3', value: 40, color: '#ffe66d' },
    { id: 3, name: 'Depak', emoji: '🪔', emojiCode: '4', value: 55, color: '#ff9f43' },
    { id: 4, name: 'Cow', emoji: '🐮', emojiCode: '5', value: 35, color: '#a8e6cf' },
    { id: 5, name: 'Bukett', emoji: '💐', emojiCode: '6', value: 30, color: '#ff8da1' },
    { id: 6, name: 'Kite', emoji: '🪁', emojiCode: '7', value: 60, color: '#6c5ce7' },
    { id: 7, name: 'Spaceship', emoji: '🚀', emojiCode: '8', value: 45, color: '#00cec9' },
    { id: 8, name: 'Rose', emoji: '🌹', emojiCode: '9', value: 50, color: '#fd79a8' },
    { id: 9, name: 'Butterfly', emoji: '🦋', emojiCode: '10', value: 40, color: '#a29bfe' },
    { id: 10, name: 'Bird', emoji: '🐦', emojiCode: '11', value: 45, color: '#fdcb6e' },
    { id: 11, name: 'Hen', emoji: '🐔', emojiCode: '12', value: 30, color: '#e17055' }
  ];

  const betOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];

  // ==================== HELPER FUNCTIONS ====================
  
  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const showToastMessage = (message, isSuccess = true) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const formatSeconds = (seconds) => {
    const secs = seconds % 60;
    return secs.toString().padStart(2, '0');
  };

  const generateGameId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  // ==================== API CALL FUNCTION - SINGLE CALL WITH ARRAYS ====================
  const addBidToAPI = async (pid, totalDebitAmount, betNumbersArray, perbitAmountsArray, game, gameType, gameId, accType) => {
    try {
      const token = getAuthToken();

      // ✅ Request body with arrays
      const requestBody = {
        pid: Number(pid),
        debit: Number(totalDebitAmount),     // Total sum of all bets
        bet: betNumbersArray,                 // Array of bet numbers ["1", "2", "11"]
        perbit: perbitAmountsArray,          // Array of amounts ["10", "10", "10"]
        game: String(game),
        gameType: String(gameType),
        gameId: String(gameId),
        accType: String(accType)
      };

      console.log("========== ADD BID API CALL (SINGLE REQUEST WITH ARRAYS) ==========");
      console.log("Request Body:", JSON.stringify(requestBody, null, 2));
      console.log("==========================================================");

      const response = await apiClient.post('/Trading/AddBid', requestBody, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AddBid API Error:', error);
      if (error.response?.data) {
        console.error('Error Details:', error.response.data);
      }
      throw error;
    }
  };

  // ==================== BET PLACEMENT FUNCTION - SINGLE API CALL FOR ALL BETS ====================
  const handlePlaceBet = async () => {
    if (isBettingLocked) {
      showToastMessage('⛔ Betting closed! Last 10 seconds remaining!', false);
      return;
    }
    
    if (isResultDeclaredRef.current) {
      showToastMessage('⏳ Please wait for next round!', false);
      return;
    }
    
    if (isPlacingBet) {
      showToastMessage('⏳ Please wait, placing bets...', false);
      return;
    }

    const hasPreview = previewAmounts.some(amount => amount > 0);
    if (!hasPreview) {
      showToastMessage('⚠️ Please select at least one card first!', false);
      return;
    }

    // ✅ Calculate TOTAL sum of all selected bets
    const totalPreviewAmount = previewAmounts.reduce((sum, amount) => sum + amount, 0);
    const currentWallet = userData?.currentamt || 0;

    // ✅ Prepare arrays for API
    const betNumbersArray = [];      // Array of emoji codes
    const perbitAmountsArray = [];   // Array of amounts
    const selectedIndices = [];       // Array of selected card indices

    // Collect all selected bets
    for (let i = 0; i < previewAmounts.length; i++) {
      if (previewAmounts[i] > 0) {
        betNumbersArray.push(items[i].emojiCode);
        perbitAmountsArray.push(previewAmounts[i].toString());
        selectedIndices.push(i);
      }
    }

    console.log("========== PLACE BET SUMMARY ==========");
    console.log("Selected Cards:", selectedIndices.length);
    console.log("Bet Numbers Array:", betNumbersArray);
    console.log("Perbit Amounts Array:", perbitAmountsArray);
    console.log("Total Debit Amount (Sum):", totalPreviewAmount);
    console.log("Wallet Balance:", currentWallet);
    console.log("======================================");

    if (currentWallet < totalPreviewAmount) {
      showToastMessage(`⚠️ Insufficient balance! Need ₹${totalPreviewAmount} but have ₹${currentWallet}`, false);
      return;
    }

    setIsPlacingBet(true);

    try {
      // ✅ SINGLE API CALL - All bets in one request with arrays
      const result = await addBidToAPI(
        Number(userData?.pid) || Number(userData?.id) || 1,
        Number(totalPreviewAmount),        // ✅ Total sum of all bets
        betNumbersArray,                   // ✅ Array of bet numbers ["1", "2", "11"]
        perbitAmountsArray,                // ✅ Array of amounts ["10", "10", "10"]
        "Number",
        "A",
        String(gameId || generateGameId()),
        "playgame"
      );

      // Check if API call was successful
      if (result && result.success === true) {
        // Update local state
        const newBetAmounts = [...betAmounts];
        let totalDeduction = 0;
        
        for (let i = 0; i < selectedIndices.length; i++) {
          const idx = selectedIndices[i];
          const amount = previewAmounts[idx];
          newBetAmounts[idx] += amount;
          totalDeduction += amount;
        }
        
        setBetAmounts(newBetAmounts);
        setTotalBet(totalBet + totalDeduction);
        setPreviewAmounts(Array(12).fill(0));
        
        // Refresh user data to update wallet balance
        setTimeout(() => refreshData(), 1000);
        
        showToastMessage(`✅ ${selectedIndices.length} bets placed successfully! Total: ₹${totalDeduction}`, true);
      } else {
        showToastMessage(`❌ Failed to place bets: ${result?.message || 'Unknown error'}`, false);
      }
    } catch (error) {
      console.error("Error placing bets:", error);
      showToastMessage('❌ API Error! Failed to place bets.', false);
    }

    setIsPlacingBet(false);
  };

  // ==================== GAME TIMER & RESULT FUNCTIONS ====================
  
  const showLast10SecondsModal = () => {
    if (last10ModalShownRef.current) return;
    last10ModalShownRef.current = true;
    setIsBettingLocked(true);
    setLast10TimeLeft(10);
    setShowLast10Modal(true);

    const countdownInterval = setInterval(() => {
      setLast10TimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      setShowLast10Modal(false);
    }, 10000);
  };

  const resetAfterResult = () => {
    setBetAmounts(Array(12).fill(0));
    setPreviewAmounts(Array(12).fill(0));
    setTotalBet(0);
    setWinnerIndex(null);
    setWinningAmount(0);
    setCurrentIcon(null);
    isResultDeclaredRef.current = false;
    setIsBettingLocked(false);
    last10ModalShownRef.current = false;
    setGameId(generateGameId());
    setTimeLeft(60);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 11 && !last10ModalShownRef.current && !isResultDeclaredRef.current) {
          showLast10SecondsModal();
        }
        if (prev <= 1) {
          if (!isResultDeclaredRef.current) {
            declareResult();
          }
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const declareResult = () => {
    if (isResultDeclaredRef.current) return;
    isResultDeclaredRef.current = true;

    const randomWinner = Math.floor(Math.random() * items.length);
    const winningIcon = items[randomWinner];

    setCurrentIcon(winningIcon);
    setWinnerIndex(randomWinner);

    const winnerBet = betAmounts[randomWinner];
    const winAmount = winnerBet * 9;
    const isWin = winnerBet > 0;

    setModalData({
      isWin: isWin,
      amount: winAmount,
      icon: winningIcon
    });
    setShowModal(true);

    setResultHistory(prev => {
      const newHistory = [{
        ...winningIcon,
        roundTime: new Date().toLocaleTimeString(),
        isWin: isWin,
        winAmount: winAmount
      }, ...prev];
      return newHistory.slice(0, 5);
    });

    setTimeout(() => {
      setWinnerIndex(null);
    }, 3000);

    if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    modalTimeoutRef.current = setTimeout(() => {
      setShowModal(false);
      resetAfterResult();
    }, 3000);
  };

  // ==================== TIMER INITIALIZATION ====================
  useEffect(() => {
    if (userData) {
      if (userData.seconds && userData.seconds > 0 && userData.seconds <= 60) {
        setTimeLeft(userData.seconds);
      }
      if (userData.gameid) {
        setGameId(userData.gameid);
      }
    }
  }, [userData]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          if (!isResultDeclaredRef.current) {
            declareResult();
          }
          return 0;
        }
        if (prev === 11 && !last10ModalShownRef.current && !isResultDeclaredRef.current) {
          showLast10SecondsModal();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // ==================== UI HANDLERS ====================
  
  const handleCardClick = (index) => {
    if (isBettingLocked) {
      showToastMessage('⛔ Betting closed! Last 10 seconds remaining!', false);
      return;
    }
    if (isResultDeclaredRef.current) {
      showToastMessage('⏳ Please wait for next round!', false);
      return;
    }

    const currentPreview = previewAmounts[index];
    if (currentPreview > 0) {
      const newPreviewAmounts = [...previewAmounts];
      newPreviewAmounts[index] = 0;
      setPreviewAmounts(newPreviewAmounts);
      showToastMessage(`✨ Preview removed from ${items[index].name}`, false);
    } else {
      const newPreviewAmounts = [...previewAmounts];
      newPreviewAmounts[index] = selectedAmount;
      setPreviewAmounts(newPreviewAmounts);
      showToastMessage(`✨ ₹${selectedAmount} preview on ${items[index].name}! Click "Place Bet" to confirm`, true);
    }
  };

  // ==================== RENDER UI ====================
  return (
    <div className='game-container'>
      <div className="animated-bg"></div>
      <div className="particles"></div>

      <div className="container py-4">
        <div className="container">

          {/* Wallet Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12">
              <div className="wallet-card-new d-flex align-items-center justify-content-between flex-wrap gap-3">
                
                <div className="d-flex align-items-center gap-3">
                  <div className="wallet-icon">
                    <i className="bi bi-wallet2"></i>
                  </div>
                  <div className="wallet-info">
                    <span>WALLET BALANCE</span>
                    <h2 className="mb-0">₹{(userData?.currentamt || 0)}</h2>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="wallet-icon">
                    <i className="bi bi-wallet2"></i>
                  </div>
                  <div className="wallet-info">
                    <span style={{ color: "#FFF" }}>BETTING AMOUNT</span>
                    <h2 className="mb-0" style={{ color: "#ffd700" }}>₹{(userData?.totbettingamt || 0)}</h2>
                  </div>
                </div>

                <Link to="/dashboard/withdraw">
                  <button 
                    className="btn btn-warning fw-bold py-2 px-4"
                    style={{ 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #ffd700, #ff8c00)', 
                      border: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    💸 PayOut
                  </button>
                </Link>

              </div>
            </div>
          </div>

          {/* Timer & Results */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-7">
              <div className="timer-card-digital">
                <div className="timer-header-digital d-flex justify-content-between align-items-center px-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-hourglass-split"></i>
                    <span>TIME REMAINING</span>
                  </div>
                  {timeLeft <= 10 && timeLeft > 0 && <span className="urgent-badge">URGENT!</span>}
                </div>

                <div className='row'>
                  <div className='px-3'>
                    <div className="digit-box digital-timer d-flex justify-content-around align-items-center">
                      <div className="timer-digits-box">
                        <span>{formatSeconds(timeLeft)}</span>
                      </div>
                      <div className="timer-digits-box">
                        <span>GAME ID: {gameId || userData?.gameid || 'LOADING'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-5">
              <div className="results-card">
                <div className="results-header">
                  <i className="bi bi-clock-history"></i>
                  <span>LAST RESULTS</span>
                </div>
                <div className="results-list">
                  {resultHistory.length > 0 ? (
                    resultHistory.map((result, idx) => (
                      <div key={idx} className="result-item">
                        <div className="result-emoji-new">{result.emoji}</div>
                        <div className="result-name-new">{result.name}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No results yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Game Grid - 12 Cards */}
          <div className="game-grid-card">
            <div className="grid-header">
              <div className="header-left">
                <i className="bi bi-grid-3x3-gap-fill"></i>
                <span>SELECT YOUR BET</span>
              </div>
              <div className="bet-badge">
                <i className="bi bi-trophy"></i> 9x WIN
              </div>
            </div>
            <div className="grid-body">
              <div className="row g-3">
                {items.map((item, index) => (
                  <div key={item.id} className="col-4 col-md-3 col-lg-2">
                    <div
                      className={`game-card 
                        ${betAmounts[index] > 0 ? 'active' : ''} 
                        ${winnerIndex === index ? 'winner' : ''}
                        ${previewAmounts[index] > 0 ? 'preview' : ''}`}
                      onClick={() => handleCardClick(index)}
                      style={{ cursor: (isBettingLocked || isResultDeclaredRef.current || isPlacingBet) ? 'not-allowed' : 'pointer', opacity: (isBettingLocked || isResultDeclaredRef.current || isPlacingBet) ? 0.5 : 1 }}
                    >
                      <div className="card-glow"></div>
                      <div className="card-emoji">{item.emoji}</div>
                      <div className="card-name">{item.name}</div>
                      {previewAmounts[index] > 0 && (
                        <div className="card-preview-amount">🎯 ₹{previewAmounts[index]}</div>
                      )}
                      {betAmounts[index] > 0 && (
                        <div className="card-bet">✅ ₹{betAmounts[index]}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bet Amount Selector */}
          <div className="bet-selector-card">
            <div className="selector-header01 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-cash-coin"></i>
                <span>TOTAL BET</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="bet-icon">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div className="bet-info">
                  <span>TOTAL BET</span>
                  <h2>₹{totalBet.toLocaleString()}</h2>
                </div>
              </div>
            </div>

            <div className="selector-body">
              <div className="bet-buttons">
                {betOptions.map(amount => (
                  <button
                    key={amount}
                    className={`bet-btn ${selectedAmount === amount ? 'active' : ''}`}
                    onClick={() => setSelectedAmount(amount)}
                    disabled={isBettingLocked || isResultDeclaredRef.current || isPlacingBet}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>

              <div className="selected-info" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  className='bet-button'
                  onClick={handlePlaceBet}
                  disabled={isBettingLocked || isResultDeclaredRef.current || isPlacingBet}
                  style={{
                    padding: '12px 40px',
                    borderRadius: '50px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    fontWeight: 'bold',
                    opacity: (isBettingLocked || isResultDeclaredRef.current || isPlacingBet) ? 0.5 : 1
                  }}
                >
                  {isPlacingBet ? '⏳ Placing Bets...' : '💰 Place Bet'}
                </button>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {showToast && (
            <div className="center-toast">
              <div className="toast-content">{toastMessage}</div>
            </div>
          )}

          {/* Modals */}
          {showLast10Modal && (
            <div className="modal-overlay">
              <div className="modal-container modal-danger">
                <div className="modal-header-custom">
                  <i className="bi bi-alarm"></i>
                  <h3>LAST 10 SECONDS!</h3>
                </div>
                <div className="modal-body-custom">
                  <div className="countdown-timer">{last10TimeLeft}</div>
                  <p>Betting Closed! Result coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className={`modal-container ${modalData.isWin ? 'modal-win' : 'modal-lose'}`}>
                <div className="modal-header-custom">
                  {modalData.isWin ? <i className="bi bi-trophy-fill"></i> : <i className="bi bi-emoji-frown"></i>}
                  <h3>{modalData.isWin ? 'YOU WIN!' : 'YOU LOSE'}</h3>
                </div>
                <div className="modal-body-custom">
                  <div className="winner-emoji">{modalData.icon?.emoji}</div>
                  <h4 className='text01'>{modalData.icon?.name}</h4>
                  {modalData.isWin && (
                    <div className="win-amount">+ ₹{modalData.amount}</div>
                  )}
                  <p className='text01'>{modalData.isWin ? '🎉 9x Congratulations! You won big! 🎉' : '😢 Better luck next time! 😢'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;