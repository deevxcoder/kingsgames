import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { formatCurrency } from "@/lib/utils";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isAdjustBalanceDialogOpen, setIsAdjustBalanceDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Edit user form state
  const [editUsername, setEditUsername] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editIsBlocked, setEditIsBlocked] = useState(false);
  
  // Adjust balance form state
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustRemark, setAdjustRemark] = useState("");
  
  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users', searchTerm],
    queryFn: async () => {
      const endpoint = searchTerm 
        ? `/api/admin/users?search=${encodeURIComponent(searchTerm)}` 
        : '/api/admin/users';
      const res = await apiRequest('GET', endpoint);
      return res.json();
    }
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest('PUT', `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User updated",
        description: "The user has been updated successfully",
        variant: "success",
      });
      setIsEditUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Adjust balance mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: async (data: { userId: number, amount: number, remark: string }) => {
      const res = await apiRequest('POST', '/api/admin/adjust-balance', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Balance adjusted",
        description: "The user's balance has been adjusted successfully",
        variant: "success",
      });
      setIsAdjustBalanceDialogOpen(false);
      setAdjustAmount("");
      setAdjustRemark("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error adjusting balance",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleEditUser = (user: any) => {
    setSelectedUserId(user.id);
    setEditUsername(user.username);
    setEditIsAdmin(user.isAdmin);
    setEditIsBlocked(!user.isActive);
    setIsEditUserDialogOpen(true);
  };
  
  const handleAdjustBalance = (user: any) => {
    setSelectedUserId(user.id);
    setAdjustAmount("");
    setAdjustRemark("");
    setIsAdjustBalanceDialogOpen(true);
  };
  
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "No user selected",
        variant: "destructive",
      });
      return;
    }
    
    updateUserMutation.mutate({
      id: selectedUserId,
      data: {
        username: editUsername,
        isAdmin: editIsAdmin,
        isActive: !editIsBlocked,
      },
    });
  };
  
  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "No user selected",
        variant: "destructive",
      });
      return;
    }
    
    if (!adjustAmount || isNaN(Number(adjustAmount))) {
      toast({
        title: "Validation error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (!adjustRemark.trim()) {
      toast({
        title: "Validation error",
        description: "Remark is required",
        variant: "destructive",
      });
      return;
    }
    
    adjustBalanceMutation.mutate({
      userId: selectedUserId,
      amount: Number(adjustAmount),
      remark: adjustRemark,
    });
  };
  
  const handleToggleUserStatus = (id: number, isActive: boolean) => {
    updateUserMutation.mutate({
      id,
      data: { isActive: !isActive },
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">User Management</h2>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search users by username or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0F1923] border-gray-500"
            />
          </div>
        </div>
        
        <Card className="bg-[#1A2C3D] border-gray-500/30">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-500/30">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Username</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Balance</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingUsers ? (
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
                          <div className="h-4 w-16 bg-gray-600/30 animate-pulse rounded-md"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-24 bg-gray-600/30 animate-pulse rounded-md"></div>
                        </td>
                      </tr>
                    ))
                  ) : users.length > 0 ? (
                    users.map((user: any) => (
                      <tr key={user.id} className="border-b border-gray-500/20">
                        <td className="py-3 px-4">{user.id}</td>
                        <td className="py-3 px-4">{user.username}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.isAdmin
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {user.isAdmin ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">
                          {formatCurrency(user.walletBalance)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive
                              ? "bg-[#00C853]/20 text-[#00C853]"
                              : "bg-[#FF3B58]/20 text-[#FF3B58]"
                          }`}>
                            {user.isActive ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent border-gray-500 text-white hover:bg-[#0A1018] hover:text-white"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent border-gray-500 text-white hover:bg-[#0A1018] hover:text-white"
                              onClick={() => handleAdjustBalance(user)}
                            >
                              Adjust Balance
                            </Button>
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => handleToggleUserStatus(user.id, user.isActive)}
                              disabled={updateUserMutation.isPending}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="bg-[#1A2C3D] border-gray-500/30">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="col-span-3 bg-[#0F1923] border-gray-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isAdmin" className="text-right">
                  Admin Status
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="isAdmin"
                    checked={editIsAdmin}
                    onCheckedChange={setEditIsAdmin}
                  />
                  <Label htmlFor="isAdmin">
                    {editIsAdmin ? "Admin" : "User"}
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isBlocked" className="text-right">
                  Block User
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="isBlocked"
                    checked={editIsBlocked}
                    onCheckedChange={setEditIsBlocked}
                  />
                  <Label htmlFor="isBlocked">
                    {editIsBlocked ? "Blocked" : "Active"}
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditUserDialogOpen(false)}
                className="bg-transparent border-gray-500 text-white hover:bg-[#0A1018] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3EA6FF] hover:bg-[#4DB8FF]"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Adjust Balance Dialog */}
      <Dialog open={isAdjustBalanceDialogOpen} onOpenChange={setIsAdjustBalanceDialogOpen}>
        <DialogContent className="bg-[#1A2C3D] border-gray-500/30">
          <DialogHeader>
            <DialogTitle>Adjust Wallet Balance</DialogTitle>
            <DialogDescription className="text-gray-300">
              Increase or decrease a user's wallet balance. Use negative values to deduct funds.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAdjustBalanceSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="relative col-span-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount (e.g. 500 or -200)"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="pl-8 bg-[#0F1923] border-gray-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="remark" className="text-right">
                  Remark
                </Label>
                <Input
                  id="remark"
                  placeholder="Reason for adjustment"
                  value={adjustRemark}
                  onChange={(e) => setAdjustRemark(e.target.value)}
                  className="col-span-3 bg-[#0F1923] border-gray-500"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustBalanceDialogOpen(false)}
                className="bg-transparent border-gray-500 text-white hover:bg-[#0A1018] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3EA6FF] hover:bg-[#4DB8FF]"
                disabled={adjustBalanceMutation.isPending}
              >
                {adjustBalanceMutation.isPending ? "Processing..." : "Adjust Balance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}