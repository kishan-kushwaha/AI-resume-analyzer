import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const id = params.get('id');
    const error = params.get('error');

    if (error) {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/auth');
      return;
    }

    if (token && name && email && id) {
      setAuth({ id, name, email }, token);
      toast.success(`Welcome, ${name.split(' ')[0]}! 🎉`);
      navigate('/dashboard');
    } else {
      toast.error('Authentication failed. Please try again.');
      navigate('/auth');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', flexDirection: 'column', gap: 20,
    }}>
      <Brain size={48} color="var(--purple-400)" />
      <div className="spinner" style={{ width: 40, height: 40 }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Signing you in with Google...</p>
    </div>
  );
}
