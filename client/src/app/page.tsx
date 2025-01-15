'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import styles from '@styles/appStyles/auth/auth.module.scss';
import { AxiosError } from 'axios';

interface LoginFormData {
    userName: string;
    password: string;
}

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.post('/auth/login', data);

            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 7);
                document.cookie = `token=${token}; path=/; expires=${expirationDate.toUTCString()}`;

                const firstLoginData = localStorage.getItem('firstLoginData');

                if (!firstLoginData) {
                    localStorage.setItem('firstLoginData', JSON.stringify(user));
                    router.push('/survey');
                } else {
                    router.push('/home');
                }

                setLoading(false);
                setError('');
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || 'Login failed');
            } else {
                setError('An unexpected error occurred');
            }
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <h1>Login to your account</h1>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.formGroup}>
                        <label>Username</label>
                        <input
                            {...register('userName', {
                                required: 'Username is required',
                            })}
                            className={errors.userName ? styles.error : ''}
                        />
                        {errors.userName && <p className={styles.errorText}>{errors.userName.message}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            {...register('password', {
                                required: 'Password is required',
                            })}
                            className={errors.password ? styles.error : ''}
                        />
                        {errors.password && <p className={styles.errorText}>{errors.password.message}</p>}
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                        Dont have an account?{' '}
                        <Link href="/register" style={{ color: '#4f46e5' }}>
                            Register here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
