import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
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

 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md shadow-2xl overflow-hidden border-0 relative z-10">
        <CardHeader className="text-center space-y-3 bg-gradient-to-br from-slate-50 to-blue-50 py-6 sm:py-8 border-b-4 border-blue-600">
          <div className="flex justify-center mb-2">
            <div className="text-5xl sm:text-6xl filter drop-shadow-lg">📊</div>
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">VALUE SOFT</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-2">Professional Valuation Software</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6 sm:pt-8">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
              <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm">
              <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                <span>✓</span> {success}
              </p>
            </div>
          )}

          <form onSubmit={onFinish} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="font-semibold text-slate-700 flex items-center gap-2">
                <FaEnvelope className="h-4 w-4 text-blue-600" />
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                className="pl-4 h-11 font-medium border-2 focus:border-blue-600 focus:shadow-lg"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-slate-700 flex items-center gap-2">
                <FaLock className="h-4 w-4 text-blue-600" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="pr-10 h-11 font-medium border-2 focus:border-blue-600 focus:shadow-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-base shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? "🔄 Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm font-bold text-slate-600 tracking-wide">⭐ BEST VALUATION SOFTWARE</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
