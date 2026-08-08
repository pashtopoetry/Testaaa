import React, { useState, useEffect } from 'react';
import { Channel, Category, Province, Language } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Tv, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Radio, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  ArrowRight,
  Eye,
  Settings,
  Film,
  Send,
  Bot,
  Zap,
  Sparkles,
  Users,
  Crown,
  CreditCard
} from 'lucide-react';
import { afghanChannels } from '../data/channels';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  language: Language;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  channels,
  setChannels,
  language,
}) => {
  // Passcode authentication state
  const [passcode, setPasscode] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passError, setPassError] = useState<string>('');

  // Stored passcode (Default: '1234')
  const [storedCode, setStoredCode] = useState<string>(() => {
    return localStorage.getItem('zama_admin_passcode') || '1234';
  });

  // Change Passcode State
  const [showChangePassModal, setShowChangePassModal] = useState<boolean>(false);
  const [oldCodeInput, setOldCodeInput] = useState<string>('');
  const [newCodeInput, setNewCodeInput] = useState<string>('');
  const [confirmCodeInput, setConfirmCodeInput] = useState<string>('');
  const [changePassSuccess, setChangePassSuccess] = useState<string>('');
  const [changePassError, setChangePassError] = useState<string>('');

  // Editing / Adding Channel State
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'channels' | 'tickets' | 'plansConfig' | 'paymentMethods' | 'users' | 'reports'>('channels');
  const [vipTickets, setVipTickets] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '' });
  const [actionNotice, setActionNotice] = useState<string>('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const firebaseUid = userCredential.user.uid;

      const now = new Date().toISOString();
      const newUserObj = {
          id: firebaseUid,
          ...newUser,
          isVip: false,
          deviceLocked: true,
          deviceId: null,
          createdAt: now
      };

      // 2. Save user document in Firestore
      await setDoc(doc(db, 'users', firebaseUid), newUserObj);

      // 3. Save locally
      const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
      users.push(newUserObj);
      localStorage.setItem('zama_users', JSON.stringify(users));
      setUsersList(users);

      setNewUser({ name: '', email: '', password: '', phone: '' });
      setActionNotice(language === 'en' ? 'User successfully created & registered in Firebase!' : 'یوزر په فایربیس کې په بریالیتوب سره ثبت او جوړ شو!');
      setTimeout(() => setActionNotice(''), 3000);
    } catch (err: any) {
      console.error("Firebase Auth error during user creation:", err);
      // Fallback local creation
      const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
      const now = new Date().toISOString();
      const newUserObj = {
          id: 'user-' + Date.now(),
          ...newUser,
          isVip: false,
          deviceLocked: true,
          deviceId: null,
          createdAt: now
      };
      users.push(newUserObj);
      localStorage.setItem('zama_users', JSON.stringify(users));
      setUsersList(users);
      setNewUser({ name: '', email: '', password: '', phone: '' });
      setActionNotice(language === 'en' ? 'User created locally (Firebase: ' + (err.message || 'Error') + ')' : 'یوزر په ځایی ډول جوړ شو (د فایربیس تېروتنه)');
      setTimeout(() => setActionNotice(''), 3500);
    }
  };

  const handleAssignPlanToUser = (userId: string, days: number) => {
    const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
    const now = new Date();
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const updated = users.map((u: any) => {
      if (u.id === userId) {
        return {
          ...u,
          isVip: true,
          vipStartedAt: now.toISOString(),
          vipExpiresAt: expiry.toISOString(),
          vipExpiry: expiry.toISOString()
        };
      }
      return u;
    });

    localStorage.setItem('zama_users', JSON.stringify(updated));
    setUsersList(updated);

    const currentUser = JSON.parse(localStorage.getItem('zama_current_user') || 'null');
    if (currentUser && currentUser.id === userId) {
      const updatedCurr = updated.find((u: any) => u.id === userId);
      localStorage.setItem('zama_current_user', JSON.stringify(updatedCurr));
    }

    setActionNotice(`VIP plan assigned successfully (${days} days)!`);
    setTimeout(() => setActionNotice(''), 2500);
  };

  const handleRevokeVip = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
    const updated = users.map((u: any) => {
      if (u.id === userId) {
        return {
          ...u,
          isVip: false,
          vipExpiresAt: null,
          vipExpiry: null
        };
      }
      return u;
    });

    localStorage.setItem('zama_users', JSON.stringify(updated));
    setUsersList(updated);

    const currentUser = JSON.parse(localStorage.getItem('zama_current_user') || 'null');
    if (currentUser && currentUser.id === userId) {
      const updatedCurr = updated.find((u: any) => u.id === userId);
      localStorage.setItem('zama_current_user', JSON.stringify(updatedCurr));
    }

    setActionNotice('VIP status revoked.');
    setTimeout(() => setActionNotice(''), 2500);
  };

  // Search filter inside admin
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');
  const [plans, setPlans] = useState(() => {
    return JSON.parse(localStorage.getItem('zama_plans_config') || JSON.stringify([
      { id: '1-month', name: '۱ میاشت VIP', price: '150 AFN', days: 30, tag: 'عادي', description: '۳۰ ورځې بې له اعلاناتو د ۴کا سټریم درلودل' },
      { id: '3-months', name: '۳ میاشتې VIP', price: '350 AFN', days: 90, tag: 'مشهور 🔥', description: '۹۰ ورځې بې خنډه سټریم او د ټولو نویو فلمونو ننداره' },
      { id: '1-year', name: '۱ کال VIP', price: '999 AFN', days: 365, tag: 'غوره بیه 👑', description: '۳۶۵ ورځې د سرو زرو اکونټ له ۵۰٪ تخفیف سره' }
    ]));
  });

  const handleUpdatePlan = (index: number, field: string, value: string | number) => {
    const updatedPlans = [...plans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    setPlans(updatedPlans);
    localStorage.setItem('zama_plans_config', JSON.stringify(updatedPlans));
    setActionNotice(language === 'en' ? 'Plan updated successfully!' : 'د پلان مشخصات بدلون وموند او خوندي شو!');
    setTimeout(() => setActionNotice(''), 2000);
  };

  const handleAddPlan = () => {
    const newPlan = {
      id: `plan-${Date.now()}`,
      name: '۶ میاشتې VIP',
      price: '600 AFN',
      days: 180,
      tag: 'ویژه 🌟',
      description: '۱۸۰ ورځې بې خنډه VIP لاسرسی'
    };
    const updated = [...plans, newPlan];
    setPlans(updated);
    localStorage.setItem('zama_plans_config', JSON.stringify(updated));
    setActionNotice(language === 'en' ? 'New VIP Plan added!' : 'نوی VIP پلان په بریالیتوب اضافه شو!');
    setTimeout(() => setActionNotice(''), 2500);
  };

  const handleDeletePlan = (index: number) => {
    if (window.confirm(language === 'en' ? 'Are you sure you want to delete this plan?' : 'ایا باوري یاست چې دا VIP پلان پاکول غواړئ؟')) {
      const updated = plans.filter((_: any, i: number) => i !== index);
      setPlans(updated);
      localStorage.setItem('zama_plans_config', JSON.stringify(updated));
      setActionNotice(language === 'en' ? 'Plan deleted successfully.' : 'پلان پاک شو.');
      setTimeout(() => setActionNotice(''), 2500);
    }
  };

  // Payment Methods Configuration State
  const defaultPaymentMethods = [
    { id: 'mpaisa', name: 'M-Paisa', accountDetails: 'M-Paisa: +93 799 123 456 (Zama TV Pay)', enabled: true },
    { id: 'hesabpay', name: 'HesabPay', accountDetails: 'HesabPay ID: @zamatv | +93 79 555 1234', enabled: true },
    { id: 'asan', name: 'Asan Khedmat', accountDetails: 'Asan Khedmat / Mobile: +93 788 123 456', enabled: true },
    { id: 'bank', name: 'Bank Acc', accountDetails: 'Afghan United Bank ACC: 001-9988231 (Zama TV)', enabled: true }
  ];

  const [paymentMethods, setPaymentMethods] = useState<any[]>(() => {
    const custom = localStorage.getItem('zama_payment_methods');
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return defaultPaymentMethods;
  });

  const handleUpdatePaymentMethod = (index: number, field: string, value: any) => {
    const updated = [...paymentMethods];
    updated[index] = { ...updated[index], [field]: value };
    setPaymentMethods(updated);
    localStorage.setItem('zama_payment_methods', JSON.stringify(updated));

    if (db) {
      setDoc(doc(db, 'settings', 'payment_methods'), { methods: updated }, { merge: true }).catch(() => {});
    }
    setActionNotice(language === 'en' ? 'Payment method updated!' : 'د تادیې لاره په بریالیتوب اپډیټ شوه!');
    setTimeout(() => setActionNotice(''), 2500);
  };

  const handleAddPaymentMethod = () => {
    const newMethod = {
      id: `payment-${Date.now()}`,
      name: 'نوی د تادیې سیستم',
      accountDetails: 'د حساب شمیره او معلومات داخل کړئ',
      enabled: true
    };
    const updated = [...paymentMethods, newMethod];
    setPaymentMethods(updated);
    localStorage.setItem('zama_payment_methods', JSON.stringify(updated));

    if (db) {
      setDoc(doc(db, 'settings', 'payment_methods'), { methods: updated }, { merge: true }).catch(() => {});
    }
    setActionNotice(language === 'en' ? 'New payment method added!' : 'نوی د تادیې سیستم اضافه شو!');
    setTimeout(() => setActionNotice(''), 2500);
  };

  const handleDeletePaymentMethod = (index: number) => {
    if (window.confirm(language === 'en' ? 'Delete this payment method?' : 'ایا باوري یاست چې دا د تادیې لاره حذف کوئ؟')) {
      const updated = paymentMethods.filter((_, i) => i !== index);
      setPaymentMethods(updated);
      localStorage.setItem('zama_payment_methods', JSON.stringify(updated));

      if (db) {
        setDoc(doc(db, 'settings', 'payment_methods'), { methods: updated }, { merge: true }).catch(() => {});
      }
      setActionNotice(language === 'en' ? 'Payment method deleted!' : 'د تادیې لاره حذف شوه!');
      setTimeout(() => setActionNotice(''), 2500);
    }
  };

  // Load VIP Tickets, Pending Payments, Users, Reports
  useEffect(() => {
    if (isOpen) {
      const tickets = JSON.parse(localStorage.getItem('zama_vip_tickets') || '[]');
      setVipTickets(tickets);
      const payments = JSON.parse(localStorage.getItem('zama_vip_tickets') || '[]');
      setPendingPayments(payments);
      const storedReports = JSON.parse(localStorage.getItem('zama_reports') || '[]');
      setReports(storedReports);
      const u = JSON.parse(localStorage.getItem('zama_users') || '[]');
      setUsersList(u);

      if (db) {
        getDoc(doc(db, 'settings', 'payment_methods')).then((snap) => {
          if (snap.exists() && snap.data()?.methods) {
            const remote = snap.data().methods;
            if (Array.isArray(remote) && remote.length > 0) {
              setPaymentMethods(remote);
              localStorage.setItem('zama_payment_methods', JSON.stringify(remote));
            }
          }
        }).catch(() => {});
      }
    }
  }, [isOpen, actionNotice]);

  const handleApprovePayment = (paymentId: string, userId: string) => {
    const updatedPayments = pendingPayments.map((p: any) => p.id === paymentId ? { ...p, status: 'approved' } : p);
    setPendingPayments(updatedPayments);
    localStorage.setItem('zama_pending_payments', JSON.stringify(updatedPayments));

    const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const updatedUsers = users.map((u: any) => {
        if (u.id === userId) {
            return { ...u, isVip: true, vipStartedAt: now.toISOString(), vipExpiresAt: expiry.toISOString(), vipExpiry: expiry.toISOString() };
        }
        return u;
    });
    localStorage.setItem('zama_users', JSON.stringify(updatedUsers));
    setUsersList(updatedUsers);
    
    setActionNotice('User upgraded to Premium successfully!');
    setTimeout(() => setActionNotice(''), 2500);
  };

  const handleApproveTicket = async (ticketId: string, ticketIdentifier: string) => {
    const tickets = JSON.parse(localStorage.getItem('zama_vip_tickets') || '[]');
    const targetTicket = tickets.find((t: any) => t.id === ticketId);
    const updatedTickets = tickets.map((t: any) => t.id === ticketId ? { ...t, status: 'approved' } : t);
    localStorage.setItem('zama_vip_tickets', JSON.stringify(updatedTickets));
    setVipTickets(updatedTickets);

    const daysToAdd = targetTicket?.days || 30;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    const userEmail = (targetTicket?.userEmail || ticketIdentifier || '').trim().toLowerCase();
    const userPassword = (targetTicket?.userPassword || '123456').trim();

    // 1. Create account in Firebase Auth if email and password available
    if (userEmail && userEmail.includes('@') && userPassword && userPassword.length >= 4) {
      try {
        await createUserWithEmailAndPassword(auth, userEmail, userPassword);
      } catch (authErr: any) {
        console.warn("Firebase Auth creation during approval:", authErr?.message);
      }
    }

    // 2. Save ticket approval in Firestore
    try {
      await setDoc(doc(db, 'vip_tickets', ticketId), { 
        status: 'approved',
        approvedAt: now.toISOString(),
        vipExpiresAt: expiryDate.toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore ticket update error:", e);
    }

    // 3. Update local users and Firestore users collection
    const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
    let userFound = false;

    const updatedUsers = users.map((u: any) => {
      const isMatch = (userEmail && u.email?.toLowerCase() === userEmail) ||
                      (targetTicket?.userId && u.id === targetTicket.userId) ||
                      (u.username === ticketIdentifier);
      if (isMatch) {
        userFound = true;
        const updated = {
          ...u,
          email: userEmail || u.email,
          password: userPassword || u.password,
          isVip: true,
          hasPendingVip: false,
          vipStartedAt: now.toISOString(),
          vipExpiresAt: expiryDate.toISOString(),
          vipExpiry: expiryDate.toISOString().split('T')[0]
        };
        
        if (db) {
          const docId = u.id || userEmail.replace(/[^a-zA-Z0-9]/g, '_');
          setDoc(doc(db, 'users', docId), updated, { merge: true }).catch(() => {});
          if (userEmail) {
            setDoc(doc(db, 'users', userEmail.replace(/[^a-zA-Z0-9]/g, '_')), updated, { merge: true }).catch(() => {});
          }
        }
        return updated;
      }
      return u;
    });

    if (!userFound && userEmail) {
      const newVipUser = {
        id: targetTicket?.userId || `user-${Date.now()}`,
        name: targetTicket?.userName || userEmail.split('@')[0],
        email: userEmail,
        password: userPassword,
        phone: targetTicket?.userPhone || '',
        avatar: targetTicket?.userAvatar || null,
        isVip: true,
        hasPendingVip: false,
        vipStartedAt: now.toISOString(),
        vipExpiresAt: expiryDate.toISOString(),
        vipExpiry: expiryDate.toISOString().split('T')[0],
        createdAt: now.toISOString()
      };
      updatedUsers.push(newVipUser);

      if (db) {
        const docId = newVipUser.id;
        const emailDocId = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
        setDoc(doc(db, 'users', docId), newVipUser, { merge: true }).catch(() => {});
        setDoc(doc(db, 'users', emailDocId), newVipUser, { merge: true }).catch(() => {});
      }
    }

    localStorage.setItem('zama_users', JSON.stringify(updatedUsers));
    setUsersList(updatedUsers);

    // Update active currentUser if matching
    const currUser = JSON.parse(localStorage.getItem('zama_current_user') || 'null');
    if (currUser && (currUser.email?.toLowerCase() === userEmail || currUser.id === targetTicket?.userId)) {
      const updatedCurr = {
        ...currUser,
        isVip: true,
        hasPendingVip: false,
        vipStartedAt: now.toISOString(),
        vipExpiresAt: expiryDate.toISOString(),
        vipExpiry: expiryDate.toISOString().split('T')[0]
      };
      localStorage.setItem('zama_current_user', JSON.stringify(updatedCurr));
    }

    setActionNotice(language === 'en' ? 'VIP request approved & account registered in Firebase!' : 'د VIP غړیتوب غوښتنه تایید شوه او اکونټ فایربیس کې ثبت شو!');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleDeclineTicket = async (ticketId: string) => {
    const tickets = JSON.parse(localStorage.getItem('zama_vip_tickets') || '[]');
    const updatedTickets = tickets.map((t: any) => t.id === ticketId ? { ...t, status: 'declined' } : t);
    localStorage.setItem('zama_vip_tickets', JSON.stringify(updatedTickets));
    setVipTickets(updatedTickets);

    try {
      await setDoc(doc(db, 'vip_tickets', ticketId), { status: 'declined' }, { merge: true });
    } catch (e) {}

    setActionNotice(language === 'en' ? 'VIP request declined.' : 'د VIP غړیتوب غوښتنه رد شوه.');
    setTimeout(() => setActionNotice(''), 2500);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm(language === 'en' ? 'Are you sure you want to delete this ticket?' : 'ایا باوري یاست چې دا غوښتنه (ټکټ) پاکول غواړئ؟')) {
      const tickets = JSON.parse(localStorage.getItem('zama_vip_tickets') || '[]');
      const updatedTickets = tickets.filter((t: any) => t.id !== ticketId);
      localStorage.setItem('zama_vip_tickets', JSON.stringify(updatedTickets));
      setVipTickets(updatedTickets);

      try {
        await deleteDoc(doc(db, 'vip_tickets', ticketId));
      } catch (e) {
        // silent catch
      }

      setActionNotice(language === 'en' ? 'Ticket deleted successfully.' : 'د غوښتنې ټکټ په بریالیتوب سره پاک شو.');
      setTimeout(() => setActionNotice(''), 2500);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(language === 'en' ? 'Are you sure you want to delete this user?' : 'ایا باوري یاست چې دا اکونټ/کاروونکی حذفول غواړئ؟')) {
      const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
      const updatedUsers = users.filter((u: any) => u.id !== userId && u.email !== userId);
      localStorage.setItem('zama_users', JSON.stringify(updatedUsers));
      setUsersList(updatedUsers);

      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (e) {
        // silent catch
      }

      setActionNotice(language === 'en' ? 'User deleted successfully.' : 'کاروونکی (اکونټ) په بریالیتوب سره حذف شو.');
      setTimeout(() => setActionNotice(''), 2500);
    }
  };

  // Channel Form Fields
  const [formData, setFormData] = useState<Partial<Channel>>({
    name: '',
    nameDr: '',
    nameEn: '',
    number: 1,
    category: 'news',
    province: 'kabul',
    location: 'کابل - افغانستان',
    quality: '1080p HD',
    isLive: true,
    viewers: 1000,
    likes: 500,
    frequency: 'Yahsat 52.5°E | 12015 H 27500',
    language: 'پښتو / دري',
    description: '',
    streamUrl: '',
    fallbackStreamUrl: '',
    iframeUrl: '',
    logo: '',
    bannerImg: '',
    isRadio: false,
    isPremium: false,
  });

  if (!isOpen) return null;

  // Handle Login Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === storedCode) {
      setIsAuthenticated(true);
      setPassError('');
    } else {
      setPassError(language === 'en' ? 'Incorrect passcode!' : 'امنیتي کوډ غلط دی!');
    }
  };

  // Handle Passcode Change
  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError('');
    setChangePassSuccess('');

    if (oldCodeInput !== storedCode) {
      setChangePassError(language === 'en' ? 'Current passcode is incorrect!' : 'اوسنی کوډ غلط دی!');
      return;
    }

    if (!newCodeInput.trim() || newCodeInput.length < 3) {
      setChangePassError(language === 'en' ? 'New code must be at least 3 characters!' : 'نوی کوډ باید لږ تر لږه ۳ تورې وي!');
      return;
    }

    if (newCodeInput !== confirmCodeInput) {
      setChangePassError(language === 'en' ? 'New passcodes do not match!' : 'نوي داخل شوي کوډونه تصدیق نشول!');
      return;
    }

    localStorage.setItem('zama_admin_passcode', newCodeInput);
    setStoredCode(newCodeInput);
    setChangePassSuccess(language === 'en' ? 'Admin passcode updated successfully!' : 'د اډمین پینل پاسکوډ په بریا بدل شو!');
    setOldCodeInput('');
    setNewCodeInput('');
    setConfirmCodeInput('');
    setTimeout(() => {
      setShowChangePassModal(false);
      setChangePassSuccess('');
    }, 1800);
  };

  // Open Edit Form
  const handleStartEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setIsAddingNew(false);
    setFormData({ ...channel });
  };

  // Open Add TV Channel Form
  const handleStartAdd = () => {
    setEditingChannel(null);
    setIsAddingNew(true);
    setFormData({
      id: `custom-ch-${Date.now()}`,
      number: channels.length + 1,
      name: '',
      nameDr: '',
      nameEn: '',
      category: 'news',
      province: 'kabul',
      location: 'کابل - افغانستان',
      quality: '1080p HD',
      isLive: true,
      viewers: 1200,
      likes: 800,
      frequency: 'Yahsat 52.5°E | 12015 H 27500',
      language: 'پښتو / دري',
      description: '',
      streamUrl: '',
      fallbackStreamUrl: '',
      iframeUrl: '',
      logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
      bannerImg: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1200&q=80',
      isRadio: false,
      isMovie: false,
      isPremium: false,
      epg: []
    });
  };

  // Open Add Movie Form (🎬 د فلم پورته کول / اضافه کول)
  const handleStartAddMovie = () => {
    setEditingChannel(null);
    setIsAddingNew(true);
    setFormData({
      id: `movie-${Date.now()}`,
      number: channels.length + 1,
      name: '',
      nameDr: '',
      nameEn: '',
      category: 'movies',
      province: 'kabul',
      location: 'سینما - پښتو دوبله',
      quality: '1080p HD',
      isLive: false,
      viewers: 2500,
      likes: 1200,
      frequency: 'Pashto Cinema HD',
      language: 'پښتو دوبله',
      description: 'د پښتو ژباړل شوي او سینمایي فلم عالی او روښانه کتنه.',
      streamUrl: '',
      fallbackStreamUrl: '',
      iframeUrl: '',
      logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
      bannerImg: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
      isRadio: false,
      isMovie: true,
      isPremium: false,
      releaseYear: '2024',
      duration: '1h 45m',
      epg: []
    });
  };

  // Save Channel or Movie (Add or Edit)
  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryUrl = formData.streamUrl?.trim() || formData.iframeUrl?.trim() || formData.fallbackStreamUrl?.trim();

    if (!formData.name?.trim() || !primaryUrl) {
      alert(
        language === 'en' 
          ? 'Please enter Name and Video Stream Link' 
          : 'مهرباني وکړئ د فلم/چینل نوم او د ویډیو سټریم لینک حتمي داخل کړئ'
      );
      return;
    }

    const isMovieType = formData.category === 'movies' || formData.isMovie;
    let updatedList: Channel[] = [];

    if (isAddingNew) {
      const newChan: Channel = {
        id: formData.id || `${isMovieType ? 'movie' : 'ch'}-${Date.now()}`,
        number: Number(formData.number) || channels.length + 1,
        name: formData.name.trim(),
        nameDr: formData.nameDr?.trim() || formData.name.trim(),
        nameEn: formData.nameEn?.trim() || formData.name.trim(),
        category: (formData.category as Category) || (isMovieType ? 'movies' : 'news'),
        province: (formData.province as Province) || 'kabul',
        location: formData.location?.trim() || (isMovieType ? 'سینما' : 'کابل'),
        quality: formData.quality || '1080p HD',
        isLive: !isMovieType && (formData.isLive ?? true),
        viewers: Number(formData.viewers) || (isMovieType ? 2400 : 1000),
        likes: Number(formData.likes) || (isMovieType ? 1200 : 500),
        frequency: formData.frequency || (isMovieType ? 'Pashto Cinema HD' : 'Yahsat 52.5°E'),
        language: formData.language || 'پښتو',
        description: formData.description || '',
        streamUrl: formData.streamUrl?.trim() || formData.iframeUrl?.trim() || '',
        fallbackStreamUrl: formData.fallbackStreamUrl?.trim() || '',
        iframeUrl: formData.iframeUrl?.trim() || '',
        logo: formData.logo || (isMovieType ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80' : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80'),
        bannerImg: formData.bannerImg || (isMovieType ? 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1200&q=80'),
        isRadio: Boolean(formData.isRadio),
        isMovie: Boolean(isMovieType),
        isPremium: Boolean(formData.isPremium),
        releaseYear: formData.releaseYear || '2024',
        duration: formData.duration || '1h 45m',
        epg: formData.epg || []
      };
      updatedList = [newChan, ...channels];
      setActionNotice(
        language === 'en' 
          ? (isMovieType ? 'New Movie added successfully!' : 'New Channel added successfully!') 
          : (isMovieType ? '🎬 نوی فلم په بریا اضافه شو!' : '📺 نوی چینل په بریا اضافه شو!')
      );
    } else if (editingChannel) {
      updatedList = channels.map((c) => {
        if (c.id === editingChannel.id) {
          const finalStreamUrl = formData.streamUrl?.trim() || formData.iframeUrl?.trim() || c.streamUrl;
          return {
            ...c,
            ...formData,
            streamUrl: finalStreamUrl,
            number: Number(formData.number) || c.number,
            viewers: Number(formData.viewers) || c.viewers,
            likes: Number(formData.likes) || c.likes,
            isMovie: Boolean(isMovieType),
          } as Channel;
        }
        return c;
      });
      setActionNotice(language === 'en' ? 'Item details updated!' : 'د معلومات ایډیټ شول!');
    }

    setChannels(updatedList);
    try {
      localStorage.setItem('zama_channels_db', JSON.stringify(updatedList));
    } catch (err) {
      console.warn('Failed to store in localStorage', err);
    }

    setEditingChannel(null);
    setIsAddingNew(false);
    setTimeout(() => setActionNotice(''), 2500);
  };

  // Delete Channel or Movie Permanently
  const handleDeleteChannel = (channelId: string, name: string) => {
    const confirmMsg = language === 'en' 
      ? `Are you sure you want to permanently delete "${name}"?`
      : `ایا تاسو باوري یاست چې "${name}" په مطلق او دایمي ډول ډیلیټ کول غواړئ؟`;
      
    if (window.confirm(confirmMsg)) {
      const updatedList = channels.filter((c) => c.id !== channelId);
      setChannels(updatedList);
      try {
        localStorage.setItem('zama_channels_db', JSON.stringify(updatedList));
      } catch (err) {
        console.warn('Failed to update localStorage', err);
      }
      setActionNotice(language === 'en' ? 'Deleted successfully!' : 'حذف شو (په دایمي توګه پاک شو)!');
      setTimeout(() => setActionNotice(''), 2500);
    }
  };

  // Reset to Original Default Channels
  const handleResetDefaults = () => {
    const confirmMsg = language === 'en' 
      ? 'Reset all channels to original default Afghan channels list?' 
      : 'ایا غواړئ ټول چینلونه اصلی حالت او افغاني اصلی لیست ته بیا ورګرځوئ؟';
    
    if (window.confirm(confirmMsg)) {
      setChannels(afghanChannels);
      localStorage.removeItem('zama_channels_db');
      setActionNotice(language === 'en' ? 'Channels reset to defaults!' : 'اصلي چینلونه بېرته برقراره شول!');
      setTimeout(() => setActionNotice(''), 2500);
    }
  };

  // Filter channels inside admin list
  const adminFilteredChannels = channels.filter((c) => {
    const matchesCategory = adminCategoryFilter === 'all' || 
      (adminCategoryFilter === 'radio' ? c.isRadio : (adminCategoryFilter === 'movies' ? (c.isMovie || c.category === 'movies') : c.category === adminCategoryFilter));
    const query = adminSearch.toLowerCase().trim();
    const matchesQuery = !query || 
      c.name.toLowerCase().includes(query) || 
      c.nameEn?.toLowerCase().includes(query) || 
      (c.streamUrl && c.streamUrl.toLowerCase().includes(query)) ||
      c.number.toString() === query;

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      
      {/* Main Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>{language === 'en' ? 'ZamaTV Admin Control Panel' : 'د زما ټلویزیون (zamatv.site) اډمین پینل'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  zamatv.site/admin
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'en' 
                  ? 'Manage channel stream URLs, logos, links, categories and admin passcode' 
                  : 'د کانالونو او راډیوګانو نشراتي لینکونه، لوګو، عکسونه او سټریمونه ایډیټ او کنټرول کړئ'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="bg-emerald-600/20 border-b border-emerald-500/30 px-5 py-2.5 flex items-center gap-2 text-emerald-300 text-xs font-bold animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* 🔐 AUTHENTICATION PASSCODE SCREEN */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto text-center my-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                {language === 'en' ? 'Admin Access Required' : 'د اډمین امنیتی کوډ داخل کړئ'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'en' 
                  ? 'Please enter your secret admin passcode to manage channel links and settings. (Default Code: 1234)'
                  : 'د چینلونو د ایډیټ او تظیماتو لپاره د اډمین اختصاصی کوډ ولیکئ. (لومړنی کوډ: 1234)'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative">
                <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ltr:right-auto ltr:left-3.5" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder={language === 'en' ? 'Enter admin code...' : 'کوډ داخل کړه... (مثلا 1234)'}
                  className="w-full bg-slate-950 text-white text-sm rounded-xl pr-10 pl-4 ltr:pr-4 ltr:pl-10 py-3 border border-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-center tracking-widest font-mono text-lg"
                  autoFocus
                />
              </div>

              {passError && (
                <div className="text-xs font-bold text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{passError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-900/30 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{language === 'en' ? 'Unlock Admin Panel' : 'اډمین پینل ته ننوتل'}</span>
                <ArrowRight className="w-4 h-4 ltr:rotate-0 rtl:rotate-180" />
              </button>
            </form>
          </div>
        ) : (
          /* 🛠️ AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* 🧭 Admin Section Tabs Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => setAdminTab('channels')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'channels'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📺 د چینلونو او فلمونو مدیریت (TV & Movies)</span>
          </button>
          <button
            onClick={() => setAdminTab('tickets')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-black transition flex items-center justify-center gap-2 relative ${
              adminTab === 'tickets'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👑 د VIP ګډون غوښتنې (VIP Requests)</span>
            {vipTickets.filter(t => t.status === 'pending').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {vipTickets.filter(t => t.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminTab('plansConfig')}
            className={`flex-1 py-3 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 relative ${
              adminTab === 'plansConfig'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👑 پلانونو تنظیمات (Plans)</span>
          </button>
          <button
            onClick={() => setAdminTab('paymentMethods')}
            className={`flex-1 py-3 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 relative ${
              adminTab === 'paymentMethods'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💳 د تادیې لارې (Payment Methods)</span>
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-black transition flex items-center justify-center gap-2 relative ${
              adminTab === 'users'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👤 کاروونکي او پلانونه (Users & Plans)</span>
          </button>
          <button
            onClick={() => setAdminTab('reports')}
            className={`flex-1 py-3 px-4 rounded-lg text-xs font-black transition flex items-center justify-center gap-2 relative ${
              adminTab === 'reports'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🚨 راپورونه (Reports)</span>
            {reports.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {reports.length}
              </span>
            )}
          </button>
        </div>

        {adminTab === 'tickets' ? (
          /* =========================================================================
             👑 VIP TICKETS SUBSCRIPTIONS REQUESTS TAB
             ========================================================================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>د VIP ګډون غوښتنې او مالي تصدیق (VIP Subscription Approvals)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {language === 'en' ? `Pending Requests: ${vipTickets.filter(t => t.status === 'pending').length}` : `انتظار غوښتنې: ${vipTickets.filter(t => t.status === 'pending').length}`}
              </span>
            </div>

            {vipTickets.length === 0 ? (
              <div className="bg-slate-950/40 rounded-xl p-8 border border-slate-800 text-center text-slate-400 text-xs">
                {language === 'en' ? 'No subscription request tickets found yet.' : 'تراوسه د VIP غړیتوب هیڅ کومه غوښتنه نه ده ثبت شوې.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {[...vipTickets].reverse().map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-xl border transition flex flex-col gap-3 ${
                      ticket.status === 'pending'
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : ticket.status === 'approved'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      
                      {/* User Info with Avatar */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                          {ticket.userAvatar ? (
                            <img src={ticket.userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-slate-400">{ticket.userName?.charAt(0) || '👤'}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-white text-sm">👤 {ticket.userName || ticket.name || 'User'}</h4>
                            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-black">
                              👑 {ticket.planName || ticket.plan || 'VIP Plan'} ({ticket.planPrice || '—'})
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                              ticket.status === 'pending'
                                ? 'bg-amber-500 text-slate-950 animate-pulse'
                                : ticket.status === 'approved'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300'
                            }`}>
                              {ticket.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 font-mono flex items-center gap-3 mt-1 flex-wrap">
                            <span>📧 {ticket.userEmail || ticket.email || '—'}</span>
                            <span>🔑 پټنوم: <strong className="text-amber-300">{ticket.userPassword || ticket.password || '—'}</strong></span>
                            <span>📱 موبایل: <strong className="text-emerald-400">{ticket.userPhone || ticket.phone || '—'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Approval Actions & Delete Ticket */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                        {ticket.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleDeclineTicket(ticket.id)}
                              className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 transition"
                            >
                              ❌ رد کړه
                            </button>
                            <button
                              onClick={() => handleApproveTicket(ticket.id, ticket.userEmail || ticket.userName || ticket.username)}
                              className="px-4 py-1.5 text-xs font-black rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-950 transition flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>✓ تایید او VIP کړه</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition flex items-center gap-1"
                          title="دا غوښتنه ډیلیټ کړه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف غوښتنه</span>
                        </button>
                      </div>
                    </div>

                    {/* Transaction & Payment Screenshot Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        <p className="text-slate-300">
                          <strong>د تادیې لاره:</strong> <span className="font-mono text-rose-400 uppercase font-bold">{ticket.paymentMethod || 'M-Paisa'}</span>
                        </p>
                        <p className="text-slate-300">
                          <strong>د راکړې ورکړې ایډي (Trans ID):</strong>{' '}
                          <span className="font-mono text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-bold">{ticket.transId || ticket.transactionId || 'N/A'}</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          📅 د غوښتنې نیټه: {ticket.timestamp || ticket.requestedAt ? new Date(ticket.timestamp || ticket.requestedAt).toLocaleString() : '—'}
                        </p>
                      </div>

                      {/* Payment Screenshot Thumbnail */}
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                        <div className="text-slate-300 text-xs">
                          <span className="font-bold text-amber-400 block mb-1">📷 د پیمینټ سکرین شاټ:</span>
                          <span className="text-[10px] text-slate-400">{ticket.screenshot ? 'عکس اپلوډ شوی دی' : 'عکس نشته'}</span>
                        </div>
                        {ticket.screenshot && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(ticket.screenshot)}
                            className="relative group w-24 h-16 rounded-xl overflow-hidden border-2 border-emerald-500/50 hover:border-emerald-400 bg-slate-950 block shrink-0 transition shadow-lg cursor-pointer"
                            title="د پیمینټ رسید عکس غټ لیدلو لپاره دلته کلیک وکړئ 🔍"
                          >
                            <img src={ticket.screenshot} alt="Payment Receipt" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] text-white font-black gap-1">
                              <span>🔍 غټول</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        ) : adminTab === 'users' ? (
          /* =========================================================================
             👤 USERS & PLANS MANAGEMENT TAB (Creation date, VIP expiry, Assign plans)
             ========================================================================= */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>د کاروونکو او پلانونو مدیریت (Users & VIP Plans Management)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                ټول یوزران: {usersList.length}
              </span>
            </div>

            {/* Create User Mini Form */}
            <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>نوی یوزر په لاسي ډول اضافه کول (Create New User)</span>
              </h4>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <input 
                    placeholder="نوم (Name)" 
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                />
                <input 
                    placeholder="ایمیل (Email)" 
                    type="email"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                />
                <input 
                    placeholder="پاسورډ (Password)" 
                    type="password"
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                />
                <input 
                    placeholder="شمیره (Phone)" 
                    className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                />
                <button
                    type="submit"
                    className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>یوزر ثبت کړه</span>
                </button>
              </form>
            </div>

            {/* Users Table List with Creation Date and VIP Expiry */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80">
              <div className="overflow-x-auto">
                <table className="w-full text-right ltr:text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-bold border-b border-slate-700">
                    <tr>
                      <th className="p-3">کاروونکی (User)</th>
                      <th className="p-3">د جوړولو نېټه او وخت (Created At)</th>
                      <th className="p-3">د شراکت حالت (Status)</th>
                      <th className="p-3">د VIP د پای نېټه او وخت (VIP Expiry)</th>
                      <th className="p-3">د پلان ورکړه / عملیات (Assign Plan / Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usersList.map((user: any) => (
                      <tr key={user.id || user.email} className="hover:bg-slate-800/40 transition">
                        <td className="p-3">
                          <div className="font-bold text-white">{user.name || 'نامعلوم'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                          {user.phone && <div className="text-[10px] text-slate-500 font-mono">{user.phone}</div>}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-300">
                          {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'نه دی ثبت شوی'}
                        </td>
                        <td className="p-3">
                          {user.isVip ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                              👑 VIP فعال
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                              👤 وړیا (Free)
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-amber-400">
                          {user.vipExpiresAt || user.vipExpiry ? new Date(user.vipExpiresAt || user.vipExpiry).toLocaleString() : '—'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleAssignPlanToUser(user.id, 30)}
                              className="px-2 py-1 bg-amber-600/80 hover:bg-amber-500 text-white rounded text-[10px] font-bold transition shadow"
                              title="۳۰ ورځې VIP پلان ورکول"
                            >
                              + ۳۰ ورځې
                            </button>
                            <button
                              onClick={() => handleAssignPlanToUser(user.id, 90)}
                              className="px-2 py-1 bg-amber-700/80 hover:bg-amber-600 text-white rounded text-[10px] font-bold transition shadow"
                              title="۹۰ ورځې VIP پلان ورکول"
                            >
                              + ۹۰ ورځې
                            </button>
                            <button
                              onClick={() => handleAssignPlanToUser(user.id, 365)}
                              className="px-2 py-1 bg-purple-600/80 hover:bg-purple-500 text-white rounded text-[10px] font-bold transition shadow"
                              title="۳۶۵ ورځې کلنی VIP پلان"
                            >
                              + ۳۶۵ ورځې
                            </button>
                            {user.isVip && (
                              <button
                                onClick={() => handleRevokeVip(user.id)}
                                className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-900/60 rounded text-[10px] font-bold transition"
                                title="VIP لغوه کول"
                              >
                                لغوه VIP
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-2 py-1 bg-rose-600/90 hover:bg-rose-500 text-white rounded text-[10px] font-extrabold transition shadow flex items-center gap-1 shrink-0"
                              title="کاروونکی (یوزر) ډیلیټ کړه"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500 text-xs">
                          هیڅ یوزر تراوسه نه دی ثبت شوی.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : adminTab === 'plansConfig' ? (
          /* =========================================================================
             👑 PLANS CONFIGURATION & EDITING TAB
             ========================================================================= */
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>د VIP پلانونو او بیو ایډیټ کول (VIP Plans Management)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  دلته تاسو کولی شئ د زما ټلویزیون د VIP پلانونو نومونه، بیې، د ورځو شمیرې او باجونه/ټاګونه تغییر، نوي یا حذف کړئ.
                </p>
              </div>

              <button
                onClick={handleAddPlan}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-lg flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ نوی VIP پلان اضافه کړئ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan: any, index: number) => (
                <div key={plan.id || index} className="p-4 rounded-2xl border-2 border-slate-800 hover:border-amber-500/40 bg-slate-950/60 space-y-3.5 transition shadow-lg relative group">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      <span>پلان #{index + 1}</span>
                    </span>

                    <button
                      onClick={() => handleDeletePlan(index)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition"
                      title="پلان حذف کړه"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">د پلان نوم (Plan Name)</label>
                      <input 
                        value={plan.name || ''}
                        onChange={(e) => handleUpdatePlan(index, 'name', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="مثلا: ۱ میاشت VIP"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">قیمت (Price)</label>
                      <input 
                        value={plan.price || ''}
                        onChange={(e) => handleUpdatePlan(index, 'price', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        placeholder="مثلا: 150 AFN"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">د فعالیت مود/ورځې (Days)</label>
                      <input 
                        type="number"
                        value={plan.days || 30}
                        onChange={(e) => handleUpdatePlan(index, 'days', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                        placeholder="30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">ټاګ / باج (Tag Badge)</label>
                      <input 
                        value={plan.tag || ''}
                        onChange={(e) => handleUpdatePlan(index, 'tag', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="مثلا: مشهور 🔥"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">توضیحات (Description)</label>
                      <input 
                        value={plan.description || ''}
                        onChange={(e) => handleUpdatePlan(index, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                        placeholder="د پلان لنډ تشریح..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : adminTab === 'paymentMethods' ? (
          /* =========================================================================
             💳 PAYMENT METHODS CONFIGURATION TAB
             ========================================================================= */
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>د تادیې د لارو او حسابونو مدیریت (Payment Methods Management)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  دلته تاسو کولی شئ د تادیې بیلابیل لاری، شمیرې او لارښوونې جوړې یا ایډیټ کړئ چې پیرودونکو ته د VIP پلان اخیستلو په وخت کې وښودل شي.
                </p>
              </div>

              <button
                onClick={handleAddPaymentMethod}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl transition shadow-lg flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ نوی د تادیې سیستم اضافه کړه</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method: any, index: number) => (
                <div key={method.id || index} className={`p-4 rounded-2xl border-2 transition shadow-lg relative space-y-3.5 ${
                  method.enabled !== false 
                    ? 'border-emerald-500/40 bg-slate-950/70' 
                    : 'border-slate-800 bg-slate-950/30 opacity-60'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>{method.name || `سیستم #${index + 1}`}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Active / Inactive Toggle */}
                      <button
                        onClick={() => handleUpdatePaymentMethod(index, 'enabled', !(method.enabled !== false))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition flex items-center gap-1 ${
                          method.enabled !== false
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title="د تادیې لاره فعاله او غیرفعاله کول"
                      >
                        <span>{method.enabled !== false ? '✓ فعال (Active)' : '✕ غیرفعال'}</span>
                      </button>

                      <button
                        onClick={() => handleDeletePaymentMethod(index)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition"
                        title="سیستم حذف کړه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">د تادیې سیستم نوم (Method Name)</label>
                      <input 
                        value={method.name || ''}
                        onChange={(e) => handleUpdatePaymentMethod(index, 'name', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                        placeholder="مثلا: M-Paisa, HesabPay, EasyPaisa, Bank Acc"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">د حساب شمیره او معلومات (Account Number & Instructions)</label>
                      <textarea 
                        rows={2}
                        value={method.accountDetails || ''}
                        onChange={(e) => handleUpdatePaymentMethod(index, 'accountDetails', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-emerald-500 font-mono"
                        placeholder="مثلا: M-Paisa: +93 799 123 456 (Zama TV Pay)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* =========================================================================
             📺 NORMAL CHANNELS & MOVIES MANAGEMENT TAB
             ========================================================================= */
          <>
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Add New Movie Button */}

                <button
                  onClick={handleStartAddMovie}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-bold transition shadow-md"
                >
                  <Film className="w-4 h-4 text-amber-200" />
                  <span>{language === 'en' ? 'Add Movie' : '🎬 د فلم پورته کول / اضافه کول'}</span>
                </button>

                {/* Add New Channel Button */}
                <button
                  onClick={handleStartAdd}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'en' ? 'Add Channel' : '📺 نوی چینل زیاتول'}</span>
                </button>

                {/* Change Passcode Button */}
                <button
                  onClick={() => setShowChangePassModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 text-xs font-bold transition"
                >
                  <Key className="w-4 h-4" />
                  <span>{language === 'en' ? 'Change Code' : 'د اډمین کوډ بدلول'}</span>
                </button>

                {/* Reset Defaults Button */}
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-bold transition"
                  title="اصلي کالبوت ته بیا ورګرځول"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'en' ? 'Reset Defaults' : 'اصلي ری سیټ'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {language === 'en' ? `Total Channels: ${channels.length}` : `ټول خپریدونکي چینلونه: ${channels.length}`}
              </div>

            </div>



            {/* FORM MODAL: EDIT OR ADD CHANNEL */}
            {(editingChannel || isAddingNew) && (() => {
              const isMovieForm = Boolean(formData.isMovie || formData.category === 'movies');
              return (
                <form onSubmit={handleSaveChannel} className="bg-slate-950 border border-rose-500/40 rounded-xl p-4 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      <span>
                        {isAddingNew
                          ? (language === 'en' ? 'Add New Afghan Channel' : 'د نوي افغاني چینل یا فلم اضافه کول')
                          : (language === 'en' ? `Edit "${editingChannel?.name}"` : `د "${editingChannel?.name}" معلومات ایډیټ کړئ`)}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChannel(null);
                        setIsAddingNew(false);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Dynamic Tab Switcher Inside Form */}
                  <div className="flex border-b border-slate-800 pb-2 mb-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isMovie: false, category: 'news' })}
                      className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                        !isMovieForm 
                          ? 'bg-emerald-600/90 text-white shadow-md border border-emerald-500/50' 
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <Tv className="w-4 h-4" />
                      <span>📺 د تلویزیون خپرولو بڼه (TV Channel Setup)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isMovie: true, category: 'movies' })}
                      className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                        isMovieForm 
                          ? 'bg-amber-600/90 text-white shadow-md border border-amber-500/50' 
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <Film className="w-4 h-4" />
                      <span>🎬 د فلم پورته کولو بڼه (Pashto Movie Setup)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!isMovieForm ? (
                      /* =========================================================================
                         📺 TELEVISION UPLOAD FORM FIELDS (Minimalist & Simple as Requested: logo, background, titles, TV link, description)
                         ========================================================================= */
                      <>
                        {/* Channel Name Pashto */}
                        <div>
                          <label className="block text-xs font-bold text-slate-200 mb-1">
                            د تلویزیون چینل نوم په پښتو کې (TV Channel Name in Pashto) *
                          </label>
                          <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثلا: د ملي راډیو تلویزیون"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                            required
                          />
                        </div>

                        {/* Channel Name English */}
                        <div>
                          <label className="block text-xs font-bold text-slate-200 mb-1">
                            د تلویزیون نوم په انګلیسي کې (TV Channel Name in English)
                          </label>
                          <input
                            type="text"
                            value={formData.nameEn || ''}
                            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                            placeholder="e.g. National RTA TV"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        {/* TV Link / Stream Link */}
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <Tv className="w-4 h-4 text-emerald-400" />
                            <span>د تلویزیون خپرولو یا سټریم لینک (TV Stream or Embed iframe URL) *</span>
                          </label>
                          <input
                            type="text"
                            value={formData.streamUrl || formData.iframeUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ 
                                ...formData, 
                                streamUrl: val,
                                iframeUrl: (val.includes('<iframe') || val.includes('embed') || val.includes('t.me/')) ? val : formData.iframeUrl
                              });
                            }}
                            placeholder="m3u8, mp4 یا iframe embed لینک واچوئ"
                            className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-3.5 py-2.5 text-xs font-mono text-emerald-200 focus:outline-none focus:border-emerald-400 shadow-inner"
                            required
                          />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-200 mb-1">د تلویزون تشریح (Description)</label>
                          <textarea
                            rows={3}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="د تلویزوني چینل لنډه تشریح، برنامې او موضوعات..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        {/* Logo / Icon URL & Upload */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-200 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>لوګو یا آیکون عکس (Logo / Poster Image URL)</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={formData.logo || ''}
                              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                            />
                            <label className="cursor-pointer text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-3 py-2 rounded-lg transition flex items-center gap-1 shrink-0">
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                              <span>لوګو (Upload)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        setFormData({ ...formData, logo: event.target.result as string });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Background Image URL & Upload */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-200 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                            <span>بګرونډ عکس (Background Image URL)</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={formData.bannerImg || ''}
                              onChange={(e) => setFormData({ ...formData, bannerImg: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                            />
                            <label className="cursor-pointer text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 px-3 py-2 rounded-lg transition flex items-center gap-1 shrink-0">
                              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                              <span>بګرونډ عکس (Upload)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        setFormData({ ...formData, bannerImg: event.target.result as string });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* =========================================================================
                         🎬 MOVIE UPLOAD FORM FIELDS (Comprehensive: Category, Details, Release, Duration, etc.)
                         ========================================================================= */
                      <>
                        {/* Movie Name Pashto */}
                        <div>
                          <label className="block text-xs font-bold text-slate-200 mb-1">
                            د فلم نوم په پښتو کې (Movie Name in Pashto) *
                          </label>
                          <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثلا: د سلطان عبدالحمید ۱ برخه پښتو ژباړه"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                            required
                          />
                        </div>

                        {/* Movie Name English */}
                        <div>
                          <label className="block text-xs font-bold text-slate-200 mb-1">
                            د فلم نوم په انګلیسي کې (Movie Name in English)
                          </label>
                          <input
                            type="text"
                            value={formData.nameEn || ''}
                            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                            placeholder="e.g. Sultan Abdulhamid Episode 1 Pashto"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        {/* Stream Link / Video Embed Link */}
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-xs font-bold text-sky-300 flex items-center gap-1.5">
                            <Film className="w-4 h-4 text-sky-400" />
                            <span>د فلم خپرولو مستقیم لینک (Movie Stream or Embed iframe URL) *</span>
                          </label>
                          <input
                            type="text"
                            value={formData.streamUrl || formData.iframeUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ 
                                ...formData, 
                                streamUrl: val,
                                iframeUrl: (val.includes('<iframe') || val.includes('embed') || val.includes('t.me/')) ? val : formData.iframeUrl
                              });
                            }}
                            placeholder="m3u8, mp4 یا د تلګرام مستقیم ویډیو لینک کاپي کړئ"
                            className="w-full bg-slate-900 border border-sky-500/50 rounded-lg px-3.5 py-2.5 text-xs font-mono text-sky-200 focus:outline-none focus:border-sky-400 shadow-inner"
                            required
                          />

                          {/* Highly descriptive Pashto guideline for direct video link streaming and seekbar */}
                          <div className="bg-sky-950/40 border border-sky-500/20 rounded-xl p-3 space-y-1.5 text-xs text-sky-200 leading-relaxed">
                            <div className="font-extrabold text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>🎬 په مستقیم ډول او د سیکبار (Seekbar) سره د فلم چلولو لارښوونه:</span>
                            </div>
                            <p className="text-[11px] text-slate-300">
                              د فلم د کتنې او اضافه کولو لپاره، تاسي کولی شئ د فلم مستقیمه ویډیو لینک (<strong className="text-white">.mp4, .m3u8</strong>) یا د ویب چوکاټ (<strong className="text-white">iframe embed</strong>) لینک په پورته ساحه کې واچوئ ترڅو فلم په پلیر کې په لوړ تیز سرعت، د کنټرول سیکبار او د لوړ کیفیت سره پلی شي.
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>💡 دا لینک په مستقیم ډول د زما تلویزیون ویب پاڼه کې پلی کیږي.</span>
                            <label className="cursor-pointer font-bold text-rose-300 hover:text-rose-200 flex items-center gap-1">
                              <Film className="w-3.5 h-3.5 text-rose-400" />
                              <span>له خپل موبایل څخه فلم فایل وټاکئ (Upload Movie File)</span>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const videoUrl = URL.createObjectURL(file);
                                    setFormData({ ...formData, streamUrl: videoUrl });
                                    setActionNotice(language === 'en' ? 'Local movie video loaded!' : 'فلم فایل په بریالیتوب وټاکل شو!');
                                    setTimeout(() => setActionNotice(''), 2500);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-xs font-bold text-slate-200 mb-1">کټګوري (Category)</label>
                          <select
                            value={formData.category || 'movies'}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category, isMovie: e.target.value === 'movies' })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                          >
                            <option value="movies">🎬 پښتو ژباړل شوي فلمونه (Pashto Dubbed Movies)</option>
                            <option value="news">📰 خبرونه او سیاست (News)</option>
                            <option value="entertainment">🎭 تفریحي خپرونې (Entertainment)</option>
                            <option value="sports">🏏 سپورټ او لوبې (Sports)</option>
                            <option value="cultural">🇦🇫 کلتوري (Cultural)</option>
                            <option value="radio">📻 راډیو (Radio)</option>
                          </select>
                        </div>

                        {/* Quality */}
                        <div>
                          <label className="block text-xs font-bold text-slate-200 mb-1">کیفیت (Video Quality)</label>
                          <input
                            type="text"
                            value={formData.quality || '1080p HD'}
                            onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                            placeholder="e.g. 1080p Ultra HD"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-200 mb-1">د فلم شرحه او ډسکرپشن (Description)</label>
                          <textarea
                            rows={2}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="د فلم اړوند لنډ معلومات او لنډه کیسه..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        {/* Movie Details (IMDb Rating, Release Year, Duration, Genre) */}
                        <div className="md:col-span-2 bg-slate-950/60 p-3 rounded-xl border border-amber-500/30 space-y-3">
                          <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Film className="w-4 h-4 text-amber-400" />
                            <span>د فلم پاتې ځانګړي تفصیلات (Movie Details: IMDb, Year, Duration, Genre)</span>
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-amber-300 mb-1">د IMDb نمره (IMDb Rating)</label>
                              <input
                                type="text"
                                value={formData.imdbRating || ''}
                                onChange={(e) => setFormData({ ...formData, imdbRating: e.target.value })}
                                placeholder="e.g. 8.5/10"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-amber-300 mb-1">د خپرېدو کال (Release Year)</label>
                              <input
                                type="text"
                                value={formData.releaseYear || ''}
                                onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                                placeholder="e.g. 2024"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-amber-300 mb-1">د فلم موده (Duration)</label>
                              <input
                                type="text"
                                value={formData.duration || ''}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="e.g. 2 ساعته 15 دقیقې"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-amber-300 mb-1">ژانر/ډول (Genre)</label>
                              <input
                                type="text"
                                value={formData.genre || ''}
                                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                placeholder="e.g. اکشن، تاریخی، ډرامه"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Image / Logo URL & Upload */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-200 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>د پوسټر عکس عکس (Logo / Poster Image URL)</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={formData.logo || ''}
                              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                            />
                            <label className="cursor-pointer text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-3 py-2 rounded-lg transition flex items-center gap-1 shrink-0">
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                              <span>عکس (Upload)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        setFormData({ ...formData, logo: event.target.result as string });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Thumbnail / Banner Image URL & Upload */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-200 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                            <span>تھمبنیل / غټ بینر عکس (Thumbnail / Banner Image URL)</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={formData.bannerImg || ''}
                              onChange={(e) => setFormData({ ...formData, bannerImg: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                            />
                            <label className="cursor-pointer text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 px-3 py-2 rounded-lg transition flex items-center gap-1 shrink-0">
                              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                              <span>تھمبنیل (Upload)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        setFormData({ ...formData, bannerImg: event.target.result as string });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 👑 VIP Only content toggle */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xl">👑</div>
                      <div>
                        <h5 className="text-xs font-black text-amber-300">دا د VIP / پریمیم غړو لپاره ځانګړی منځپانګه ده (VIP / Premium Only Content)</h5>
                        <p className="text-[10px] text-slate-400">که فعاله وي، یوازې تادیه شوي او فعال VIP غړي کولی شي دا تلویزیون/فلم وګوري.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.isPremium)}
                        onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950"></div>
                    </label>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChannel(null);
                        setIsAddingNew(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition"
                    >
                      لغوه (Cancel)
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-900/30"
                    >
                      <Save className="w-4 h-4" />
                      <span>ذخیره کړه (Save Changes)</span>
                    </button>
                  </div>
                </form>
              );
            })()}

            {/* CHANNEL DIRECTORY & EDITING TABLE */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-rose-400" />
                  <span>د شته افغاني چینلونو لړۍ (Registered Channels List)</span>
                </h4>

                {/* Search & Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="په لړۍ کې لټون..."
                    className="bg-slate-900 text-xs text-white border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500"
                  />
                  <select
                    value={adminCategoryFilter}
                    onChange={(e) => setAdminCategoryFilter(e.target.value)}
                    className="bg-slate-900 text-xs text-white border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="all">ټول کټګورۍ</option>
                    <option value="movies">🎬 پښتو فلمونه (Movies)</option>
                    <option value="news">خبري</option>
                    <option value="entertainment">تفریحي</option>
                    <option value="sports">سپورټ</option>
                    <option value="regional">ولایتي</option>
                    <option value="radio">راډیو</option>
                  </select>
                </div>
              </div>

              {/* Table List */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/80">
                <div className="overflow-x-auto">
                  <table className="w-full text-right ltr:text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 font-bold border-b border-slate-700">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">لوګو & نوم</th>
                        <th className="p-3">کټګوري</th>
                        <th className="p-3">اصلي سټریم لینک (Stream URL)</th>
                        <th className="p-3">عملیات (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {adminFilteredChannels.map((ch) => (
                        <tr key={ch.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-mono font-bold text-slate-400">{ch.number}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={ch.logo}
                                alt={ch.name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-700 bg-slate-950"
                              />
                              <div>
                                <div className="font-bold text-white">{ch.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{ch.nameEn || ch.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                              {ch.isMovie || ch.category === 'movies' ? '🎬 فلم (Movie)' : (ch.isRadio ? '📻 Radio' : ch.category)}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-rose-300 max-w-xs truncate" title={ch.streamUrl}>
                            {ch.streamUrl}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEdit(ch)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition flex items-center gap-1 text-[11px] font-bold"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                                <span>ایډیټ</span>
                              </button>

                              <button
                                onClick={() => handleDeleteChannel(ch.id, ch.name)}
                                className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/60 transition flex items-center gap-1 text-[11px] font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {adminFilteredChannels.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">
                            کوچنی چینل ونه موندل شو.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
                  </>
                )}

              </div>
        )}

        {/* 🔑 MODAL TO CHANGE ADMIN PASSCODE */}
        {showChangePassModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  <span>د اډمین امنيتي کوډ بدلول</span>
                </h3>
                <button
                  onClick={() => setShowChangePassModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangePasscode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اوسنی کوډ (Current Code)</label>
                  <input
                    type="password"
                    value={oldCodeInput}
                    onChange={(e) => setOldCodeInput(e.target.value)}
                    placeholder="اوسنی پاسکوډ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نوی کوډ (New Passcode)</label>
                  <input
                    type="password"
                    value={newCodeInput}
                    onChange={(e) => setNewCodeInput(e.target.value)}
                    placeholder="نوی مشخص کوډ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">د نوي کوډ تایید (Confirm New Code)</label>
                  <input
                    type="password"
                    value={confirmCodeInput}
                    onChange={(e) => setConfirmCodeInput(e.target.value)}
                    placeholder="د نوي کوډ بیا انټرول..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {changePassError && (
                  <div className="text-xs font-bold text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800/50">
                    {changePassError}
                  </div>
                )}

                {changePassSuccess && (
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-800/50">
                    {changePassSuccess}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePassModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition"
                  >
                    لغوه
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition shadow-md"
                  >
                    کوډ ثبت کړه
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FULLSCREEN IMAGE LIGHTBOX PREVIEW MODAL */}
        {previewImage && (
          <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fadeIn">
            <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
              <a
                href={previewImage}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
              >
                <span>پوره اندازه خلاصول ↗</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-sm transition shadow-lg"
                title="بندول"
              >
                ✕ بندول
              </button>
            </div>

            <div 
              className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center cursor-pointer p-2"
              onClick={() => setPreviewImage(null)}
            >
              <img 
                src={previewImage} 
                alt="Payment Receipt Large View" 
                className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border-2 border-emerald-500/40"
              />
            </div>
            <p className="text-xs text-slate-400 pt-2 font-medium">
              د سکرین بندولو لپاره بل ځای کلیک وکړئ یا د (بندول) تڼۍ ووهئ.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
