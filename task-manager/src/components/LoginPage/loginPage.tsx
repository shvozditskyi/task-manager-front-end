"use client"
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
const loginPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const redirectToMainPage = () => {
        router.push(`/MainPage`)
    };


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            //For POST testing https://httpbin.org/post
            // const response = await fetch(`https://httpbin.org/post`, {
            const response = await fetch(`http://localhost:8080/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                // shows the response
                const data = await response.json();
                const { accessToken } = data;
                sessionStorage.setItem('accessToken', `${accessToken}`);

                // Successful login, redirect to main page
                console.log('Login successful');
                redirectToMainPage();
            } else {
                try {
                    // Handle error response
                    const errorData = await response.json();
                    console.error('Login failed');
                    if (errorData && errorData.message) {
                        const errorP = document.querySelector('.error')
                        if (errorP) {
                            errorP.innerHTML = errorData.message
                        }
                    }
                } catch (error) {
                    console.log('Error:', error)
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <div className="login-wrapper flex justify-center mt-28">
            <div className="header-wrapper flex flex-col justify-center items-center text-center">
                <img src="/TM_logo.png" alt="logo" height={100} width={100} />
                <div className="header flex flex-col justify-center items-center text-center">
                    <h2 className="text-1 max-w-96">Manage your time and keep work-life balance with</h2>
                    <h1 className="title my-6">Task Manager</h1>
                    <p className="error"></p>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <input className="input"
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input className="input"
                                type="password"
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="submit-button w-full rounded" type="submit">Login</button>
                    </form>

                </div>
                <div className="bottom-buttons flex space-x-8 my-4">
                    {/* <button className="b-button">Forgot Password?</button> */}
                    <Link href="/RegisterPage"><button className="b-button">Create Account</button></Link>

                </div>
            </div>

        </div>
    )
}
export default loginPage;