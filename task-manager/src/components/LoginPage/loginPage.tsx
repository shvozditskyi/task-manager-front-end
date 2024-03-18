"use client"
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';
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
            const response = await fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                // shows the response
                // const data = await response.json();
                // console.log(data);
                
                // Successful login, redirect to main page
                console.log('Login successful');
                redirectToMainPage();
            } else {
                // Handle error response (show error message)
                console.error('Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <div className="login-wrapper flex justify-center mt-40">
            <div className="header flex flex-col justify-center items-center text-center">
                <h2 className="text-1 max-w-48">Manage your time and keep work-life balance with</h2>
                <h1 className="title my-6">Task Manager</h1>

                <form onSubmit={handleSubmit}>
                    <div>
                        <input className="input"
                            type="email"
                            id="email"
                            placeholder= "Email"
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
                    <button className="button w-full" type="submit">Login</button>
                </form>
            </div>

        </div>
    )
}
export default loginPage;