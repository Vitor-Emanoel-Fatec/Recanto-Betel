import { useEffect, useRef, useState, type FormEvent } from 'react';
import { UserRound, X } from 'lucide-react';
import styles from './AuthPopover.module.scss';

type AuthMode = 'signin' | 'signup';
type User = { id: string; name: string; email: string };

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const AuthPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
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
      const response = await fetch(`${API_BASE_URL}/user/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'signup' ? { name, email, password } : { email, password }),
      });
      const responseText = await response.text();
      let result: unknown = responseText;
      if (responseText) {
        try {
          result = JSON.parse(responseText) as unknown;
        } catch {
          result = responseText;
        }
      } else {
        result = null;
      }

      if (!response.ok) {
        const errorMessage =
          typeof result === 'string' && result
            ? result
            :
          typeof result === 'object' && result !== null && 'message' in result &&
          typeof result.message === 'string'
            ? result.message
            : mode === 'signin' && (response.status === 401 || response.status === 404)
              ? 'E-mail ou senha inválidos.'
              : 'Não foi possível concluir a solicitação. Tente novamente.';
        setMessage({ text: errorMessage, isError: true });
        return;
      }

      if (mode === 'signup') {
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
        setMessage({ text: 'Cadastro realizado! Agora você já pode entrar.', isError: false });
        return;
      }

      if (
        typeof result !== 'object' ||
        result === null ||
        !('id' in result) ||
        !('name' in result) ||
        !('email' in result) ||
        typeof result.id !== 'string' ||
        typeof result.name !== 'string' ||
        typeof result.email !== 'string'
      ) {
        setMessage({ text: 'A resposta da API está incompleta. Tente novamente.', isError: true });
        return;
      }

      setUser({ id: result.id, name: result.name, email: result.email });
      setPassword('');
      setMessage(null);
    } catch {
      setMessage({ text: 'Não foi possível conectar à API. Tente novamente em instantes.', isError: true });
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
        aria-label={user ? `Conta de ${user.name}` : 'Entrar ou cadastrar como responsável'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
      >
        <UserRound size={19} aria-hidden="true" />
        {user && <span className={styles.userName}>{user.name.split(' ')[0]}</span>}
      </button>

      {isOpen && (
        <section className={styles.popover} role="dialog" aria-labelledby="auth-title">
          <div className={styles.popoverHeader}>
            <div>
              <span className={styles.eyebrow}>Área do responsável</span>
              <h2 id="auth-title">{user ? 'Sua conta' : mode === 'signin' ? 'Bem-vindo(a)' : 'Criar cadastro'}</h2>
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

          {user ? (
            <div className={styles.account}>
              <p className={styles.greeting}>Olá, {user.name}!</p>
              <p className={styles.accountEmail}>{user.email}</p>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => {
                  setUser(null);
                  setIsOpen(false);
                  setEmail('');
                }}
              >
                Sair da conta
              </button>
            </div>
          ) : (
            <>
              <p className={styles.description}>
                {mode === 'signin'
                  ? 'Entre para acessar sua área de responsável.'
                  : 'Cadastre-se para criar sua área de responsável.'}
              </p>

              <form className={styles.form} onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <label className={styles.field}>
                    <span>Nome completo</span>
                    <input
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Seu nome"
                    />
                  </label>
                )}

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
                    minLength={mode === 'signup' ? 8 : undefined}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === 'signup' ? 'Mínimo de 8 caracteres' : 'Sua senha'}
                  />
                </label>

                {mode === 'signup' && (
                  <label className={styles.field}>
                    <span>Confirme sua senha</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
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
              </form>

              <p className={styles.switchMode}>
                {mode === 'signin' ? 'Ainda não tem cadastro?' : 'Já tem cadastro?'}{' '}
                <button
                  type="button"
                  onClick={() => changeMode(mode === 'signin' ? 'signup' : 'signin')}
                >
                  {mode === 'signin' ? 'Cadastre-se' : 'Entrar'}
                </button>
              </p>
            </>
          )}
        </section>
      )}
    </div>
  );
};
