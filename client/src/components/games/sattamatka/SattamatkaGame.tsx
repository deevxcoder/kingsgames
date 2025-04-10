import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useWebSocket } from '@/lib/websocket';
import { Loader2 } from 'lucide-react';
import JodiGame from './GameTypes/JodiGame';
import OddEvenGame from './GameTypes/OddEvenGame';
import HurfGame from './GameTypes/HurfGame';
import CrossGame from './GameTypes/CrossGame';
import BetHistory from '@/components/betting/BetHistory';
import { Button } from '@/components/ui/button';

type Market = {
  id: number;
  name: string;
  isOpen: boolean;
  closingTime: string;
  lastResult: string | null;
  lastResultTimestamp: string | null;
};

type MarketGameType = {
  id: number;
  marketId: number;
  gameTypeId: number;
  odds: number;
  gameType: {
    id: number;
    name: string;
    description: string;
    odds: number;
  };
};

const SattamatkaGame: React.FC = () => {
  const { user } = useAuth();
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<string>('Jodi');
  const { addMessageListener } = useWebSocket();
  
  // Fetch markets
  const { 
    data: markets = [], 
    isLoading: isLoadingMarkets,
    refetch: refetchMarkets
  } = useQuery({
    queryKey: ['/api/markets'],
  });
  
  // Fetch game types for selected market
  const { 
    data: marketGameTypes = [], 
    isLoading: isLoadingGameTypes,
    refetch: refetchGameTypes
  } = useQuery({
    queryKey: ['/api/markets', selectedMarketId, 'game-types'],
    enabled: !!selectedMarketId,
  });
  
  useEffect(() => {
    // Set first market as selected by default
    if (markets.length > 0 && !selectedMarketId) {
      setSelectedMarketId(markets[0].id);
    }
  }, [markets, selectedMarketId]);
  
  useEffect(() => {
    // Listen for market updates from WebSocket
    const removeMarketUpdateListener = addMessageListener('marketUpdated', () => {
      refetchMarkets();
    });
    
    // Listen for market result declarations
    const removeMarketResultListener = addMessageListener('marketResult', () => {
      refetchMarkets();
    });
    
    return () => {
      removeMarketUpdateListener();
      removeMarketResultListener();
    };
  }, [addMessageListener, refetchMarkets]);
  
  const handleSelectMarket = (marketId: number) => {
    setSelectedMarketId(marketId);
  };
  
  const handleSelectGameType = (gameType: string) => {
    setSelectedGameType(gameType);
  };
  
  const selectedMarket = markets.find((market: Market) => market.id === selectedMarketId);
  
  const renderRemainingTime = (closingTime: string) => {
    const now = new Date();
    const closing = new Date(closingTime);
    const diff = closing.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Closed';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const formatLastResultTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const resultTime = new Date(timestamp);
    const diff = now.getTime() - resultTime.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return `${minutes}m ago`;
    }
  };
  
  const getGameTypeComponent = () => {
    if (!selectedMarketId) return null;
    
    const gameTypeObj = marketGameTypes.find((gt: MarketGameType) => gt.gameType.name === selectedGameType);
    
    if (!gameTypeObj) return null;
    
    switch (selectedGameType) {
      case 'Jodi':
        return <JodiGame marketId={selectedMarketId} gameTypeId={gameTypeObj.gameTypeId} odds={gameTypeObj.odds} />;
      case 'Odd-Even':
        return <OddEvenGame marketId={selectedMarketId} gameTypeId={gameTypeObj.gameTypeId} odds={gameTypeObj.odds} />;
      case 'Hurf':
        return <HurfGame marketId={selectedMarketId} gameTypeId={gameTypeObj.gameTypeId} odds={gameTypeObj.odds} />;
      case 'Cross':
        return <CrossGame marketId={selectedMarketId} gameTypeId={gameTypeObj.gameTypeId} odds={gameTypeObj.odds} />;
      default:
        return null;
    }
  };
  
  if (isLoadingMarkets) {
    return (
      <div className="bg-primary-lighter rounded-xl p-6 flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }
  
  return (
    <div className="bg-primary-lighter rounded-xl p-6">
      {/* Market Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Select Market</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {markets.map((market: Market) => (
            <Button
              key={market.id}
              className={`bet-button py-3 px-4 rounded-lg ${
                selectedMarketId === market.id
                  ? 'bg-accent text-white font-medium hover:bg-accent-darker'
                  : 'bg-primary border border-primary-lighter text-white font-medium hover:border-accent'
              }`}
              onClick={() => handleSelectMarket(market.id)}
              disabled={!market.isOpen}
            >
              {market.name}
              {!market.isOpen && (
                <span className="ml-2 text-xs bg-danger bg-opacity-20 text-danger px-1 py-0.5 rounded">
                  Closed
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
      
      {selectedMarket && (
        <>
          {/* Market Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-4 bg-primary rounded-lg">
            <div>
              <h4 className="font-medium text-lg">{selectedMarket.name}</h4>
              <div className="flex items-center mt-1">
                {selectedMarket.isOpen ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-success mr-2"></span>
                    <span className="text-sm text-textSecondary">
                      Open • Closes in <span className="text-warning">
                        {renderRemainingTime(selectedMarket.closingTime)}
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-danger mr-2"></span>
                    <span className="text-sm text-textSecondary">Closed</span>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-textSecondary mb-1">Last Result</p>
              <div className="flex items-center">
                {selectedMarket.lastResult ? (
                  <>
                    <span className="bg-primary-lighter px-2 py-1 rounded font-mono">
                      {selectedMarket.lastResult}
                    </span>
                    <span className="mx-2 text-textSecondary">•</span>
                    <span className="text-success">
                      Announced {formatLastResultTime(selectedMarket.lastResultTimestamp!)}
                    </span>
                  </>
                ) : (
                  <span className="text-textSecondary">No result yet</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Game Type Tabs */}
          {isLoadingGameTypes ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex overflow-x-auto border-b border-primary-lighter">
                  {marketGameTypes.map((gameType: MarketGameType) => (
                    <button
                      key={gameType.gameTypeId}
                      className={`px-6 py-3 ${
                        selectedGameType === gameType.gameType.name
                          ? 'text-accent border-b-2 border-accent font-medium'
                          : 'text-textSecondary hover:text-textPrimary'
                      }`}
                      onClick={() => handleSelectGameType(gameType.gameType.name)}
                    >
                      {gameType.gameType.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Game Type UI */}
              {selectedMarket.isOpen ? (
                getGameTypeComponent()
              ) : (
                <div className="p-6 bg-primary rounded-lg mb-6 text-center">
                  <p className="text-danger">This market is currently closed. Please select another market or come back later.</p>
                </div>
              )}
            </>
          )}
          
          {/* Recent Bets */}
          {user && <BetHistory />}
        </>
      )}
    </div>
  );
};

export default SattamatkaGame;
