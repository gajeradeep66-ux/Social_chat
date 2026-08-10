import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer'
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon, Eye, EyeOff } from "lucide-react";
import { Link } from 'react-router-dom';

const Signup = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    })

    const { signup, isSigningUp } = useAuthStore();

    const handleSubmit = (e) => {
        e.preventDefault();
        signup(formData);
    };
    
    return (
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900">
        <div className="relative w-full max-w-5xl md:h-140 lg:h-150 h-auto my-auto">
            <BorderAnimatedContainer>
            <div className="w-full h-full flex flex-col md:flex-row">
                <div className="md:w-1/2 h-full p-6 sm:p-8 flex items-center justify-center md:border-r border-slate-600/30">
                <div className="w-full max-w-md">
                    <div className="text-center mb-6">
                    <MessageCircleIcon className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                    <h2 className="text-2xl font-bold text-slate-200 mb-1">Create Account</h2>
                    <p className="text-slate-400 text-sm">Sign up for a new account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="auth-input-label">Full Name</label>
                        <div className="relative">
                        <UserIcon className="auth-input-icon" />

                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="input"
                            placeholder="Deep Gajera"
                        />
                        </div>
                    </div>

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

                    <button className="auth-btn" type="submit" disabled={isSigningUp}>
                        {isSigningUp ? (
                        <LoaderIcon className="w-full h-5 animate-spin text-center" />
                        ) : (
                        "Create Account"
                        )}
                    </button>
                    </form>

                    <div className="mt-4 text-center">
                    <Link to="/login" className="auth-link">
                        Already have an account? Login
                    </Link>
                    </div>
                </div>
                </div>


                <div className="hidden md:w-1/2 h-full md:flex flex-col items-center justify-center p-6 bg-linear-to-bl from-slate-800/20 to-transparent">
                <div className="text-center">
                    <img
                    src="/signup.png"
                    alt="People using mobile devices"
                    className="w-full max-h-75 object-contain mx-auto"
                    />
                    <div className="mt-6 text-center">
                    <h3 className="text-xl font-medium text-cyan-400">Start Your Journey Today</h3>

                    <div className="mt-4 flex justify-center gap-4">
                        <span className="auth-badge">Free</span>
                        <span className="auth-badge">Easy Setup</span>
                        <span className="auth-badge">Private</span>
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

export default Signup