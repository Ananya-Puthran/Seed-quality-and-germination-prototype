import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, Mail, Key, Phone, User as UserIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (metadataName) return metadataName;
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return 'User';
  };

  const getAvatarInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const getProviderName = () => {
    if (!user) return 'Email / Password';
    const provider = user.app_metadata?.provider;
    if (provider === 'google') return 'Google OAuth';
    return 'Email & Password';
  };

  const getPhoneNumber = () => {
    if (!user) return 'Not provided';
    return user.phone || user.user_metadata?.phone || 'Not provided';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D3A32] flex flex-col font-sans">
      <Header />

      <main className="max-w-3xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          {/* Header Title */}
          <div className="border-b border-[#E2DDD5] pb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#566A58] block mb-1">
              Account Overview
            </span>
            <h1 className="text-3xl font-extrabold text-[#163323] tracking-tight">
              User Profile
            </h1>
          </div>

          {/* Profile Details Card */}
          <div className="bg-white border border-[#E2DDD5] rounded-xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-[#E2DDD5] pb-6">
              {/* First-letter Avatar Fallback */}
              <div className="w-16 h-16 rounded-2xl bg-[#163323] text-[#FAF8F5] flex items-center justify-center font-extrabold text-2xl uppercase shadow-sm border border-[#386655]">
                {getAvatarInitial()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#163323]">
                  {getUserDisplayName()}
                </h2>
                <span className="text-xs text-[#566A58] font-medium flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="w-4 h-4 text-[#386655]" />
                  Active Supabase Authenticated Session
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#F5F2EC] p-4 rounded-xl border border-[#E2DDD5] space-y-1">
                <span className="text-[#566A58] font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#163323]" />
                  Email Address
                </span>
                <p className="font-mono text-[#163323] font-bold truncate">
                  {user?.email || 'N/A'}
                </p>
              </div>

              <div className="bg-[#F5F2EC] p-4 rounded-xl border border-[#E2DDD5] space-y-1">
                <span className="text-[#566A58] font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#163323]" />
                  Phone Number
                </span>
                <p className="font-mono text-[#163323] font-bold">
                  {getPhoneNumber()}
                </p>
              </div>

              <div className="bg-[#F5F2EC] p-4 rounded-xl border border-[#E2DDD5] space-y-1">
                <span className="text-[#566A58] font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#163323]" />
                  Auth Provider
                </span>
                <p className="font-mono text-[#163323] font-bold">
                  {getProviderName()}
                </p>
              </div>
            </div>

            {user?.id && (
              <div className="text-xs text-[#566A58] font-mono pt-2">
                User ID: <span className="text-[#163323] select-all font-bold">{user.id}</span>
              </div>
            )}

            <div className="pt-4 border-t border-[#E2DDD5]">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs px-5 py-2.5 rounded-lg border border-rose-200 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out of SPOROUS</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#E2DDD5] bg-[#FAF8F5] text-center text-xs text-[#566A58]">
        SPOROUS &bull; Seed Quality & Germination Platform
      </footer>
    </div>
  );
};
