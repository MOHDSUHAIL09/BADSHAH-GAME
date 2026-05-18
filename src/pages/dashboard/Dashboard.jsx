import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useUser } from '../../context/UserContext';
import './Dashboard.css';

const Dashboard = () => {
  const { userData, refreshData } = useUser();

  // States
  const [totalBet, setTotalBet] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [betAmounts, setBetAmounts] = useState(Array(12).fill(0));
  const [previewAmounts, setPreviewAmounts] = useState(Array(12).fill(0));
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [winningAmount, setWinningAmount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIcon, setCurrentIcon] = useState(null);
  const [resultHistory, setResultHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ isWin: false, amount: 0, icon: null });
  const [showLast10Modal, setShowLast10Modal] = useState(false);
  const [last10TimeLeft, setLast10TimeLeft] = useState(10);
  const [isBettingLocked, setIsBettingLocked] = useState(false);
  const [gameId, setGameId] = useState('');

  const last10ModalShownRef = useRef(false);
  const timerRef = useRef(null);
  const isResultDeclaredRef = useRef(false);
  const modalTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Items
  const items = [
    { id: 0, name: 'Umbrella', emoji: '☂️', value: 50, color: '#ff6b6b' },
    { id: 1, name: 'Ball', emoji: '⚽', value: 45, color: '#4ecdc4' },
    { id: 2, name: 'Sun', emoji: '☀️', value: 40, color: '#ffe66d' },
    { id: 3, name: 'Depak', emoji: '🪔', value: 55, color: '#ff9f43' },
    { id: 4, name: 'Cow', emoji: '🐮', value: 35, color: '#a8e6cf' },
    { id: 5, name: 'Bukett', emoji: '💐', value: 30, color: '#ff8da1' },
    { id: 6, name: 'Kite', emoji: '🪁', value: 60, color: '#6c5ce7' },
    { id: 7, name: 'Spaceship', emoji: '🚀', value: 45, color: '#00cec9' },
    { id: 8, name: 'Rose', emoji: '🌹', value: 50, color: '#fd79a8' },
    { id: 9, name: 'Butterfly', emoji: '🦋', value: 40, color: '#a29bfe' },
    { id: 10, name: 'Bird', emoji: '🐦', value: 45, color: '#fdcb6e' },
    { id: 11, name: 'Hen', emoji: '🐔', value: 30, color: '#e17055' }
  ];

  const betOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];

  // ✅ Sync data from API - YAHI SE TIME SET HOGA
  useEffect(() => {
    if (userData) {
      // Time set from API
      if (userData.seconds && userData.seconds > 0 && userData.seconds <= 60) {
        setTimeLeft(userData.seconds);
      }     
      // Game ID set from API
      if (userData.gameid) {
        setGameId(userData.gameid);
      }
    }
  }, [userData]);

  // Show toast message
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

  const handlePlaceBet = () => {
    if (isBettingLocked) {
      showToastMessage('⛔ Betting closed! Last 10 seconds remaining!', false);
      return;
    }
    if (isResultDeclaredRef.current) {
      showToastMessage('⏳ Please wait for next round!', false);
      return;
    }

    const hasPreview = previewAmounts.some(amount => amount > 0);
    if (!hasPreview) {
      showToastMessage('⚠️ Please select at least one card first!', false);
      return;
    }

    const totalPreviewAmount = previewAmounts.reduce((sum, amount) => sum + amount, 0);
    const currentWallet = userData?.currentamt || 0;

    if (currentWallet < totalPreviewAmount) {
      showToastMessage(`⚠️ Insufficient balance! Need ₹${totalPreviewAmount} but have ₹${currentWallet}`, false);
      return;
    }

    const newBetAmounts = [...betAmounts];
    let totalDeduction = 0;

    for (let i = 0; i < previewAmounts.length; i++) {
      if (previewAmounts[i] > 0) {
        newBetAmounts[i] += previewAmounts[i];
        totalDeduction += previewAmounts[i];
      }
    }

    setBetAmounts(newBetAmounts);
    setTotalBet(totalBet + totalDeduction);
    setPreviewAmounts(Array(12).fill(0));

    // Refresh data to update wallet
    setTimeout(() => refreshData(), 500);
    showToastMessage(`✅ Bets placed! Total: ₹${totalDeduction}`, true);
  };

  const clearAllPreviews = () => {
    setPreviewAmounts(Array(12).fill(0));
    showToastMessage(`🗑️ All previews cleared!`, false);
  };

  return (
    <div className='game-container'>
      <div className="animated-bg"></div>
      <div className="particles"></div>

      <div className="container-fluid py-4">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="glow-header">
              <h1 className="main-title">
                <span className="title-gradient01">⚡ BADSHAH GAME ⚡</span>
              </h1>
              <p className="subtitle">Badshah 1 Minute | Bet & Win 9x Big!</p>
            </div>
          </div>

          {/* Wallet Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-12">
              <div className="wallet-card-new">
                <div className="wallet-icon">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div className="wallet-info">
                  <span>WALLET BALANCE</span>
                  <h2>₹{(userData?.currentamt || 0).toLocaleString()}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Timer & Results Row */}
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
                        <span>GAME ID: { userData?.gameid || 'LOADING'}</span>
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
                      style={{ cursor: (isBettingLocked || isResultDeclaredRef.current) ? 'not-allowed' : 'pointer', opacity: (isBettingLocked || isResultDeclaredRef.current) ? 0.5 : 1 }}
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
                    disabled={isBettingLocked || isResultDeclaredRef.current}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
              <div className="selected-info" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  className='bet-button'
                  onClick={handlePlaceBet}
                  disabled={isBettingLocked || isResultDeclaredRef.current}
                >
                  Place Bet
                </button>
              </div>
            </div>
          </div>

          {/* Center Toast Message */}
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
                <button className="modal-close" onClick={() => setShowLast10Modal(false)}>Close</button>
              </div>
            </div>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className={`modal-container ${modalData.isWin ? 'modal-win' : 'modal-lose'}`}>
                <div className="modal-header-custom">
                  {modalData.isWin ? <i className="bi bi-trophy-fill"></i> : <i className="bi bi-emoji-frown"></i>}
                  <h3>{modalData.isWin ? 'YOU WIN!' : 'GAME OVER'}</h3>
                </div>
                <div className="modal-body-custom">
                  <div className="winner-emoji">{modalData.icon?.emoji}</div>
                  <h4>{modalData.icon?.name}</h4>
                  {modalData.isWin && (
                    <div className="win-amount">+ ₹{modalData.amount}</div>
                  )}
                  <p>{modalData.isWin ? '9x Congratulations! You won big!' : 'Better luck next time!'}</p>
                </div>
                <button className="modal-close" onClick={() => {
                  setShowModal(false);
                  resetAfterResult();
                }}>Play Next Round</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;