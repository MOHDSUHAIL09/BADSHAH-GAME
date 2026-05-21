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
  const [winningAmount, setWinningAmount] = useState(0);
  const [resultHistory, setResultHistory] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ isWin: false, amount: 0, icon: null, betAmount: 0 });
  const [showLast10Modal, setShowLast10Modal] = useState(false);
  const [last10TimeLeft, setLast10TimeLeft] = useState(10);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIcon, setCurrentIcon] = useState(null);
  const [isBettingLocked, setIsBettingLocked] = useState(false);
  const [gameId, setGameId] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [dashboardApiCalled, setDashboardApiCalled] = useState(false); // Track if API called

  // ==================== REFS ====================
  const last10ModalShownRef = useRef(false);
  const timerRef = useRef(null);
  const isResultDeclaredRef = useRef(false);
  const modalTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const gameIdRef = useRef('');
  const dashboardApiCalledRef = useRef(false); // Ref for API call tracking

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

  // ==================== LOCAL STORAGE FUNCTIONS ====================
  const saveBetsToLocalStorage = (gameId, bets) => {
    const betData = {
      gameId: gameId,
      timestamp: new Date().toISOString(),
      bets: bets,
      totalAmount: bets.reduce((sum, b) => sum + b.amount, 0)
    };
    localStorage.setItem(`bets_${gameId}`, JSON.stringify(betData));
    console.log("💾 Bets saved to localStorage for game:", gameId);
  };

  const getBetsFromLocalStorage = (gameId) => {
    const data = localStorage.getItem(`bets_${gameId}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  };

  // ==================== HELPER FUNCTIONS ====================
  const getAuthToken = () => localStorage.getItem('token') || '';
  
  const showToastMessage = (message, isSuccess = true) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000);
  };

  const formatSeconds = (seconds) => {
    const secs = seconds % 60;
    return secs.toString().padStart(2, '0');
  };

  // ==================== DASHBOARD API CALL AT LAST 10 SECONDS ====================
  const callDashboardAPIAtLast10Seconds = async () => {
    if (dashboardApiCalledRef.current) {
      console.log("⏭️ Dashboard API already called for this round");
      return;
    }
    
    console.log("🔄 Calling Dashboard API at last 10 seconds...", new Date().toLocaleTimeString());
    dashboardApiCalledRef.current = true;
    setDashboardApiCalled(true);
    
    try {
      await forceRefresh(); // Call the context method
      console.log("✅ Dashboard API call completed - Balance updated");
    } catch (error) {
      console.error("❌ Dashboard API call failed:", error);
    }
  };

  // ==================== LAST 10 SECONDS MODAL WITH API CALL ====================
  const showLast10SecondsModal = () => {
    if (last10ModalShownRef.current) return;
    console.log("🔔 Last 10 seconds! Calling Dashboard API...");
    last10ModalShownRef.current = true;
    setIsBettingLocked(true);
    setLast10TimeLeft(10);
    setShowLast10Modal(true);
    
    // ✅ Call Dashboard API immediately when last 10 seconds start
    callDashboardAPIAtLast10Seconds();
    
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
      console.log("📤 Sending bet to API:", requestBody);
      const response = await apiClient.post('/Trading/AddBid', requestBody);
      console.log("📥 API Response:", response.data);
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
        headers: { 'Accept': '*/*', 'Authorization': `Bearer ${token}` }
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

  // ==================== CHECK WINNING RESULT ====================
  const checkWinningResult = async () => {
    try {
      const token = getAuthToken();
      const response = await apiClient.get('/Trading/game-result', {
        params: { PageIndex: 1, PageSize: 50 },
        headers: { 'Accept': '*/*', 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const results = response.data.data?.data || [];       
        const currentGameId = gameIdRef.current;     
        if (!currentGameId) {     
          return null;
        }       
        const myGameResult = results.find(r => r.gameid === currentGameId);       
        if (!myGameResult) {      
          return null;
        }       
        const winningNumber = myGameResult.betnumber;
        console.log("🏆 Winning Number:", winningNumber);
        
        if (!winningNumber || winningNumber === null) {
          console.log("⏳ Game result not ready yet (betnumber is null)");
          return null;
        }
        
        const savedBets = getBetsFromLocalStorage(currentGameId);
        console.log("📦 Saved bets:", savedBets);
        let isWin = false;
        let winAmount = 0;
        let userBetAmount = 0;
        const winningIndex = items.findIndex(item => item.emojiCode === winningNumber);
        const winningIcon = winningIndex !== -1 ? items[winningIndex] : null;
        
        if (savedBets && savedBets.bets) {
          const matchedBet = savedBets.bets.find(bet => bet.betNumber === winningNumber);
          if (matchedBet) {
            isWin = true;
            userBetAmount = matchedBet.amount;
            winAmount = userBetAmount * 9;
            console.log("🎉 WIN! Bet matched");
            showToastMessage(`🎉 You won ₹${winAmount}! (9x)`, true);
            setTimeout(() => refreshData(), 500);
          } else {
            console.log("😢 LOSE! No bet on", winningNumber);
            showToastMessage(`😢 Winning number was ${winningIcon?.name || winningNumber}`, false);
          }
        }
        
        setWinnerIndex(winningIndex);
        setCurrentIcon(winningIcon);
        setModalData({ 
          isWin, 
          amount: winAmount, 
          icon: winningIcon, 
          betAmount: userBetAmount,
          winningNumber: winningNumber
        });
        setShowModal(true);
        await fetchGameResults();
        
        setTimeout(() => setWinnerIndex(null), 3000);
        if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = setTimeout(() => {
          setShowModal(false);
          startNewRound();
        }, 4000);
        
        return { isWin, winAmount };
      }
      return null;
    } catch (error) {
      console.error('Check Result Error:', error);
      return null;
    }
  };

  // ==================== START NEW ROUND ====================
  const startNewRound = () => {
    console.log("========== STARTING NEW ROUND ==========");
    
    setBetAmounts(Array(12).fill(0));
    setPreviewAmounts(Array(12).fill(0));
    setTotalBet(0);
    setWinnerIndex(null);
    setCurrentIcon(null);
    setIsBettingLocked(false);
    isResultDeclaredRef.current = false;
    last10ModalShownRef.current = false;
    dashboardApiCalledRef.current = false; // ✅ Reset API call flag for new round
    setDashboardApiCalled(false);
    setShowLast10Modal(false);
    setTimeLeft(60);
    setIsRoundActive(true);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        // ✅ When timer hits 10 seconds, show modal and call API
        if (prev === 11 && !last10ModalShownRef.current && !isResultDeclaredRef.current) {
          showLast10SecondsModal();
        }
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!isResultDeclaredRef.current) {
            declareResult();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
      showToastMessage('⏳ Please wait, placing bets...', false);
      return;
    }

    const hasPreview = previewAmounts.some(amount => amount > 0);
    if (!hasPreview) {
      showToastMessage('⚠️ Please select at least one card first!', false);
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
    const betNumbersString = selectedBets.map(bet => bet.betNumber).join(',');
    const perbitAmountsString = selectedBets.map(bet => bet.amount).join(',');

    if (currentWallet < totalPreviewAmount) {
      showToastMessage(`⚠️ Insufficient balance! Need ₹${totalPreviewAmount}`, false);
      return;
    }

    setIsPlacingBet(true);
    try {
      const currentGameId = gameIdRef.current || gameId;
      console.log("🎮 Placing bet for game ID:", currentGameId);
      
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
        const betsToSave = selectedBets.map(bet => ({
          betNumber: bet.betNumber,
          amount: bet.amount,
          name: bet.name,
          emoji: bet.emoji
        }));
        
        saveBetsToLocalStorage(currentGameId, betsToSave);
        gameIdRef.current = currentGameId;
        
        const newBetAmounts = [...betAmounts];
        let totalDeduction = 0;
        for (const bet of selectedBets) {
          newBetAmounts[bet.index] += bet.amount;
          totalDeduction += bet.amount;
        }
        setBetAmounts(newBetAmounts);
        setTotalBet(totalBet + totalDeduction);
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

  // ==================== DECLARE RESULT ====================
  const declareResult = async () => {
    if (isResultDeclaredRef.current) return;
    isResultDeclaredRef.current = true;
    setIsRoundActive(false);
    
    const result = await checkWinningResult();
    if (!result) {
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
        startNewRound();
      }, 4000);
    }
  };

  // ==================== SYNC TIMER AND GAME ID FROM API ====================
  useEffect(() => {
    if (userData) {
      if (userData.seconds) {
        setTimeLeft(userData.seconds);
      }
      if (userData.gameid) {
        setGameId(userData.gameid);
        gameIdRef.current = userData.gameid;
        setIsUserDataLoaded(true);
        console.log("🎮 Game ID synced from API:", userData.gameid);
      }
    }
  }, [userData]);

  // ==================== INITIALIZE ====================
  useEffect(() => {
    fetchGameResults();
    startNewRound();
    const interval = setInterval(fetchGameResults, 20000);
    return () => {
      clearInterval(interval);
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
    if (!isRoundActive) {
      showToastMessage('⏳ Round ended! Next round starting soon...', false);
      return;
    }
    if (previewAmounts[index] > 0) {
      const newPreviewAmounts = [...previewAmounts];
      newPreviewAmounts[index] = 0;
      setPreviewAmounts(newPreviewAmounts);
      showToastMessage(`✨ Preview removed from ${items[index].name}`, false);
    } else {
      const newPreviewAmounts = [...previewAmounts];
      newPreviewAmounts[index] = selectedAmount;
      setPreviewAmounts(newPreviewAmounts);
      showToastMessage(`✨ ₹${selectedAmount} preview on ${items[index].name}!`, true);
    }
  };

  // ==================== RENDER UI ====================
  return (
    <div className='game-container'>
      <div className="animated-bg"></div>
      <div className="particles"></div>
      <div className="container py-4">
        <div className="container">
          
          {/* Wallet Cards - Shows Updated Balance */}
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
                        <span>GAME ID: {gameId || 'LOADING'}</span>
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

          {/* Toast Notification */}
          {showToast && <div className="center-toast"><div className="toast-content">{toastMessage}</div></div>}

          {/* Last 10 Seconds Modal - Dashboard API Call happens here */}
          {showLast10Modal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              backdropFilter: 'blur(5px)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #2a1a1a, #1a0a0a)',
                border: '3px solid #ff4444',
                borderRadius: '20px',
                padding: '30px',
                minWidth: '320px',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                  <i className="bi bi-alarm" style={{ fontSize: '48px', color: '#ff4444' }}></i>
                  <h3 style={{ color: '#ff4444', margin: 0 }}>LAST 10 SECONDS!</h3>
                </div>
                <div style={{ fontSize: '60px', fontWeight: 'bold', color: '#ff4444', margin: '20px 0' }}>{last10TimeLeft}</div>
                <p style={{ color: 'white' }}>Betting Closed! Result coming soon...</p>
                {dashboardApiCalled && (
                  <p style={{ color: '#4caf50', fontSize: '12px', marginTop: '10px' }}>
                    ✅ Balance updated
                  </p>
                )}
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
