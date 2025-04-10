import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { getStatusColor } from "@/lib/utils";

export default function AdminMarkets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("markets");
  const [isMarketDialogOpen, setIsMarketDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  
  // New market form state
  const [newMarketName, setNewMarketName] = useState("");
  const [newMarketOpenTime, setNewMarketOpenTime] = useState("10:00");
  const [newMarketCloseTime, setNewMarketCloseTime] = useState("20:00");
  const [newMarketIsOpen, setNewMarketIsOpen] = useState(true);
  
  // Declare result form state
  const [resultValue, setResultValue] = useState("");
  
  // WebSocket connection
  const onMessage = (message: any) => {
    if (
      message.type === 'market-created' || 
      message.type === 'market-updated' ||
      message.type === 'market-result'
    ) {
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
    }
  };
  
  const { isConnected } = useWebSocket({ onMessage });
  
  // Fetch markets
  const { data: markets, isLoading: isLoadingMarkets } = useQuery({
    queryKey: ['/api/markets'],
  });
  
  // Create market mutation
  const createMarketMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      openTime: string;
      closeTime: string;
      isOpen: boolean;
    }) => {
      const res = await apiRequest('POST', '/api/admin/markets', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      toast({
        title: "Market created",
        description: "The market has been created successfully",
        variant: "success",
      });
      setIsMarketDialogOpen(false);
      resetMarketForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating market",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update market mutation
  const updateMarketMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest('PUT', `/api/admin/markets/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      toast({
        title: "Market updated",
        description: "The market has been updated successfully",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating market",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Declare result mutation
  const declareResultMutation = useMutation({
    mutationFn: async (data: { marketId: number; result: string }) => {
      const res = await apiRequest('POST', '/api/admin/declare-result', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/markets'] });
      toast({
        title: "Result declared",
        description: "The result has been declared and all bets processed",
        variant: "success",
      });
      setIsResultDialogOpen(false);
      setResultValue("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error declaring result",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const resetMarketForm = () => {
    setNewMarketName("");
    setNewMarketOpenTime("10:00");
    setNewMarketCloseTime("20:00");
    setNewMarketIsOpen(true);
  };
  
  const handleCreateMarket = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMarketName.trim()) {
      toast({
        title: "Validation error",
        description: "Market name is required",
        variant: "destructive",
      });
      return;
    }
    
    createMarketMutation.mutate({
      name: newMarketName,
      openTime: newMarketOpenTime,
      closeTime: newMarketCloseTime,
      isOpen: newMarketIsOpen,
    });
  };
  
  const handleToggleMarketStatus = (id: number, currentStatus: boolean) => {
    updateMarketMutation.mutate({
      id,
      data: { isOpen: !currentStatus },
    });
  };
  
  const handleDeclareResult = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMarketId) {
      toast({
        title: "Error",
        description: "No market selected",
        variant: "destructive",
      });
      return;
    }
    
    if (!resultValue.trim()) {
      toast({
        title: "Validation error",
        description: "Result value is required",
        variant: "destructive",
      });
      return;
    }
    
    declareResultMutation.mutate({
      marketId: selectedMarketId,
      result: resultValue,
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Admin - Manage Markets</h2>
      </div>
      
      <Tabs defaultValue="markets" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="results">Declare Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="markets">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-300">Manage markets and their availability</p>
            <Dialog open={isMarketDialogOpen} onOpenChange={setIsMarketDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#3EA6FF] hover:bg-[#4DB8FF]">
                  Create New Market
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A2C3D] border-gray-500/30">
                <DialogHeader>
                  <DialogTitle>Create New Market</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Add a new market to the platform. Users will be able to place bets on this market.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateMarket}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Market Name
                      </Label>
                      <Input
                        id="name"
                        value={newMarketName}
                        onChange={(e) => setNewMarketName(e.target.value)}
                        className="col-span-3 bg-[#0F1923] border-gray-500"
                        placeholder="e.g. Mumbai Matka"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="openTime" className="text-right">
                        Opening Time
                      </Label>
                      <Input
                        id="openTime"
                        type="time"
                        value={newMarketOpenTime}
                        onChange={(e) => setNewMarketOpenTime(e.target.value)}
                        className="col-span-3 bg-[#0F1923] border-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="closeTime" className="text-right">
                        Closing Time
                      </Label>
                      <Input
                        id="closeTime"
                        type="time"
                        value={newMarketCloseTime}
                        onChange={(e) => setNewMarketCloseTime(e.target.value)}
                        className="col-span-3 bg-[#0F1923] border-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="isOpen" className="text-right">
                        Status
                      </Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Switch
                          id="isOpen"
                          checked={newMarketIsOpen}
                          onCheckedChange={setNewMarketIsOpen}
                        />
                        <Label htmlFor="isOpen">
                          {newMarketIsOpen ? "Open" : "Closed"}
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsMarketDialogOpen(false)}
                      className="bg-transparent border-gray-500 text-white hover:bg-[#0A1018] hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#3EA6FF] hover:bg-[#4DB8FF]"
                      disabled={createMarketMutation.isPending}
                    >
                      {createMarketMutation.isPending ? "Creating..." : "Create Market"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card className="bg-[#1A2C3D] border-gray-500/30">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-500/30">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Market Name</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Opening Time</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Closing Time</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Result</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingMarkets ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center">Loading markets...</td>
                      </tr>
                    ) : markets && markets.length > 0 ? (
                      markets.map((market) => {
                        const statusColor = getStatusColor(market.isOpen ? "open" : "closed");
                        
                        return (
                          <tr key={market.id} className="border-b border-gray-500/20">
                            <td className="py-3 px-4">{market.name}</td>
                            <td className="py-3 px-4">{market.openTime}</td>
                            <td className="py-3 px-4">{market.closeTime}</td>
                            <td className="py-3 px-4 font-mono">
                              {market.lastResult || "Not declared"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${statusColor.bg} ${statusColor.text}`}>
                                {market.isOpen ? "Open" : "Closed"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={market.isOpen}
                                  onCheckedChange={() => handleToggleMarketStatus(market.id, market.isOpen)}
                                  disabled={updateMarketMutation.isPending}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="ml-2 bg-transparent border-gray-500 text-white hover:bg-[#0A1018] hover:text-white"
                                  onClick={() => {
                                    setSelectedMarketId(market.id);
                                    setIsResultDialogOpen(true);
                                  }}
                                >
                                  Declare Result
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center">No markets available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-4">
              Declare results for open markets. This will process all pending bets and update user balances.
            </p>
            
            <Card className="bg-[#1A2C3D] border-gray-500/30 mb-4">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="resultMarket" className="mb-2 block">
                      Select Market
                    </Label>
                    <select
                      id="resultMarket"
                      className="w-full bg-[#0F1923] border border-gray-500 rounded-lg p-2 focus:outline-none focus:border-[#3EA6FF]"
                      value={selectedMarketId || ""}
                      onChange={(e) => setSelectedMarketId(Number(e.target.value))}
                    >
                      <option value="">-- Select a market --</option>
                      {markets?.filter(m => m.isOpen).map((market) => (
                        <option key={market.id} value={market.id}>
                          {market.name} (Closes at {market.closeTime})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor="resultValue" className="mb-2 block">
                      Result Value
                    </Label>
                    <Input
                      id="resultValue"
                      value={resultValue}
                      onChange={(e) => setResultValue(e.target.value)}
                      className="bg-[#0F1923] border-gray-500"
                      placeholder="e.g. 57 for Jodi, etc."
                    />
                  </div>
                </div>
                
                <Button
                  className="bg-[#FF7C48] hover:bg-[#FF7C48]/80 mt-4 w-full md:w-auto"
                  disabled={!selectedMarketId || !resultValue || declareResultMutation.isPending}
                  onClick={handleDeclareResult}
                >
                  {declareResultMutation.isPending ? "Processing..." : "Declare Result"}
                </Button>
              </CardContent>
            </Card>
            
            <h3 className="font-medium mb-2">Recent Results</h3>
            <Card className="bg-[#1A2C3D] border-gray-500/30">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-500/30">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Market</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Result</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Declared At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingMarkets ? (
                        <tr>
                          <td colSpan={3} className="py-4 text-center">Loading results...</td>
                        </tr>
                      ) : markets?.filter(m => m.lastResult).length ? (
                        markets
                          .filter(m => m.lastResult)
                          .sort((a, b) => {
                            return new Date(b.lastResultTime || 0).getTime() - new Date(a.lastResultTime || 0).getTime();
                          })
                          .map((market) => (
                            <tr key={market.id} className="border-b border-gray-500/20">
                              <td className="py-3 px-4">{market.name}</td>
                              <td className="py-3 px-4 font-mono font-medium">{market.lastResult}</td>
                              <td className="py-3 px-4">
                                {market.lastResultTime
                                  ? new Date(market.lastResultTime).toLocaleString()
                                  : "N/A"}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-4 text-center">No results declared yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Result declaration dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="bg-[#1A2C3D] border-gray-500/30">
          <DialogHeader>
            <DialogTitle>Declare Result</DialogTitle>
            <DialogDescription className="text-gray-300">
              Declare the result for the selected market. This will process all pending bets.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleDeclareResult}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dialogMarket" className="text-right">
                  Market
                </Label>
                <div className="col-span-3 font-medium">
                  {markets?.find(m => m.id === selectedMarketId)?.name || "Selected Market"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dialogResult" className="text-right">
                  Result
                </Label>
                <Input
                  id="dialogResult"
                  value={resultValue}
                  onChange={(e) => setResultValue(e.target.value)}
                  className="col-span-3 bg-[#0F1923] border-gray-500"
                  placeholder="e.g. 57 for Jodi, etc."
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResultDialogOpen(false)}
                className="bg-transparent border-gray-500 text-white hover:bg-[#0A1018] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#FF7C48] hover:bg-[#FF7C48]/80"
                disabled={!resultValue || declareResultMutation.isPending}
              >
                {declareResultMutation.isPending ? "Processing..." : "Declare Result"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
