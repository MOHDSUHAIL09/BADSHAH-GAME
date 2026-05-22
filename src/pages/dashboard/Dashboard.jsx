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
  const { userData, refreshData, forceRefresh } = useUser();

  // ==================== STATE VARIABLES ====================
  const [totalBet, setTotalBet] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [betAmounts, setBetAmounts] = useState(Array(12).fill(0));
  const [previewAmounts, setPreviewAmounts] = useState(Array(12).fill(0));
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [resultHistory, setResultHistory] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ isWin: false, amount: 0, icon: null, betAmount: 0, winningNumber: '' });
  const [showLast10Modal, setShowLast10Modal] = useState(false);
  const [last10TimeLeft, setLast10TimeLeft] = useState(10);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIcon, setCurrentIcon] = useState(null);
  const [isBettingLocked, setIsBettingLocked] = useState(false);
  const [gameId, setGameId] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [roundGameId, setRoundGameId] = useState('');

  // ==================== REFS ====================
  const last10ModalShownRef = useRef(false);
  const timerRef = useRef(null);
  const isResultDeclaredRef = useRef(false);
  const modalTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const gameIdRef = useRef('');
  const apiCallInProgressRef = useRef(false);
  const last10IntervalRef = useRef(null);

  // ==================== GAME ITEMS ====================
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

  // ==================== LOCAL STORAGE ====================
  const saveBetsToLocalStorage = (gameId, bets) => {
    const betData = {
      gameId: gameId,
      timestamp: new Date().toISOString(),
      bets: bets,
      totalAmount: bets.reduce((sum, b) => sum + b.amount, 0)
    };
    localStorage.setItem(`bets_${gameId}`, JSON.stringify(betData));
    console.log("💾 Bets saved for game:", gameId);
  };

  const getBetsFromLocalStorage = (gameId) => {
    const data = localStorage.getItem(`bets_${gameId}`);
    return data ? JSON.parse(data) : null;
  };

  // ==================== LAST 10 SECONDS MODAL ====================
  const showLast10SecondsModal = () => {
    if (last10ModalShownRef.current) return;
    console.log("🔔 LAST 10 SECONDS! Opening modal...");
    last10ModalShownRef.current = true;
    setIsBettingLocked(true);
    setLast10TimeLeft(10);
    setShowLast10Modal(true);

    // Clear any existing interval
    if (last10IntervalRef.current) {
      clearInterval(last10IntervalRef.current);
    }

    // Countdown timer - 10 se 1 tak
    last10IntervalRef.current = setInterval(() => {
      setLast10TimeLeft(prev => {
        const newTime = prev - 1;
        console.log("⏰ Modal countdown:", newTime);
        
        if (newTime <= 0) {
          clearInterval(last10IntervalRef.current);
          last10IntervalRef.current = null;
          setShowLast10Modal(false);
          last10ModalShownRef.current = false;
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  // ==================== HELPERS ====================
  const getAuthToken = () => localStorage.getItem('token') || '';

  const showToastMessage = (message, isSuccess = true) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000);
  };

  const formatSeconds = (seconds) => {
    if (seconds === null || seconds === undefined) return "00";
    if (seconds < 0) return "00";
    if (seconds < 10) return `0${seconds}`;
    return `${seconds}`;
  };

  // ==================== RESET ROUND ====================
  const resetRound = () => {
    console.log("🔄 Resetting round");
    setBetAmounts(Array(12).fill(0));
    setPreviewAmounts(Array(12).fill(0));
    setTotalBet(0);
    setWinnerIndex(null);
    setCurrentIcon(null);
    setIsBettingLocked(false);
    isResultDeclaredRef.current = false;
    last10ModalShownRef.current = false;
    setShowLast10Modal(false);
    setIsRoundActive(true);
    setRoundGameId('');
    
    // Clear last10 interval if exists
    if (last10IntervalRef.current) {
      clearInterval(last10IntervalRef.current);
      last10IntervalRef.current = null;
    }
  };

  // ==================== CHECK WINNING RESULT ====================
  const checkWinningResult = async () => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get('/Trading/game-result', {
        params: { PageIndex: 1, PageSize: 50 },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data?.success) {
        const results = response.data.data?.data || [];
        const currentGameId = roundGameId || gameIdRef.current;
        console.log("🔍 Checking result for gameId:", currentGameId);
        
        if (!currentGameId) return null;

        // ✅ FIX: Convert both to string for comparison
        const myGameResult = results.find(r => String(r.gameid) === String(currentGameId));
        console.log("📊 Found result:", myGameResult);
        
        if (!myGameResult) return null;

        const winningNumber = myGameResult.betnumber;
        console.log("🏆 Winning Number:", winningNumber);
        
        if (!winningNumber) return null;

        const savedBets = getBetsFromLocalStorage(currentGameId);
        console.log("📦 Saved bets:", savedBets);
        
        let isWin = false;
        let winAmount = 0;
        let userBetAmount = 0;
        const winningIndex = items.findIndex(item => item.emojiCode === winningNumber);
        const winningIcon = winningIndex !== -1 ? items[winningIndex] : null;

        const hasUserPlacedBet = savedBets && savedBets.bets && savedBets.bets.length > 0;

        if (savedBets && savedBets.bets) {
          const matchedBet = savedBets.bets.find(bet => bet.betNumber === winningNumber);
          if (matchedBet) {
            isWin = true;
            userBetAmount = matchedBet.amount;
            winAmount = userBetAmount * 9;
            console.log("🎉 WIN! Amount:", winAmount);
            showToastMessage(`🎉 You won ₹${winAmount}!`, true);
            setTimeout(() => refreshData(), 500);
          } else if (hasUserPlacedBet) {
            console.log("😢 LOSE!");
            showToastMessage(`😢 Winning number was ${winningIcon?.name || winningNumber}`, false);
          }
        }

        setWinnerIndex(winningIndex);
        setCurrentIcon(winningIcon);

        if (hasUserPlacedBet) {
          console.log("🎯 Showing result modal");
          setModalData({
            isWin,
            amount: winAmount,
            icon: winningIcon,
            betAmount: userBetAmount,
            winningNumber: winningNumber
          });
          setShowModal(true);

          setTimeout(() => setWinnerIndex(null), 3000);
          if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
          modalTimeoutRef.current = setTimeout(() => {
            setShowModal(false);
          }, 4000);
        }

        await fetchGameResults();
        return { isWin, winAmount };
      }
      return null;
    } catch (error) {
      console.error('Check Result Error:', error);
      return null;
    }
  };

  // ==================== DECLARE RESULT ====================
  const declareResult = async () => {
    if (isResultDeclaredRef.current) return;
    console.log("🎯 DECLARE RESULT CALLED");
    isResultDeclaredRef.current = true;
    setIsRoundActive(false);
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const result = await checkWinningResult();
    if (!result) {
      const savedBets = getBetsFromLocalStorage(roundGameId || gameIdRef.current);
      const hasUserPlacedBet = savedBets && savedBets.bets && savedBets.bets.length > 0;

      if (hasUserPlacedBet) {
        console.log("🎲 No API result, showing random result modal");
        const randomWinner = Math.floor(Math.random() * items.length);
        const winningIcon = items[randomWinner];
        const winnerBet = betAmounts[randomWinner];
        const winAmount = winnerBet * 9;
        setModalData({
          isWin: winnerBet > 0,
          amount: winAmount,
          icon: winningIcon,
          betAmount: winnerBet,
          winningNumber: winningIcon.emojiCode
        });
        setShowModal(true);
        setTimeout(() => setWinnerIndex(null), 3000);
        if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = setTimeout(() => {
          setShowModal(false);
        }, 4000);
      }
    }
  };

  // ==================== TIMER COUNTDOWN ====================
  useEffect(() => {
    // Clean up existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // If timer reached 0
    if (timeLeft <= 0) {
      console.log("🚨 TIMER REACHED 0!");
      
      if (!apiCallInProgressRef.current) {
        apiCallInProgressRef.current = true;
        
        // Declare result first
        declareResult();
        
        // Then refresh data
        setTimeout(() => {
          forceRefresh();
        }, 500);
        
        // Reset after some time
        setTimeout(() => {
          apiCallInProgressRef.current = false;
          resetRound();
        }, 3000);
      }
      return;
    }
    
    // Start new timer
    console.log("⏰ Starting timer with:", timeLeft);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // Check for last 10 seconds
        if (newTime === 10 && !last10ModalShownRef.current && !isResultDeclaredRef.current) {
          showLast10SecondsModal();
        }
        
        return newTime;
      });
    }, 1000);
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        console.log("🧹 Cleaning up timer");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft]);

  // ==================== API CALLS ====================
  const addBidToAPI = async (pid, totalDebitAmount, betNumbersString, perbitAmountsString, game, gameType, gameId, accType) => {
    try {
      const requestBody = {
        pid: Number(pid),
        debit: Number(totalDebitAmount),
        bet: betNumbersString,
        perbit: perbitAmountsString,
        game: String("1"),
        gameType: String("A"),
        gameId: String(gameId),
        accType: String("PLAYGAME")
      };
      const response = await apiClient.post('/Trading/AddBid', requestBody);
      return response.data;
    } catch (error) {
      console.error('AddBid Error:', error);
      throw error;
    }
  };

  const fetchGameResults = async () => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get('/Trading/game-result', {
        params: { PageIndex: 1, PageSize: 5 },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data?.success) {
        const results = response.data.data?.data || [];
        const history = results.map(result => {
          const matchedItem = items.find(item => item.emojiCode === result.betnumber);
          return {
            name: matchedItem ? matchedItem.name : result.betnumber,
            emoji: matchedItem ? matchedItem.emoji : '🎲',
            betnumber: result.betnumber
          };
        });
        setResultHistory(history);
      }
    } catch (error) {
      console.error('Fetch Results Error:', error);
    }
  };

  // ==================== BET PLACEMENT ====================
  const handlePlaceBet = async () => {
    if (isBettingLocked) {
      showToastMessage('⛔ Betting closed! Last 10 seconds remaining!', false);
      return;
    }
    if (!isRoundActive) {
      showToastMessage('⏳ Round ended! Next round starting soon...', false);
      return;
    }
    if (isPlacingBet) {
      showToastMessage('⏳ Please wait...', false);
      return;
    }

    const hasPreview = previewAmounts.some(amount => amount > 0);
    if (!hasPreview) {
      showToastMessage('⚠️ Please select at least one card!', false);
      return;
    }

    const selectedBets = [];
    for (let i = 0; i < previewAmounts.length; i++) {
      if (previewAmounts[i] > 0) {
        selectedBets.push({
          index: i,
          amount: previewAmounts[i],
          betNumber: items[i].emojiCode,
          name: items[i].name,
          emoji: items[i].emoji
        });
      }
    }

    const totalPreviewAmount = previewAmounts.reduce((sum, amount) => sum + amount, 0);
    const currentWallet = userData?.currentamt || 0;

    if (currentWallet < totalPreviewAmount) {
      showToastMessage(`⚠️ Insufficient balance! Need ₹${totalPreviewAmount}`, false);
      return;
    }

    setIsPlacingBet(true);
    try {
      const currentGameId = gameIdRef.current || gameId;
      const betNumbersString = selectedBets.map(bet => bet.betNumber).join(',');
      const perbitAmountsString = selectedBets.map(bet => bet.amount).join(',');

      const result = await addBidToAPI(
        Number(userData?.pid) || 1,
        totalPreviewAmount,
        betNumbersString,
        perbitAmountsString,
        "1",
        "A",
        String(currentGameId),
        "Play Game"
      );

      if (result?.success) {
        setRoundGameId(currentGameId);
        saveBetsToLocalStorage(currentGameId, selectedBets);
        gameIdRef.current = currentGameId;

        const newBetAmounts = [...betAmounts];
        let totalDeduction = 0;
        for (const bet of selectedBets) {
          newBetAmounts[bet.index] += bet.amount;
          totalDeduction += bet.amount;
        }
        setBetAmounts(newBetAmounts);
        setTotalBet(prev => prev + totalDeduction);
        setPreviewAmounts(Array(12).fill(0));
        setTimeout(() => refreshData(), 1000);
        showToastMessage(`✅ ${selectedBets.length} bets placed! Total: ₹${totalDeduction}`, true);
      } else {
        showToastMessage('❌ Failed to place bets.', false);
      }
    } catch (error) {
      console.error("Error placing bets:", error);
      showToastMessage('❌ API Error!', false);
    }
    setIsPlacingBet(false);
  };

  // ==================== SYNC USERDATA ====================
  useEffect(() => {
    if (userData) {
      console.log("📡 USERDATA UPDATED:", {
        gameid: userData.gameid,
        seconds: userData.seconds,
        currentamt: userData.currentamt
      });

      if (userData.gameid) {
        setGameId(userData.gameid);
        gameIdRef.current = userData.gameid;
      }

      if (userData.seconds !== undefined && userData.seconds !== null && userData.seconds > 0) {
        setTimeLeft(userData.seconds);
      }
    }
  }, [userData]);

  // ==================== INITIALIZE ====================
  useEffect(() => { 
    console.log("🚀 INITIALIZING DASHBOARD");
    fetchGameResults();
    const interval = setInterval(fetchGameResults, 20000);
    
    if (userData?.seconds && userData.seconds > 0) {
      setTimeLeft(userData.seconds);
    } else {
      setTimeLeft(60);
    }
    
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearInterval(timerRef.current);
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (last10IntervalRef.current) clearInterval(last10IntervalRef.current);
    };
  }, []);

  // ==================== UI HANDLERS ====================
  const handleCardClick = (index) => {
    if (isBettingLocked || !isRoundActive || isPlacingBet) {
      if (isBettingLocked) showToastMessage('⛔ Betting closed!', false);
      return;
    }

    if (previewAmounts[index] > 0) {
      const newPreviewAmounts = [...previewAmounts];
      newPreviewAmounts[index] = 0;
      setPreviewAmounts(newPreviewAmounts);
      showToastMessage(`✨ Removed from ${items[index].name}`, false);
    } else {
      const newPreviewAmounts = [...previewAmounts];
      newPreviewAmounts[index] = selectedAmount;
      setPreviewAmounts(newPreviewAmounts);
      showToastMessage(`✨ ₹${selectedAmount} on ${items[index].name}!`, true);
    }
  };

  // ==================== RENDER ====================
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
                  <div className="wallet-icon"><i className="bi bi-wallet2"></i></div>
                  <div className="wallet-info">
                    <span>WALLET BALANCE</span>
                    <h2 className="mb-0">₹{(userData?.currentamt || 0).toLocaleString('en-IN')}</h2>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="wallet-icon"><i className="bi bi-wallet2"></i></div>
                  <div className="wallet-info">
                    <span style={{ color: "#FFF" }}>BETTING AMOUNT</span>
                    <h2 className="mb-0" style={{ color: "#ffd700" }}>₹{(userData?.totbettingamt || 0).toLocaleString('en-IN')}</h2>
                  </div>
                </div>

                <Link to="/dashboard/withdraw">
                  <button className="btn btn-warning fw-bold py-2 px-4" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #ffd700, #ff8c00)', border: 'none' }}>
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

          {/* Game Grid */}
          <div className="game-grid-card">
            <div className="grid-header">
              <div className="header-left"><i className="bi bi-grid-3x3-gap-fill"></i><span>SELECT YOUR BET</span></div>
              <div className="bet-badge"><i className="bi bi-trophy"></i> 9x WIN</div>
            </div>
            <div className="grid-body">
              <div className="row g-3">
                {items.map((item, index) => (
                  <div key={item.id} className="col-4 col-md-3 col-lg-2">
                    <div
                      className={`game-card ${betAmounts[index] > 0 ? 'active' : ''} ${winnerIndex === index ? 'winner' : ''} ${previewAmounts[index] > 0 ? 'preview' : ''}`}
                      onClick={() => handleCardClick(index)}
                      style={{ cursor: (isBettingLocked || !isRoundActive || isPlacingBet) ? 'not-allowed' : 'pointer', opacity: (isBettingLocked || !isRoundActive || isPlacingBet) ? 0.5 : 1 }}
                    >
                      <div className="card-glow"></div>
                      <div className="card-emoji">{item.emoji}</div>
                      <div className="card-name">{item.name}</div>
                      {previewAmounts[index] > 0 && <div className="card-preview-amount">🎯 ₹{previewAmounts[index]}</div>}
                      {betAmounts[index] > 0 && <div className="card-bet">✅ ₹{betAmounts[index]}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bet Amount Selector */}
          <div className="bet-selector-card">
            <div className="selector-header01 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2"><i className="bi bi-cash-coin"></i><span>TOTAL BET</span></div>
              <div className="d-flex align-items-center gap-2">
                <div className="bet-icon"><i className="bi bi-cash-stack"></i></div>
                <div className="bet-info"><span>TOTAL BET</span><h2>₹{totalBet.toLocaleString()}</h2></div>
              </div>
            </div>
            <div className="selector-body">
              <div className="bet-buttons">
                {betOptions.map(amount => (
                  <button key={amount} className={`bet-btn ${selectedAmount === amount ? 'active' : ''}`} onClick={() => setSelectedAmount(amount)} disabled={isBettingLocked || !isRoundActive || isPlacingBet}>
                    ₹{amount}
                  </button>
                ))}
              </div>
              <div className="selected-info" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button className='bet-button' onClick={handlePlaceBet} disabled={isBettingLocked || !isRoundActive || isPlacingBet} style={{ padding: '12px 40px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #28a745, #20c997)', color: 'white', fontWeight: 'bold' }}>
                  {isPlacingBet ? '⏳ Placing Bets...' : '💰 Place Bet'}
                </button>
              </div>
            </div>
          </div>

          {/* Toast */}
          {showToast && <div className="center-toast"><div className="toast-content">{toastMessage}</div></div>}

          {/* Last 10 Seconds Modal */}
          {showLast10Modal && (
            <div className="modal-overlay">
              <div className="last10-modal-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                  <i className="bi bi-alarm" style={{ fontSize: '48px', color: '#ff4444' }}></i>
                  <h3 style={{ color: '#ff4444', margin: 0 }}>LAST 10 SECONDS!</h3>
                </div>
                <div className="last10-timer">{last10TimeLeft}</div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  margin: '20px 0',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(last10TimeLeft / 10) * 100}%`,
                    height: '100%',
                    background: '#ff4444',
                    borderRadius: '4px',
                    transition: 'width 1s linear'
                  }}></div>
                </div>
                <p style={{ color: 'white' }}>Betting Closed! Result coming soon...</p>
              </div>
            </div>
          )}

          {/* Win/Lose Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className={`modal-container ${modalData.isWin ? 'modal-win' : 'modal-lose'}`}>
                <div className="modal-header-custom">
                  {modalData.isWin ? <i className="bi bi-trophy-fill"></i> : <i className="bi bi-emoji-frown"></i>}
                  <h3>{modalData.isWin ? '🎉 YOU WIN! 🎉' : '😢 YOU LOSE 😢'}</h3>
                </div>
                <div className="modal-body-custom">
                  <div className="winner-emoji">{modalData.icon?.emoji}</div>
                  <h4 className='text01'>{modalData.icon?.name}</h4>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>#{modalData.winningNumber}</div>
                  {modalData.isWin && (
                    <>
                      <div style={{ fontSize: '16px', color: '#ccc', marginTop: '10px' }}>Bet Amount: ₹{modalData.betAmount}</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffd700', margin: '10px 0' }}>+ ₹{modalData.amount}</div>
                      <div style={{ fontSize: '14px', color: '#4ecdc4' }}>(9x Your Bet!)</div>
                    </>
                  )}
                  <p style={{ marginTop: '15px' }}>
                    {modalData.isWin ? `🎉 Congratulations! You won ₹${modalData.amount}! 🎉` : `😢 Better luck next time! Winning number was ${modalData.icon?.name || modalData.winningNumber} 😢`}
                  </p>
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