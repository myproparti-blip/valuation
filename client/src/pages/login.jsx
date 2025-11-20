import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "../components/ui";
import { loginUser } from "../services/auth";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const onFinish = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const response = await loginUser(formData.username, formData.password);

      localStorage.setItem("user", JSON.stringify(response));

      if (onLogin) {
        onLogin(response);
      }

      setSuccess(`Welcome back, ${response.username}!`);

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (error) {
      const errorMessage = error?.message ||
        error?.response?.data?.message ||
        "Invalid username or password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      title: "🔑 Admin Account",
      accounts: [{ username: "admin", password: "2020" }],
      color: "text-red-600",
    },
    {
      title: "👥 Manager Accounts",
      accounts: [
        { username: "manager1", password: "1122" },
        { username: "manager2", password: "1133" },
      ],
      color: "text-blue-600",
    },
    {
      title: "👤 User Accounts (10 available)",
      accounts: [
        { username: "user1", password: "1111" },
        { username: "user2", password: "2222" },
        { username: "user3", password: "3333" },
        { username: "user4", password: "4444" },
        { username: "user5", password: "5555" },
        { username: "user6", password: "6666" },
        { username: "user7", password: "7777" },
        { username: "user8", password: "8888" },
        { username: "user9", password: "9999" },
        { username: "user10", password: "1010" },
      ],
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-to-br from-blue-600 via-purple-600 to-blue-700 p-4">
      <Card className="w-96 shadow-2xl h-[500px]">
        <CardHeader className="text-center space-y-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
          <div className="flex justify-center mb-2">
            <div className="text-4xl">📊</div>
          </div>
          <CardTitle className="font-serif text-2xl">VALUE SOFT </CardTitle>
                  </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={onFinish} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-10"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="flex justify-center items-center font-bold"><p className="mt-6">BEST VALUATION SOFTWARE</p> </div>
            
          </form>

          {/* Demo Credentials Section */}
          
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
