"use client"
import { FormEvent, useState } from "react";

const loginPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //add function: sending to backend for processing with http POST request
        console.log('Email: '+ email);
        console.log('Password: '+ password);
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