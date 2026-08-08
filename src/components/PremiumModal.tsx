import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  CheckCircle2, 
  CreditCard, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  AlertCircle, 
  LogOut, 
  Calendar, 
  DollarSign, 
  PhoneCall, 
  CheckCircle,
  Copy,
  Plus,
  Eye,
  EyeOff,
  Camera,
  Edit3,
  Bookmark,
  ShieldCheck,
  Globe,
  Clock,
  MessageSquare,
  Settings,
  ThumbsUp,
  Share2,
  Crown,
  Award,
  Film,
  Tv,
  KeyRound,
  Shield,
  ArrowLeft,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Language } from '../types';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: any;
  setCurrentUser: (user: any) => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  setCurrentUser
}) => {
  // Modal Navigation State: 'plans' | 'order' | 'profile' | 'auth'
  const [viewMode, setViewMode] = useState<'plans' | 'order' | 'profile' | 'auth'>(() => {
    return currentUser ? 'profile' : 'plans';
  });

  // Auth sub-mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Selected VIP Plan
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string; days: number; tag?: string } | null>(null);

  // Form Fields for VIP Purchase
  const [orderEmail, setOrderEmail] = useState(currentUser?.email || '');
  const [orderPassword, setOrderPassword] = useState(currentUser?.password || '');
  const [orderName, setOrderName] = useState(currentUser?.name || '');
  const [orderPhone, setOrderPhone] = useState(currentUser?.phone || '');
  const [orderAvatar, setOrderAvatar] = useState<string | null>(currentUser?.avatar || null);
  const [orderScreenshot, setOrderScreenshot] = useState<string | null>(null);
  const [orderTransId, setOrderTransId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpaisa' | 'hesabpay' | 'asan' | 'bank' | 'coupon'>('mpaisa');
  
  // Form Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  // Static Afghan Payment Account references
  const paymentNumbers = {
    mpaisa: 'M-Paisa: +93 799 123 456 (Zama TV Pay)',
    hesabpay: 'HesabPay ID: @zamatv | +93 79 555 1234',
    asan: 'Asan Khedmat / Mobile: +93 788 123 456',
    bank: 'Afghan United Bank ACC: 001-9988231 (Zama TV)',
    coupon: 'د کوپن کوډ داخل کړئ'
  };

  // Pre-fill user data when modal opens or user changes
  useEffect(() => {
    if (currentUser) {
      setOrderEmail(currentUser.email || '');
      setOrderPassword(currentUser.password || '');
      setOrderName(currentUser.name || '');
      setOrderPhone(currentUser.phone || '');
      setOrderAvatar(currentUser.avatar || null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  // Calculate Days Remaining
  const getVipRemainingDays = () => {
    if (!currentUser?.isVip || !currentUser?.vipExpiresAt) return 0;
    const now = new Date().getTime();
    const expiry = new Date(currentUser.vipExpiresAt).getTime();
    const diffMs = expiry - now;
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const remainingDays = getVipRemainingDays();

  // Helper for uploading files and converting to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'en' ? 'Image file size should be less than 5MB' : 'د عکس حجم باید له ۵ ایم بي څخه کم وي');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          callback(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(language === 'en' ? 'Copied to clipboard!' : 'شمیره کاپي شوه!');
  };

  // Handle plan selection
  const handleSelectPlan = (plan: { name: string; price: string; days: number; tag?: string }) => {
    setSelectedPlan(plan);
    setFormError('');
    setOrderSubmitted(false);
    setViewMode('order');
  };

  // Handle User Login
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError(language === 'en' ? 'Please enter Email and Password' : 'مهرباني وکړئ ایمیل او پټ نوم داخل کړئ');
      return;
    }

    try {
      // 1. Try Firebase auth first
      const credential = await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword.trim());
      const userRef = doc(db, 'users', credential.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const uData = userSnap.data();
        setCurrentUser(uData);
        localStorage.setItem('zama_current_user', JSON.stringify(uData));
      } else {
        // Fallback local lookup
        const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
        const matched = users.find((u: any) => u.email?.toLowerCase() === authEmail.trim().toLowerCase() || u.id === credential.user.uid);
        const loggedUser = matched || {
          id: credential.user.uid,
          name: credential.user.displayName || authEmail.split('@')[0],
          email: authEmail.trim(),
          isVip: false
        };
        setCurrentUser(loggedUser);
        localStorage.setItem('zama_current_user', JSON.stringify(loggedUser));
      }

      setAuthSuccess(language === 'en' ? 'Logged in successfully!' : 'په بریا سره لاګین شوئ!');
      setTimeout(() => {
        setViewMode('profile');
        setAuthSuccess('');
      }, 1000);
    } catch (err: any) {
      console.warn("Firebase Auth Login Error, checking local DB:", err);
      // Fallback local storage login
      const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
      const matched = users.find((u: any) => 
        (u.email?.toLowerCase() === authEmail.trim().toLowerCase() || u.phone === authEmail.trim()) &&
        u.password === authPassword.trim()
      );

      if (matched) {
        setCurrentUser(matched);
        localStorage.setItem('zama_current_user', JSON.stringify(matched));
        setAuthSuccess(language === 'en' ? 'Logged in successfully!' : 'په بریا سره لاګین شوئ!');
        setTimeout(() => {
          setViewMode('profile');
          setAuthSuccess('');
        }, 1000);
      } else {
        setAuthError(language === 'en' ? 'Invalid email, phone or password!' : 'داخل شوی ایمیل، شمیره یا پاسورډ غلط دی!');
      }
    }
  };

  // Handle User Registration
  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail.trim() || !authPassword.trim() || !authName.trim()) {
      setAuthError(language === 'en' ? 'Please fill in all required fields' : 'مهرباني وکړئ نوم، ایمیل او پاسورډ حتمي ولیکئ');
      return;
    }

    try {
      // 1. Try Firebase auth creation
      const userCred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword.trim());
      const uid = userCred.user.uid;
      const newUserObj = {
        id: uid,
        name: authName.trim(),
        email: authEmail.trim().toLowerCase(),
        password: authPassword.trim(),
        phone: authPhone.trim(),
        isVip: false,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', uid), newUserObj);

      const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
      users.push(newUserObj);
      localStorage.setItem('zama_users', JSON.stringify(users));

      setCurrentUser(newUserObj);
      localStorage.setItem('zama_current_user', JSON.stringify(newUserObj));

      setAuthSuccess(language === 'en' ? 'Account created successfully!' : 'نوی اکونټ په بریا جوړ شو!');
      setTimeout(() => {
        setViewMode('profile');
        setAuthSuccess('');
      }, 1000);
    } catch (err: any) {
      console.warn("Firebase Auth Signup Error, falling back to local creation:", err);
      const newUserObj = {
        id: `user-${Date.now()}`,
        name: authName.trim(),
        email: authEmail.trim().toLowerCase(),
        password: authPassword.trim(),
        phone: authPhone.trim(),
        isVip: false,
        createdAt: new Date().toISOString()
      };

      const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
      users.push(newUserObj);
      localStorage.setItem('zama_users', JSON.stringify(users));

      setCurrentUser(newUserObj);
      localStorage.setItem('zama_current_user', JSON.stringify(newUserObj));

      setAuthSuccess(language === 'en' ? 'Account created locally!' : 'حساب سمدستي جوړ شو!');
      setTimeout(() => {
        setViewMode('profile');
        setAuthSuccess('');
      }, 1000);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    signOut(auth).catch(() => {});
    setCurrentUser(null);
    localStorage.removeItem('zama_current_user');
    setViewMode('plans');
  };

  // Handle Order Submit to Admin
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedPlan) return;
    if (!orderEmail.trim() || !orderEmail.includes('@')) {
      setFormError(language === 'en' ? 'Please enter a valid email address' : 'مهرباني وکړئ سم ایمیل ادرس دننه کړئ');
      return;
    }
    if (!orderPassword.trim() || orderPassword.length < 4) {
      setFormError(language === 'en' ? 'Password must be at least 4 characters' : 'پټ نوم باید لږ تر لږه ۴ توري وي');
      return;
    }
    if (!orderPhone.trim()) {
      setFormError(language === 'en' ? 'Please enter your phone number' : 'مهرباني وکړئ د موبایل شمیره دننه کړئ');
      return;
    }
    if (paymentMethod !== 'coupon' && !orderScreenshot) {
      setFormError(language === 'en' ? 'Please upload your payment screenshot' : 'مهرباني وکړئ د تادیې د عکس/سکرین شاټ انتخاب کړئ');
      return;
    }

    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      const ticketId = `ticket-${Date.now()}`;
      
      const newTicket = {
        id: ticketId,
        userName: orderName.trim() || orderEmail.split('@')[0],
        userEmail: orderEmail.trim().toLowerCase(),
        userPassword: orderPassword.trim(),
        userPhone: orderPhone.trim(),
        userAvatar: orderAvatar,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price,
        days: selectedPlan.days,
        paymentMethod,
        transId: orderTransId.trim() || 'NOT_PROVIDED',
        screenshot: orderScreenshot,
        status: 'pending', // Pending Admin review
        timestamp
      };

      // 1. Save ticket in zama_vip_tickets for Admin review
      const existingTickets = JSON.parse(localStorage.getItem('zama_vip_tickets') || '[]');
      existingTickets.unshift(newTicket);
      localStorage.setItem('zama_vip_tickets', JSON.stringify(existingTickets));

      // 2. Register/Update User account locally & set pending VIP state
      const newUserObj = {
        id: currentUser?.id || `user-${Date.now()}`,
        name: newTicket.userName,
        email: newTicket.userEmail,
        password: newTicket.userPassword,
        phone: newTicket.userPhone,
        avatar: newTicket.userAvatar,
        isVip: currentUser?.isVip || false,
        hasPendingVip: true,
        vipExpiresAt: currentUser?.vipExpiresAt || null,
        createdAt: currentUser?.createdAt || timestamp
      };

      // Save as current user
      setCurrentUser(newUserObj);
      localStorage.setItem('zama_current_user', JSON.stringify(newUserObj));

      // Save in users list
      const usersList = JSON.parse(localStorage.getItem('zama_users') || '[]');
      const userIndex = usersList.findIndex((u: any) => u.email === newTicket.userEmail || u.id === newUserObj.id);
      if (userIndex !== -1) {
        usersList[userIndex] = { ...usersList[userIndex], ...newUserObj };
      } else {
        usersList.push(newUserObj);
      }
      localStorage.setItem('zama_users', JSON.stringify(usersList));

      setIsSubmitting(false);
      setOrderSubmitted(true);
    } catch (err: any) {
      console.error("Order submission error:", err);
      setFormError(language === 'en' ? 'Failed to submit request. Try again.' : 'د غوښتنې په لیږلو کې ستونزه راغله. بیا هڅه وکړئ.');
      setIsSubmitting(false);
    }
  };

  // Default Plans Array
  const plans = [
    {
      id: '1-month',
      name: language === 'en' ? '1 Month Plan' : (language === 'dr' ? 'پلان ۱ ماهه' : '۱ میاشت VIP'),
      price: '150 AFN',
      days: 30,
      description: language === 'en' ? '30 Days Full Access' : '۳۰ ورځې بې له اعلاناتو د ۴کا سټریم درلودل',
      tag: language === 'en' ? 'Standard' : 'عادي'
    },
    {
      id: '3-months',
      name: language === 'en' ? '3 Months Plan' : (language === 'dr' ? 'پلان ۳ ماهه' : '۳ میاشتې VIP'),
      price: '350 AFN',
      days: 90,
      description: language === 'en' ? '90 Days High Speed Access' : '۹۰ ورځې بې خنډه سټریم او د ټولو نویو فلمونو ننداره',
      tag: language === 'en' ? 'Popular' : 'مشهور 🔥'
    },
    {
      id: '1-year',
      name: language === 'en' ? '1 Year Plan' : (language === 'dr' ? 'پلان ۱ ساله' : '۱ کال VIP'),
      price: '999 AFN',
      days: 365,
      description: language === 'en' ? '365 Days Premium VIP' : '۳۶۵ ورځې د سرو زرو اکونټ له ۵۰٪ تخفیف سره',
      tag: language === 'en' ? 'Best Value' : 'غوره بیه 👑'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transition-all text-slate-100 flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-rose-600 flex items-center justify-center shadow-lg text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{language === 'en' ? 'Zama TV VIP Subscription' : 'د زما ټلویزیون VIP اکونټ او پروفایل'}</span>
              </h3>
              <p className="text-[11px] text-slate-400">zamatv.site Premium Network</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top User Greeting / Navigation Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">
              {currentUser ? `👋 ${currentUser.name || currentUser.email}` : (language === 'en' ? 'Welcome Guest!' : 'ښه راغلاست!')}
            </span>
            {currentUser?.isVip ? (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>👑 {remainingDays} ورځې پاتې</span>
              </span>
            ) : currentUser?.hasPendingVip ? (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                ⏳ تر ریویو لاندې
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('plans')}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                viewMode === 'plans' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'en' ? 'Plans' : 'پلانونه'}
            </button>

            {currentUser ? (
              <button
                onClick={() => setViewMode('profile')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                  viewMode === 'profile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'My Profile' : 'زما پروفایل'}</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('auth')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'auth' ? 'bg-rose-600 text-white' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                🔑 {language === 'en' ? 'Login' : 'لاګین کیدل'}
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">
          
          {/* =========================================================================
             VIEW 1: SHOW ONLY PLANS (1 Month, 3 Months, 1 Year)
             ========================================================================= */}
          {viewMode === 'plans' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1.5 pb-2">
                <h4 className="text-sm sm:text-base font-black text-white">
                  {language === 'en' ? 'Choose Your VIP Subscription Plan' : 'د خپل لېوالتیا له مخې VIP پلان وټاکئ'}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {language === 'en' 
                    ? 'Select a package to upgrade your account and watch all 4K movies & sports channels.' 
                    : 'د ټولو نویو ژباړل شویو افغاني فلمونو او خپرونو بې له اعلاناتو کتنې لپاره لاندې یو پلان غوره کړئ:'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between group ${
                      plan.id === '3-months'
                        ? 'bg-gradient-to-r from-rose-950/30 via-slate-950 to-slate-950 border-rose-500/50 hover:border-rose-400 shadow-lg shadow-rose-950/20'
                        : plan.id === '1-year'
                        ? 'bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-950 border-amber-500/50 hover:border-amber-400 shadow-lg shadow-amber-950/20'
                        : 'bg-slate-950 hover:bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Tag Badge */}
                    {plan.tag && (
                      <div className={`absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-xl text-[10px] font-black uppercase tracking-wider ${
                        plan.id === '3-months' 
                          ? 'bg-rose-600 text-white' 
                          : plan.id === '1-year' 
                          ? 'bg-amber-500 text-slate-950 font-black' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {plan.tag}
                      </div>
                    )}

                    <div className="space-y-1 pr-2 pt-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-white group-hover:text-rose-400 transition">
                          {plan.name}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-400">{plan.description}</p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className={`text-base font-black px-3 py-1.5 rounded-xl border ${
                        plan.id === '1-year'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                      }`}>
                        {plan.price}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 font-bold">
                        {language === 'en' ? 'Click to Buy' : 'اخیستلو لپاره کلیک'} ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* VIP Benefits Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 mt-2">
                <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{language === 'en' ? 'VIP Membership Features:' : 'د VIP غړیتوب سهولتونه:'}</span>
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>د ټولو نویو فلمونو او سیریلونو کتنه</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>د سوداګریزو اعلاناتو په بشپړ ډول بندول</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>په ۴کا او ۱۰۸۰پي HD کیفیت بې له ځنډه</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>د لوبو او کرکټ بې بفرینګ مستقیم خپرول</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* =========================================================================
             VIEW 2: PLAN ORDER FORM (Email, Password, Avatar, Phone, Payment Screenshot)
             ========================================================================= */}
          {viewMode === 'order' && selectedPlan && !orderSubmitted && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Back & Summary Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <button
                  onClick={() => setViewMode('plans')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4 ltr:rotate-0 rtl:rotate-180" />
                  <span>{language === 'en' ? 'Back to Plans' : 'شاته (پلانونو ته)'}</span>
                </button>

                <div className="text-right rtl:text-right">
                  <span className="text-[10px] text-slate-400 block">{language === 'en' ? 'Selected Package:' : 'غوره شوی پلان:'}</span>
                  <span className="text-xs font-black text-amber-400 font-mono">{selectedPlan.name} ({selectedPlan.price})</span>
                </div>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Purchase Form */}
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-rose-400" />
                    <span>{language === 'en' ? 'Email Address *' : 'ایمیل ادرس (Email) *'}</span>
                  </label>
                  <input
                    type="email"
                    value={orderEmail}
                    onChange={(e) => setOrderEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 text-xs rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition font-mono"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'en' ? 'Account Password *' : 'د اکونټ شفر / پاسورډ (Password) *'}</span>
                  </label>
                  <input
                    type="text"
                    value={orderPassword}
                    onChange={(e) => setOrderPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 text-xs rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition font-mono"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'en' ? 'Mobile Phone Number *' : 'د اړیکې موبایل شمیره (Phone) *'}</span>
                  </label>
                  <input
                    type="tel"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    placeholder="0799123456"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 text-xs rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition font-mono"
                    required
                  />
                </div>

                {/* Profile Photo Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-blue-400" />
                      <span>{language === 'en' ? 'Profile Photo (Avatar)' : 'د پروفایل عکس (Profile Photo)'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{language === 'en' ? 'Optional' : 'اختیاري'}</span>
                  </label>
                  
                  <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {orderAvatar ? (
                        <img src={orderAvatar} alt="Profile preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    <label className="flex-1 cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>{orderAvatar ? (language === 'en' ? 'Change Photo' : 'عکس بدلون') : (language === 'en' ? 'Upload Profile Photo' : 'عکس پورته کول')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setOrderAvatar)}
                      />
                    </label>
                  </div>
                </div>

                {/* Payment Method Selector & Details */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>د تادیې لاره غوره کړئ (Payment Method)</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'mpaisa', label: 'M-Paisa' },
                      { id: 'hesabpay', label: 'HesabPay' },
                      { id: 'asan', label: 'Asan' },
                      { id: 'bank', label: 'Bank Acc' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                          paymentMethod === method.id
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {/* Account Transfer Box */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">{language === 'en' ? 'Send Payment To:' : 'پیسې دې شمیرې ته واستوئ:'}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(paymentNumbers[paymentMethod])}
                        className="text-[10px] text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1 transition"
                      >
                        <Copy className="w-3 h-3" />
                        <span>کاپي</span>
                      </button>
                    </div>
                    
                    <div className="p-2.5 bg-slate-900 rounded-lg text-xs font-mono font-bold text-amber-300 text-center select-all border border-slate-800">
                      {paymentNumbers[paymentMethod]}
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-rose-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>د پیمینټ سکرین شاټ عکس (Payment Screenshot) *</span>
                    </span>
                  </label>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <label className="cursor-pointer bg-gradient-to-r from-rose-900/30 to-amber-900/30 hover:from-rose-900/50 hover:to-amber-900/50 text-rose-300 border border-rose-500/40 p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4 text-rose-400 animate-bounce" />
                      <span>{orderScreenshot ? (language === 'en' ? 'Change Screenshot' : 'د تادیې بل عکس پورته کول') : (language === 'en' ? 'Upload Payment Screenshot' : 'د لیږلو د رسید سکرین شاټ غوره کړئ')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setOrderScreenshot)}
                        required={paymentMethod !== 'coupon'}
                      />
                    </label>

                    {orderScreenshot && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                        <img src={orderScreenshot} alt="Payment Screenshot Preview" className="w-full h-full object-contain" />
                        <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                          ✓ رسید پورته شو
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'en' ? 'Transaction ID / Reference Code' : 'د راکړې ورکړې ایډي / رسید شمیره (Transaction ID)'}</span>
                  </label>
                  <input
                    type="text"
                    value={orderTransId}
                    onChange={(e) => setOrderTransId(e.target.value)}
                    placeholder="مثلاً: 988214 یا TRX-102"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 text-xs rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition font-mono"
                  />
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>{language === 'en' ? 'Submitting...' : 'معلومات اډمین ته لیږل کیږي...'}</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{language === 'en' ? 'Submit Order to Admin' : 'د VIP غوښتنه او رسید اډمین ته لیږل 🚀'}</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          )}

          {/* =========================================================================
             VIEW 3: SUBMITTED CONFIRMATION SCREEN
             ========================================================================= */}
          {viewMode === 'order' && orderSubmitted && (
            <div className="p-6 text-center space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
                ✓
              </div>
              
              <h4 className="text-lg font-black text-white">
                {language === 'en' ? 'VIP Request Submitted to Admin!' : 'ستاسو معلومات او د تادیې رسید په بریالیتوب اډمین ته واستول شو!'}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {language === 'en' 
                  ? 'Your payment screenshot and details are now under Admin review. Once approved, your VIP subscription will automatically activate!' 
                  : 'زموږ اډمین به ستاسو لخوا لیږل شوی د پیمینټ سکرین شاټ، ایمیل او د اړیکې شمیره وګوري. تر تایید وروسته به ستاسو اکونټ سمدستي VIP شي.'}
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setViewMode('profile')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  {language === 'en' ? 'View My Profile' : 'زما پروفایل کتل'}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  {language === 'en' ? 'Close Window' : 'مننه / بندول'}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
             VIEW 4: USER LOGIN FORM (FOR VIP ACCOUNTS)
             ========================================================================= */}
          {viewMode === 'auth' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-base">
                  🔑
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  {language === 'en' ? 'VIP Account Login' : 'خپل VIP اکونټ ته لاګین شئ'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {language === 'en' ? 'Enter your registered Email or Phone and Password' : 'کله چې تاسو پلان غوره کوئ هلته ثبت نام کېږئ. دلته خپل لاګین معلومات داخل کړئ.'}
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUserLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">ایمیل یا ټلیفون شمیره (Email / Phone)</label>
                  <input
                    type="text"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="user@gmail.com یا 0799..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">پټ نوم (Password)</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white rounded-xl font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>🚀 خپل اکونټ ته ننوتل (Login)</span>
                </button>
              </form>

              <div className="pt-2 text-center border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setViewMode('plans')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold transition"
                >
                  ثبت نام نلرئ؟ د VIP پلان اخیستلو لپاره دلته کلیک وکړئ ✨
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
             VIEW 5: DETAILED USER PROFILE TAB (DAYS REMAINING COUNTER WIDGET)
             ========================================================================= */}
          {viewMode === 'profile' && currentUser && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center gap-3.5 relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-rose-500/40 overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-rose-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-white truncate">{currentUser.name || 'User'}</h4>
                    {currentUser.isVip && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow">
                        <Crown className="w-3 h-3 text-amber-400" />
                        <span>VIP Member</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono truncate">📧 {currentUser.email}</p>
                  {currentUser.phone && (
                    <p className="text-xs text-slate-400 font-mono truncate">📱 {currentUser.phone}</p>
                  )}
                </div>
              </div>

              {/* 👑 VIP DAYS REMAINING COUNTER WIDGET */}
              {currentUser.isVip ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-950 border-2 border-amber-500/40 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                        <Crown className="w-5 h-5 animate-bounce" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-amber-300 uppercase tracking-wide">ستاسو د VIP پلان پاتې شوې ورځې</h5>
                        <p className="text-[11px] text-slate-400">VIP Subscription Validity</p>
                      </div>
                    </div>

                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-xs font-black">
                      ✓ فعال اکونټ
                    </span>
                  </div>

                  {/* Big Number Remaining Days */}
                  <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <div className="text-3xl font-black text-amber-400 font-mono">
                        {remainingDays} <span className="text-sm font-sans text-slate-300">ورځې</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {remainingDays > 0 ? `${remainingDays} ورځې پاتې دي` : 'د غړیتوب وخت ختم شوی'}
                      </p>
                    </div>

                    <div className="text-right text-xs font-mono space-y-1">
                      <span className="text-slate-400 block text-[10px]">د پای نیټه (Expiry):</span>
                      <strong className="text-emerald-400 font-bold block bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {currentUser.vipExpiresAt ? new Date(currentUser.vipExpiresAt).toISOString().split('T')[0] : '—'}
                      </strong>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                      <span>مصرف شوی وخت</span>
                      <span className="text-amber-400">{remainingDays} / 30 ورځې پاتې</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, (remainingDays / 30) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Benefits Unlocked Checklist */}
                  <div className="pt-2 space-y-2 border-t border-slate-800/80">
                    <h6 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>ستاسو اکونټ لاندې ټولو اسانتیاو ته ازاده رسېدنه لري:</span>
                    </h6>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>د ټولو نویو افغاني او خارجي فلمونو ننداره</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>۴کا او ۱۰۸۰پي HD خپرونې بې له ځنډه</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>د ټولو اعلاناتو په بشپړ ډول بندول</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>د سپورتي او کرکټ چینلونو ازاد پخش</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : currentUser.hasPendingVip ? (
                <div className="p-4 rounded-2xl bg-amber-950/20 border-2 border-amber-500/40 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-lg animate-bounce">
                    ⏳
                  </div>
                  <h5 className="text-sm font-extrabold text-amber-300">ستاسو د VIP غوښتنه تر څېړنې لاندې ده</h5>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    زموږ اډمین به ژر ستاسو لخوا لیږل شوی د تادیې سکرین شاټ تایید کړي. تر تایید وروسته به ستاسو پروفایل په لاسي یا اتومات ډول VIP شي.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <span className="text-2xl block">👤</span>
                  <h5 className="text-xs font-bold text-slate-200">ستاسو اکونټ اوس مهال عادي (وړیا) دی</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    د پریمیوم فلمونو او ۴کا سټریم د لیدلو لپاره، مهرباني وکړئ خپل اکونټ VIP کړئ.
                  </p>
                </div>
              )}

              {/* Extension or Upgrade CTA */}
              <button
                onClick={() => setViewMode('plans')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>{currentUser.isVip ? 'د VIP غړیتوب وخت غځول / نوی کول 👑' : 'د VIP اکونټ اخیستل 👑'}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'en' ? 'Logout / Switch Account' : 'له اکونټ وتل / د بل اکونټ بدلول'}</span>
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

