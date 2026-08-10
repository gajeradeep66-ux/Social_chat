import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer'
import { MessageCircleIcon, LockIcon, MailIcon, LoaderIcon, Eye, EyeOff } from "lucide-react";
import { Link } from 'react-router-dom';

const Login = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
            email: '',
            password: ''
        })
    
        const { login, isLoggingIn } = useAuthStore();
    
        const handleSubmit = (e) => {
            e.preventDefault();
            login(formData);
        };

    return (
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900">
        <div className="relative w-full max-w-5xl md:h-[560px] lg:h-[600px] h-auto my-auto">
            <BorderAnimatedContainer>
            <div className="w-full h-full flex flex-col md:flex-row">
                <div className="md:w-1/2 h-full p-6 sm:p-8 flex items-center justify-center md:border-r border-slate-600/30">
                <div className="w-full max-w-md">
                    <div className="text-center mb-6">
                    <MessageCircleIcon className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                    <h2 className="text-2xl font-bold text-slate-200 mb-1">Welcome Back</h2>
                    <p className="text-slate-400 text-sm">Login to access to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="auth-input-label">Email</label>
                        <div className="relative">
                        <MailIcon className="auth-input-icon" />

                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input"
                            placeholder="deep@gmail.com"
                        />
                        </div>
                    </div>

                    <div>
                        <label className="auth-input-label">Password</label>
                        <div className="relative">
                        <LockIcon className="auth-input-icon" />

                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input pr-10"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                            <EyeOff className="size-5" />
                            ) : (
                            <Eye className="size-5" />
                            )}
                        </button>
                        </div>
                    </div>

                    <button className="auth-btn" type="submit" disabled={isLoggingIn}>
                        {isLoggingIn ? (
                        <LoaderIcon className="w-full h-5 animate-spin text-center" />
                        ) : (
                        "Sign In"
                        )}
                    </button>
                    </form>

                    <div className="mt-5 text-center">
                    <Link to="/signup" className="auth-link">
                        Don't have an account? Sign Up
                    </Link>
                    </div>
                </div>
                </div>


                <div className="hidden md:w-1/2 h-full md:flex flex-col items-center justify-center p-6 bg-linear-to-bl from-slate-800/20 to-transparent">
                <div className="text-center">
                    <img
                    src="/login.png"
                    alt="People using mobile devices"
                    className="w-full max-h-[300px] object-contain mx-auto"
                    />
                    <div className="mt-6 text-center">
                    <h3 className="text-xl font-medium text-cyan-400">Connect anytime, anywhere</h3>

                    <div className="mt-4 flex justify-center gap-4">
                        <span className="auth-badge">Secure</span>
                        <span className="auth-badge">Fast</span>
                        <span className="auth-badge">Reliable</span>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </BorderAnimatedContainer>
        </div>
    </div>
    )
}

export default Login