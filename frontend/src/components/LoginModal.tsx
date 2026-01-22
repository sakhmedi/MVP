import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginData } from '../types/user';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = {
    onClose: () => void;
    onSwitchToSignup: () => void;
}

const LoginModal = ({ onClose, onSwitchToSignup }: Props) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginData>({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(formData);
            login(response.access_token, response.refresh_token, response.user);
            onClose();
            // Navigate to feed after successful login
            navigate('/feed');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#211F36] border border-[#616083]/30 rounded-2xl w-full max-w-md p-8 relative shadow-2xl shadow-black/50 animate-fade-in">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#616083] hover:text-gray-300 hover:bg-[#0C0E1D] transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF81FF] to-[#51FAAA] flex items-center justify-center shadow-lg shadow-[#FF81FF]/30">
                        <svg className="w-8 h-8 text-[#0C0E1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        Welcome back
                    </h2>
                    <p className="text-[#616083] mt-1">Sign in to continue to your feed</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#0C0E1D] border border-[#616083]/30 rounded-xl px-4 py-3 text-white placeholder-[#616083] focus:outline-none focus:ring-2 focus:ring-[#FF81FF] focus:border-transparent transition-all"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#0C0E1D] border border-[#616083]/30 rounded-xl px-4 py-3 text-white placeholder-[#616083] focus:outline-none focus:ring-2 focus:ring-[#FF81FF] focus:border-transparent transition-all"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#FF81FF] to-[#51FAAA] text-[#0C0E1D] rounded-xl py-3 font-medium hover:shadow-lg hover:shadow-[#FF81FF]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign in'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-[#616083]">
                        Don&apos;t have an account?{" "}
                        <button
                            onClick={onSwitchToSignup}
                            className="text-[#FF81FF] font-medium hover:text-[#FF81FF]/80 transition-colors"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginModal
