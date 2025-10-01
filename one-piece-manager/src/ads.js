class AdManager {
    constructor() {
        this.adBlockDetected = false;
        this.gamesPaused = false;
        this.adFrequency = {
            interstitial: 180000, // 3 minutos
            lastInterstitial: 0
        };
        
        this.init();
    }
    
    init() {
        // Detectar AdBlock
        this.detectAdBlock();
        
        // Setup de eventos
        this.setupEventListeners();
        
        console.log('🎯 Ad Manager inicializado');
    }
    
    detectAdBlock() {
        // Criar elemento de teste
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.position = 'absolute';
        testAd.style.left = '-10000px';
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                this.adBlockDetected = true;
                //this.showAdBlockMessage();
            }
            document.body.removeChild(testAd);
        }, 100);
    }
    
    showAdBlockMessage() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.8); z-index: 10000; 
                        display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 10px; 
                           text-align: center; color: black; max-width: 400px;">
                    <h3>🚫 AdBlock Detectado</h3>
                    <p>Para continuar jogando gratuitamente, por favor desative o AdBlock neste site.</p>
                    <p>Os anúncios nos ajudam a manter o jogo gratuito! 😊</p>
                    <button onclick="location.reload()" 
                            style="padding: 10px 20px; background: #4CAF50; 
                                   color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Recarregar Página
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showInterstitialAd() {
        const now = Date.now();
        
        // Verificar frequência
        if (now - this.adFrequency.lastInterstitial < this.adFrequency.interstitial) {
            return false;
        }
        
        // Pausar jogo
        this.pauseGame();
        
        // Criar overlay de ad
        const adOverlay = document.createElement('div');
        adOverlay.id = 'interstitial-overlay';
        adOverlay.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.9); z-index: 9999; 
                        display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; color: black;">
                    <h3>📺 Anúncio</h3>
                    <div id="interstitial-ad-space">
                        <!-- AdSense Interstitial aqui -->
                        <ins class="adsbygoogle"
                             style="display:block"
                             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                             data-ad-slot="XXXXXXXXXX"
                             data-ad-format="auto"></ins>
                    </div>
                    <button onclick="adManager.closeInterstitial()" 
                            style="margin-top: 15px; padding: 10px 20px; background: #f44336; 
                                   color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Fechar Anúncio (5s)
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(adOverlay);
        
        // Inicializar ad
        (adsbygoogle = window.adsbygoogle || []).push({});
        
        // Auto-close após 5 segundos
        setTimeout(() => {
            this.closeInterstitial();
        }, 5000);
        
        this.adFrequency.lastInterstitial = now;
        return true;
    }
    
    closeInterstitial() {
        const overlay = document.getElementById('interstitial-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.resumeGame();
    }
    
    showRewardedAd() {
        // Simular rewarded ad (você pode integrar com redes específicas)
        const rewardModal = document.createElement('div');
        rewardModal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.8); z-index: 10000; 
                        display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           padding: 30px; border-radius: 15px; text-align: center; color: white; max-width: 400px;">
                    <h3>💎 Ganhar Recompensa</h3>
                    <p>Assista a um anúncio de 30 segundos e ganhe:</p>
                    <div style="font-size: 24px; margin: 20px 0;">
                        🪙 100 Moedas<br>
                        ⚡ 1 Vida Extra<br>
                        🚀 Power-up Grátis
                    </div>
                    <button onclick="adManager.watchRewardedAd()" 
                            style="padding: 15px 25px; background: #4CAF50; 
                                   color: white; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
                        📺 Assistir Anúncio
                    </button>
                    <button onclick="adManager.closeRewardedModal()" 
                            style="padding: 15px 25px; background: #f44336; 
                                   color: white; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
                        ❌ Cancelar
                    </button>
                </div>
            </div>
        `;
        rewardModal.id = 'rewarded-modal';
        document.body.appendChild(rewardModal);
    }
    
    watchRewardedAd() {
        // Aqui você integraria com uma rede de rewarded ads
        // Por enquanto, vamos simular
        this.closeRewardedModal();
        
        // Simular loading do ad
        const loadingModal = document.createElement('div');
        loadingModal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.9); z-index: 10001; 
                        display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center; color: white;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; 
                               border-radius: 50%; width: 50px; height: 50px; 
                               animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <h3>📺 Carregando anúncio...</h3>
                    <p>Aguarde alguns segundos</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        loadingModal.id = 'ad-loading';
        document.body.appendChild(loadingModal);
        
        // Simular ad de 30 segundos
        setTimeout(() => {
            document.getElementById('ad-loading').remove();
            this.giveReward();
        }, 3000); // 3 segundos para demo
    }
    
    giveReward() {
        // Dar recompensas ao jogador
        if (window.gameInstance) {
            window.gameInstance.addCoins(100);
            window.gameInstance.addLife();
            window.gameInstance.addPowerUp('speed');
        }
        
        // Mostrar confirmação
        const successModal = document.createElement('div');
        successModal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.8); z-index: 10000; 
                        display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                           padding: 30px; border-radius: 15px; text-align: center; color: white; max-width: 400px;">
                    <h3>🎉 Recompensa Recebida!</h3>
                    <div style="font-size: 20px; margin: 20px 0;">
                        ✅ +100 Moedas<br>
                        ✅ +1 Vida<br>
                        ✅ Power-up Velocidade
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="padding: 15px 25px; background: white; 
                                   color: #4CAF50; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        🎮 Continuar Jogando
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(successModal);
    }
    
    closeRewardedModal() {
        const modal = document.getElementById('rewarded-modal');
        if (modal) modal.remove();
    }
    
    pauseGame() {
        this.gamesPaused = true;
        if (window.gameInstance && window.gameInstance.pause) {
            window.gameInstance.pause();
        }
    }
    
    resumeGame() {
        this.gamesPaused = false;
        if (window.gameInstance && window.gameInstance.resume) {
            window.gameInstance.resume();
        }
    }
    
    setupEventListeners() {
        // Mostrar interstitial quando jogador morre
        document.addEventListener('gameOver', () => {
            setTimeout(() => {
                this.showInterstitialAd();
            }, 1000);
        });
        
        // Mostrar interstitial ao completar fase
        document.addEventListener('levelComplete', () => {
            if (Math.random() < 0.4) { // 40% chance
                this.showInterstitialAd();
            }
        });
    }
}

// Inicializar quando página carregar
window.addEventListener('load', () => {
    window.adManager = new AdManager();
});

// Funções globais para o jogo
function showRewardedAd() {
    if (window.adManager) {
        window.adManager.showRewardedAd();
    }
}

function startGame() {
    // Sua lógica de iniciar jogo
    console.log('🎮 Jogo iniciado!');
}

function pauseGame() {
    if (window.adManager) {
        window.adManager.pauseGame();
    }
}