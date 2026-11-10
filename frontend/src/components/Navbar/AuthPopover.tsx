import { useEffect, useRef, useState, type FormEvent } from 'react';
import { UserRound, X } from 'lucide-react';
import styles from './AuthPopover.module.scss';
import { ApiError } from '../../services/apiClient';
import { signUp } from '../../services/authService';
import { useAuth } from '../../services/AuthContext';

type AuthMode = 'signin' | 'signup';

export const AuthPopover = () => {
  const { user, signIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setMessage({ text: 'As senhas não coincidem.', isError: true });
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
        setMessage({
          text: 'Cadastro criado. Entre para solicitar uma matrícula e completar seu perfil de responsável.',
          isError: false,
        });
        return;
      }

      const authenticatedUser = await signIn(email, password);
      setPassword('');
      window.location.assign(authenticatedUser.role === 'ADMIN' ? '/admin' : '/portal');
    } catch (error) {
      const text = error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Não foi possível concluir a solicitação.';
      setMessage({
        text: mode === 'signin' && error instanceof ApiError && error.status === 404
          ? 'E-mail ou senha inválidos.'
          : text,
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={styles.auth} ref={popoverRef}>
      <button
        className={`${styles.trigger} ${isOpen ? styles['trigger--active'] : ''}`}
        type="button"
        aria-label="Entrar ou cadastrar"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
      >
        <UserRound size={19} aria-hidden="true" />
      </button>

      {isOpen && (
        <section className={styles.popover} role="dialog" aria-labelledby="auth-title">
          <div className={styles.popoverHeader}>
            <div>
              <span className={styles.eyebrow}>Área do responsável</span>
              <h2 id="auth-title">{mode === 'signin' ? 'Bem-vindo(a)' : 'Criar cadastro'}</h2>
            </div>
            <button
              className={styles.closeButton}
              type="button"
              aria-label="Fechar janela de acesso"
              onClick={() => setIsOpen(false)}
            >
              <X size={19} />
            </button>
          </div>

          <p className={styles.description}>
            {user
              ? 'Você já está conectado. Acesse sua área protegida.'
              : mode === 'signin'
              ? 'Entre com as credenciais cadastradas.'
              : 'Cadastre suas credenciais. O perfil de responsável será criado ao enviar uma solicitação de matrícula.'}
          </p>

          {user ? (
            <a className={styles.submitButton} href={user.role === 'ADMIN' ? '/admin' : '/portal'}>Acessar minha área</a>
          ) : <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>E-mail</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
              />
            </label>

            <label className={styles.field}>
              <span>Senha</span>
              <input
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={mode === 'signup' ? 12 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
              />
            </label>

            {mode === 'signup' && (
              <label className={styles.field}>
                <span>Confirme sua senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Digite a senha novamente"
                />
              </label>
            )}

            {message && (
              <p className={`${styles.message} ${message.isError ? styles['message--error'] : styles['message--success']}`} role="status">
                {message.text}
              </p>
            )}

            <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar cadastro'}
            </button>
          </form>}

          {!user && <p className={styles.switchMode}>
            {mode === 'signin' ? 'Ainda não tem cadastro?' : 'Já tem cadastro?'}{' '}
            <button
              type="button"
              onClick={() => changeMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              {mode === 'signin' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>}
        </section>
      )}
    </div>
  );
};
