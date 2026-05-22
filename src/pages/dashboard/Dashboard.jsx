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
  const [closeBetCalled, setCloseBetCalled] = useState(false);

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
    { id: 3, name: 'Diya', emoji: '🪔', emojiCode: '4', value: 55, color: '#ff9f43' },
    { id: 4, name: 'Cow', emoji: '🐮', emojiCode: '5', value: 35, color: '#a8e6cf' },
    { id: 5, name: 'Bouquet', emoji: '💐', emojiCode: '6', value: 30, color: '#ff8da1' },
    { id: 6, name: 'Kite', emoji: '🪁', emojiCode: '7', value: 60, color: '#6c5ce7' },
    { id: 7, name: 'Rocket', emoji: '🚀', emojiCode: '8', value: 45, color: '#00cec9' },
    { id: 8, name: 'Rose', emoji: '🌹', emojiCode: '9', value: 50, color: '#fd79a8' },
    { id: 9, name: 'Butterfly', emoji: '🦋', emojiCode: '10', value: 40, color: '#a29bfe' },
    { id: 10, name: 'Bird', emoji: '🐦', emojiCode: '11', value: 45, color: '#fdcb6e' },
    { id: 11, name: 'Hen', emoji: '🐔', emojiCode: '12', value: 30, color: '#e17055' }
  ];

  const betOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];

  // ==================== CLOSE BET API CALL ====================
  const closeBetAPI = async (gameId) => {
    try {
      const token = getAuthToken();
      const requestBody = {
        currency: "string",
        currentCurrencyRate: 0,
        unique_id: String(gameId)
      };


      const response = await apiClient.post('/Trading/CloseBet', requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      if (response.data?.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // ==================== LOCAL STORAGE ====================
  const saveBetsToLocalStorage = (gameId, bets) => {
    const betData = {
      gameId: gameId,
      timestamp: new Date().toISOString(),
      bets: bets,
      totalAmount: bets.reduce((sum, b) => sum + b.amount, 0)
    };
    localStorage.setItem(`bets_${gameId}`, JSON.stringify(betData));
  };

  const getBetsFromLocalStorage = (gameId) => {
    const data = localStorage.getItem(`bets_${gameId}`);
    return data ? JSON.parse(data) : null;
  };

  // ==================== LAST 10 SECONDS MODAL ====================
  const showLast10SecondsModal = () => {
    if (last10ModalShownRef.current) return;
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
    setCloseBetCalled(false);

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
        params: { PageIndex: 1, PageSize: 10 },
        headers: { 'Authorization': `Bearer ${token}` }
      });



      if (response.data?.success) {
        const results = response.data.data?.data || [];
        const currentGameId = roundGameId || gameIdRef.current;

        if (!currentGameId) return null;
        // Convert both to string for comparison
        const myGameResult = results.find(r => String(r.gameid) === String(currentGameId));
        if (!myGameResult) return null;
        const winningNumber = myGameResult.betnumber;
        if (!winningNumber) return null;

        const savedBets = getBetsFromLocalStorage(currentGameId);

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
            showToastMessage(`🎉 You won ₹${winAmount}!`, true);
            setTimeout(() => refreshData(), 500);
          } else if (hasUserPlacedBet) {
            showToastMessage(`Winning number was ${winningIcon?.name || winningNumber}`, false);
          }
        }

        setWinnerIndex(winningIndex);
        setCurrentIcon(winningIcon);

        if (hasUserPlacedBet) {
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
      return null;
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

      if (!apiCallInProgressRef.current) {
        apiCallInProgressRef.current = true;

        // Call game-result API at 0 seconds
        const getResultAtZero = async () => {
          const result = await checkWinningResult();

          if (!result) {
            const currentGameId = roundGameId || gameIdRef.current || gameId;
            const savedBets = getBetsFromLocalStorage(currentGameId);
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

          // Refresh data after result
          setTimeout(() => {
            forceRefresh();
          }, 500);

          // Reset after some time
          setTimeout(() => {
            apiCallInProgressRef.current = false;
            resetRound();
          }, 3000);
        };

        getResultAtZero();
      }
      return;
    }

    // Check for exactly 10 seconds - Call CloseBet API
    if (timeLeft === 10 && !closeBetCalled && !isResultDeclaredRef.current) {

      // Call CloseBet API
      const currentGameId = roundGameId || gameIdRef.current || gameId;

      if (currentGameId) {
        setCloseBetCalled(true);
        closeBetAPI(currentGameId).then(success => {
          if (success) {
          }
        });
      } else {
        console.log("⚠️ No Game ID available for CloseBet API");
      }

      // Show the last 10 seconds modal
      showLast10SecondsModal();
    }

    // Start new timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        return newTime;
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
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
            <div className="col-12 col-md-6 col-sm-12">
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
                    <h2 className="mb-0" style={{ color: "#ffd700" }}>₹{(userData?.currentAmount || 0).toLocaleString('en-IN')}</h2>
                  </div>
                </div>

              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="wallet-card-new d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="timer-digits-box">
                  <span style={{ fontWeight: "900", fontSize: "16px" }}>{formatSeconds(timeLeft)}</span>
                </div>
                <div className="timer-digits-box">
                  <span>GAME ID: {gameId || userData?.gameid || 'LOADING'}</span>
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
          <div className="col-12 col-md-12 col-sm-6">
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

          {/* Toast */}
          {showToast && <div className="center-toast"><div className="toast-content">{toastMessage}</div></div>}

          {/* Last 10 Seconds Modal */}
 {/* Last 10 Seconds Modal */}
{showLast10Modal && (
  <div className="modal-overlay" style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    backdropFilter: 'blur(10px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'modalFadeIn 0.3s ease'
  }}>
    <div style={{
      width: '90%',
      maxWidth: '380px',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f0f23)',
      borderRadius: '28px',
      padding: '30px 24px',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,68,68,0.3), 0 0 30px rgba(255,68,68,0.2)',
      border: '1px solid rgba(255,68,68,0.3)',
      animation: 'modalPopIn 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)'
    }}>
      
      {/* Warning Icon with Pulse Animation */}
      <div style={{
        width: '90px',
        height: '90px',
        background: 'linear-gradient(135deg, #ff4444, #cc0000)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 0 30px rgba(255,68,68,0.6)',
        animation: 'pulseWarning 1.5s infinite'
      }}>
        <i className="bi bi-alarm" style={{ fontSize: '50px', color: '#fff' }}></i>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '0 0 8px',
        background: 'linear-gradient(135deg, #ff4444, #ff6b6b)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        LAST 10 SECONDS!
      </h3>
      
      <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '14px',
        marginBottom: '25px'
      }}>
        Betting is now closed
      </p>

      {/* Timer Circle */}
      <div style={{
        position: 'relative',
        width: '150px',
        height: '150px',
        margin: '0 auto 25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* SVG Circle Timer */}
        <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle
            cx="75"
            cy="75"
            r="68"
            fill="none"
            stroke="rgba(255,68,68,0.2)"
            strokeWidth="6"
          />
          <circle
            cx="75"
            cy="75"
            r="68"
            fill="none"
            stroke="#ff4444"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 68}`}
            strokeDashoffset={`${2 * Math.PI * 68 * (1 - last10TimeLeft / 10)}`}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 1s linear'
            }}
          />
        </svg>
        <div style={{
          width: '120px',
          height: '120px',
          background: 'rgba(255,68,68,0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255,68,68,0.3)'
        }}>
          <span style={{
            fontSize: '52px',
            fontWeight: 'bold',
            color: '#ff4444',
            textShadow: '0 0 20px rgba(255,68,68,0.5)'
          }}>
            {last10TimeLeft}
          </span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '50px',
        height: '50px',
        background: 'radial-gradient(circle, rgba(255,68,68,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '80px',
        height: '80px',
        background: 'radial-gradient(circle, rgba(255,68,68,0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
    </div>
  </div>
)}



          {/* Win/Lose Modal */}
          {showModal && (
            <div className="modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'modalFadeIn 0.3s ease'
            }}>
              <div className={`modal-container ${modalData.isWin ? 'modal-win' : 'modal-lose'}`} style={{
                width: '90%',
                maxWidth: '400px',
                background: modalData.isWin
                  ? 'linear-gradient(135deg, #0f2e1a, #1a472a, #0d2818)'
                  : 'linear-gradient(135deg, #2a1a1a, #3d1a1a, #2a0f0f)',
                borderRadius: '24px',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: modalData.isWin
                  ? '0 20px 40px rgba(0,255,0,0.2), 0 0 20px rgba(76,175,80,0.3)'
                  : '0 20px 40px rgba(255,0,0,0.15)',
                border: modalData.isWin
                  ? '1px solid rgba(76, 175, 80, 0.5)'
                  : '1px solid rgba(255, 68, 68, 0.5)',
                transform: 'scale(1)',
                animation: 'modalPopIn 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)'
              }}>

                {/* Close Button */}
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                >
                  <i className="bi bi-x-lg" style={{ fontSize: '14px' }}></i>
                </button>

                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                  {modalData.isWin ? (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 15px',
                      boxShadow: '0 0 30px rgba(255,215,0,0.5)'
                    }}>
                      <i className="bi bi-trophy-fill" style={{ fontSize: '45px', color: '#fff' }}></i>
                    </div>
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 15px'
                    }}>
                      <i className="bi bi-emoji-frown" style={{ fontSize: '45px', color: '#fff' }}></i>
                    </div>
                  )}
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    margin: 0,
                    background: modalData.isWin
                      ? 'linear-gradient(135deg, #ffd700, #ff8c00)'
                      : 'linear-gradient(135deg, #ff6b6b, #ff4444)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {modalData.isWin ? 'YOU WIN!' : 'YOU LOSE'}
                  </h3>
                </div>

                {/* Body */}
                <div style={{ marginBottom: '20px' }}>
                  {/* Winner Emoji */}
                  <div style={{
                    fontSize: '80px',
                    marginBottom: '10px',
                    animation: 'winnerBounce 0.5s ease'
                  }}>
                    {modalData.icon?.emoji || '🎲'}
                  </div>

                  {/* Winner Name */}
                  <h4 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: '5px 0',
                    background: modalData.isWin
                      ? 'linear-gradient(135deg, #4caf50, #8bc34a)'
                      : 'linear-gradient(135deg, #ff6b6b, #ff4444)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {modalData.icon?.name || modalData.winningNumber}
                  </h4>

                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '15px'
                  }}>
                    #{modalData.winningNumber}
                  </div>

                  {modalData.isWin && (
                    <div style={{
                      background: 'rgba(76, 175, 80, 0.15)',
                      borderRadius: '16px',
                      padding: '15px',
                      margin: '10px 0',
                      border: '1px solid rgba(76, 175, 80, 0.3)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                        padding: '0 10px'
                      }}>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Bet Amount:</span>
                        <span style={{ color: '#ffd700', fontSize: '18px', fontWeight: 'bold' }}>₹{modalData.betAmount}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 10px'
                      }}>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Win Amount:</span>
                        <div>
                          <span style={{ color: '#4caf50', fontSize: '28px', fontWeight: 'bold' }}>+₹{modalData.amount}</span>
                          <span style={{ color: '#8bc34a', fontSize: '12px', marginLeft: '8px' }}>(9x)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                <p style={{
                  marginTop: '15px',
                  marginBottom: 0,
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {modalData.isWin
                    ? `Amazing! You won ₹${modalData.amount}! Keep playing! 🎉`
                    : `Better luck next time! Winning number was ${modalData.icon?.name || modalData.winningNumber} 😢`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 