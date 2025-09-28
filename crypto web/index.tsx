/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

document.addEventListener('DOMContentLoaded', () => {
  const heroBg = document.getElementById('hero-bg');
  if (heroBg) {
    const images = [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1920&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489619241109-164c8c72a2b0?q=80&w=1920&auto=format&fit=crop'
    ];

    let currentIndex = 0;

    // Preload images for smoother transitions
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    
    // Set initial image
    heroBg.style.backgroundImage = `url('${images[currentIndex]}')`;

    setInterval(() => {
      heroBg.style.opacity = '0';

      setTimeout(() => {
        currentIndex = (currentIndex + 1) % images.length;
        heroBg.style.backgroundImage = `url('${images[currentIndex]}')`;
        heroBg.style.opacity = '1';
      }, 1000); // This should match the CSS transition duration
    }, 5000); // Change image every 5 seconds
  }

  // Real-time ticker logic
  const tickerContainer = document.getElementById('realtime-tickers');
  if (tickerContainer) {
      const assets = {
          'bitcoin': { symbol: 'BTC', logo: 'https://assets.coincap.io/assets/v2/svg/btc.svg', lastPrice: 0 },
          'ethereum': { symbol: 'ETH', logo: 'https://assets.coincap.io/assets/v2/svg/eth.svg', lastPrice: 0 },
          'dogecoin': { symbol: 'DOGE', logo: 'https://assets.coincap.io/assets/v2/svg/doge.svg', lastPrice: 0 }
      };

      // Create initial placeholder elements
      for (const assetId in assets) {
          const asset = assets[assetId];
          const tickerElement = document.createElement('div');
          tickerElement.className = "flex items-center space-x-2 p-2 rounded-full bg-white/10 backdrop-blur-sm";
          
          tickerElement.innerHTML = `
              <img src="${asset.logo}" alt="${asset.symbol} logo" class="w-6 h-6">
              <div>
                  <span class="font-bold">${asset.symbol}</span>
                  <span id="price-${assetId}" class="text-sm text-gray-300 ml-2 price-element">Loading...</span>
              </div>
          `;
          tickerContainer.appendChild(tickerElement);
      }

      const pricesWs = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,dogecoin');

      pricesWs.onmessage = function (msg) {
          const data = JSON.parse(msg.data);
          for (const assetId in data) {
              if (assets[assetId]) {
                  const priceElement = document.getElementById(`price-${assetId}`);
                  const newPrice = parseFloat(data[assetId]);
                  const oldPrice = assets[assetId].lastPrice;

                  if (priceElement) {
                      priceElement.textContent = newPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

                      if (oldPrice !== 0) {
                          if (newPrice > oldPrice) {
                              priceElement.classList.add('price-up');
                          } else if (newPrice < oldPrice) {
                              priceElement.classList.add('price-down');
                          }
                      }

                      setTimeout(() => {
                          priceElement.classList.remove('price-up', 'price-down');
                      }, 500);
                  }
                  assets[assetId].lastPrice = newPrice;
              }
          }
      };

      pricesWs.onerror = function(error) {
          console.error('WebSocket Error:', error);
          for (const assetId in assets) {
            const priceElement = document.getElementById(`price-${assetId}`);
            if (priceElement) {
              priceElement.textContent = "Error";
            }
          }
      };
  }
});