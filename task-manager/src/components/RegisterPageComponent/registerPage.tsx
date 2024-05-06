"use client"
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
const registerPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const router = useRouter();

    const redirectToLoginPage = () => {
        router.push(`../`)
    };
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            //For POST testing https://httpbin.org/post
            // const response = await fetch(`https://httpbin.org/post`, {
            const response = await fetch(`http://localhost:8080/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, firstName, lastName })
            });

            if (response.ok) {
                // shows the response
                const data = await response.json();
                const {accessToken} = data;
                sessionStorage.setItem('accessToken', `${accessToken}`);
                console.log(data);
                
                // Successful register, redirect to main page
                console.log('Registration successful');
                redirectToLoginPage();
            } else {
                try {
                    // Handle error response
                    const errorData = await response.json();
                    console.error('Registration failed');
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
        <div className="login-wrapper flex justify-center mt-20">
            <div className="header-wrapper flex flex-col justify-center items-center text-center">
            <div className="header flex flex-col justify-center items-center text-center">
                <h2 className="text-1 max-w-96">Manage your time and keep work-life balance with</h2>
                <h1 className="title my-6">Task Manager</h1>
                <p className="error"></p>
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
                    <div>
                        <input className="input"
                            type="firstName"
                            id="firstName"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input className="input"
                            type="lastName"
                            id="lastName"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <button className="submit-button w-full rounded" type="submit">Start my way!</button>
                </form>
                
            </div>
            <div className="bottom-buttons flex flex-col">
                <h2 className="my-2 text-gray-500">Already have an Account ?</h2>
                <Link href="../"><button className="b-button">Sign In</button></Link>
            </div>
            </div>

        </div>
    )
}
export default registerPage;