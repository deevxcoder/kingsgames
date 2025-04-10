import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

export default function AdminTransactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<"approve" | "reject">("approve");
  const [remark, setRemark] = useState("");
  
  // Fetch transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/admin/transactions', activeTab, searchTerm],
    queryFn: async () => {
      let endpoint = `/api/admin/transactions?status=${activeTab}`;
      if (searchTerm) {
        endpoint += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const res = await apiRequest('GET', endpoint);
      return res.json();
    }
  });
  
  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, action, remark }: { id: number, action: string, remark: string }) => {
      const res = await apiRequest('POST', `/api/admin/transactions/${id}/${action}`, { remark });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      toast({
        title: `Transaction ${selectedAction === 'approve' ? 'approved' : 'rejected'}`,
        description: `The transaction has been ${selectedAction === 'approve' ? 'approved' : 'rejected'} successfully`,
        variant: "success",
      });
      setIsUpdateDialogOpen(false);
      setRemark("");
    },
    onError: (error: Error) => {
      toast({
        title: `Error ${selectedAction === 'approve' ? 'approving' : 'rejecting'} transaction`,
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleOpenUpdateDialog = (id: number, action: "approve" | "reject") => {
    setSelectedTransactionId(id);
    setSelectedAction(action);
    setRemark("");
    setIsUpdateDialogOpen(true);
  };
  
  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransactionId) {
      toast({
        title: "Error",
        description: "No transaction selected",
        variant: "destructive",
      });
      return;
    }
    
    if (!remark.trim()) {
      toast({
        title: "Validation error",
        description: "Remark is required",
        variant: "destructive",
      });
      return;
    }
    
    updateTransactionMutation.mutate({
      id: selectedTransactionId,
      action: selectedAction,
      remark,
    });
  };
  
  const getStatusBadge = (status: string) => {
    let bgColor = "";
    let textColor = "";
    
    switch (status) {
      case "pending":
        bgColor = "bg-yellow-500/20";
        textColor = "text-yellow-500";
        break;
      case "completed":
      case "approved":
        bgColor = "bg-[#00C853]/20";
        textColor = "text-[#00C853]";
        break;
      case "rejected":
        bgColor = "bg-[#FF3B58]/20";
        textColor = "text-[#FF3B58]";
        break;
      default:
        bgColor = "bg-gray-500/20";
        textColor = "text-gray-500";
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Transaction Management</h2>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search by username, transaction ID, or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0F1923] border-gray-500"
            />
          </div>
        </div>
        
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <Card className="bg-[#1A2C3D] border-gray-500/30">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-500/30">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">ID</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Payment ID</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingTransactions ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="border-b border-gray-500/20">
                            <td className="py-3 px-4">
                              <div className="h-4 w-8 bg-gray-600/30 animate-pulse rounded-md"></div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-24 bg-gray-600/30 animate-pulse rounded-md"></div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-16 bg-gray-600/30 animate-pulse rounded-md"></div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-16 bg-gray-600/30 animate-pulse rounded-md"></div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-20 bg-gray-600/30 animate-pulse rounded-md"></div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-24 bg-gray-600/30 animate-pulse rounded-md"></div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-16 bg-gray-600/30 animate-pulse rounded-md"></div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-4 w-24 bg-gray-600/30 animate-pulse rounded-md"></div>
                            </td>
                          </tr>
                        ))
                      ) : transactions.length > 0 ? (
                        transactions.map((transaction: any) => (
                          <tr key={transaction.id} className="border-b border-gray-500/20">
                            <td className="py-3 px-4">{transaction.id}</td>
                            <td className="py-3 px-4">{transaction.username}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                transaction.type === "deposit" 
                                  ? "bg-blue-500/20 text-blue-400" 
                                  : "bg-purple-500/20 text-purple-400"
                              }`}>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              {transaction.paymentId || "-"}
                            </td>
                            <td className="py-3 px-4">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(transaction.status)}
                            </td>
                            <td className="py-3 px-4">
                              {transaction.status === "pending" && (
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    className="bg-[#00C853] hover:bg-[#00C853]/80 text-white"
                                    onClick={() => handleOpenUpdateDialog(transaction.id, "approve")}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-transparent border-[#FF3B58] text-[#FF3B58] hover:bg-[#FF3B58]/10"
                                    onClick={() => handleOpenUpdateDialog(transaction.id, "reject")}
                                  >
                                    Reject
                                  </Button>
                                  {transaction.proofUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-transparent border-gray-500 text-white hover:bg-[#0A1018]"
                                      onClick={() => window.open(transaction.proofUrl, '_blank')}
                                    >
                                      View Proof
                                    </Button>
                                  )}
                                </div>
                              )}
                              {transaction.status !== "pending" && (
                                <div>
                                  <span className="text-gray-400 text-xs">
                                    By: {transaction.processedByUsername || "System"}
                                  </span>
                                  <p className="text-gray-400 text-xs mt-1">
                                    Remark: {transaction.remark || "N/A"}
                                  </p>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-4 text-center">No transactions found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Update Transaction Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="bg-[#1A2C3D] border-gray-500/30">
          <DialogHeader>
            <DialogTitle>
              {selectedAction === "approve" ? "Approve Transaction" : "Reject Transaction"}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedAction === "approve"
                ? "Approve this transaction and update the user's balance accordingly."
                : "Reject this transaction. This will not affect the user's balance."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateTransaction}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="remark" className="text-right text-sm font-medium">
                  Remark
                </label>
                <Input
                  id="remark"
                  placeholder="Add a remark for this action"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="col-span-3 bg-[#0F1923] border-gray-500"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                className="bg-transparent border-gray-500 text-white hover:bg-[#0A1018] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={selectedAction === "approve" 
                  ? "bg-[#00C853] hover:bg-[#00C853]/80 text-white" 
                  : "bg-[#FF3B58] hover:bg-[#FF3B58]/80 text-white"}
                disabled={updateTransactionMutation.isPending}
              >
                {updateTransactionMutation.isPending 
                  ? "Processing..." 
                  : selectedAction === "approve" 
                    ? "Approve" 
                    : "Reject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}