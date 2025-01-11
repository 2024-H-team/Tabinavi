'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import styles from '@styles/appStyles/auth/auth.module.scss';
import { AxiosError } from 'axios';

interface RegisterFormData {
    userName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    fullName: string;
}

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterFormData>();

    const password = watch('password');

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setLoading(true);
            setError('');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...submitData } = data;
            await apiClient.post('/auth/register', submitData);
            setSuccess(true);
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || 'Registration failed');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <h1>Create your account</h1>
                </div>

                {success ? (
                    <div className={styles.successMessage}>Registration successful! You can now login.</div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.formGroup}>
                            <label>Username</label>
                            <input
                                {...register('userName', {
                                    required: 'Username is required',
                                    minLength: 3,
                                })}
                                className={errors.userName ? styles.error : ''}
                            />
                            {errors.userName && <p className={styles.errorText}>{errors.userName.message}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                className={errors.email ? styles.error : ''}
                            />
                            {errors.email && <p className={styles.errorText}>{errors.email.message}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <input
                                type="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                className={errors.password ? styles.error : ''}
                            />
                            {errors.password && <p className={styles.errorText}>{errors.password.message}</p>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) => value === password || 'Passwords do not match',
                                })}
                                className={errors.confirmPassword ? styles.error : ''}
                            />
                            {errors.confirmPassword && (
                                <p className={styles.errorText}>{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <input
                                {...register('fullName', {
                                    required: 'Full name is required',
                                })}
                                className={errors.fullName ? styles.error : ''}
                            />
                            {errors.fullName && <p className={styles.errorText}>{errors.fullName.message}</p>}
                        </div>

                        {error && <div className={styles.errorMessage}>{error}</div>}

                        <button type="submit" disabled={loading} className={styles.submitButton}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
