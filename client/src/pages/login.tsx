import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, isLoading, error } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "login") {
      await login(username, password);
      navigate("/");
    } else {
      await register(username, password);
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-[#071421]">
      <Card className="w-full max-w-md bg-[#1A2C3D] border-gray-500/30">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[#3EA6FF]">BetX</CardTitle>
          <CardDescription className="text-gray-300">
            {activeTab === "login" ? "Login to your account" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Enter your username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-[#0F1923] border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#0F1923] border-gray-500"
                  />
                </div>
                
                {error && <p className="text-sm text-[#FF3B58]">{error}</p>}
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username</Label>
                  <Input 
                    id="new-username" 
                    type="text" 
                    placeholder="Choose a username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-[#0F1923] border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    placeholder="Choose a password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#0F1923] border-gray-500"
                  />
                </div>
                
                {error && <p className="text-sm text-[#FF3B58]">{error}</p>}
              </TabsContent>
              
              <CardFooter className="flex justify-center pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-[#3EA6FF] hover:bg-[#4DB8FF]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : activeTab === "login" ? 'Login' : 'Register'}
                </Button>
              </CardFooter>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}