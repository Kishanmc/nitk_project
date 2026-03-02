import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function DoctorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password, 'doctor');
    if (result.success) {
      navigate('/doctor/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-800 rounded-2xl shadow-2xl border border-dark-600 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-doctor/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-doctor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Doctor Portal</h1>
            <p className="text-gray-400 mt-1">Gait Signal Analysis Platform</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-doctor focus:border-transparent transition"
                placeholder="doctor@gait.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-doctor focus:border-transparent transition"
                placeholder="••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-doctor hover:bg-doctor-dark text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Sign In as Doctor
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link to="/patient/login" className="text-patient hover:text-patient-light mr-4">Patient Login</Link>
            <Link to="/researcher/login" className="text-researcher hover:text-researcher-light">Researcher Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
