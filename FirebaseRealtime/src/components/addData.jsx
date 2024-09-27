import React, { useState } from "react";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "../config/firebase";

const AddData = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const signin = () => {
        if (!name || !email || !password) {
            setError("Please enter all required fields.");
            return;
        }

        // Get a reference to the database
        const db = getDatabase(app);
        // Define a unique user ID or use a timestamp for simplicity
        const userId = new Date().getTime(); // This is just a placeholder, consider using a more robust ID in production

        // Reference to the user data path
        const userRef = ref(db, 'users/' + userId);

        // Set user data in the database
        set(userRef, {
            name: name,
            email: email,
            password: password, // Note: Storing passwords in plaintext is not recommended for security reasons. Consider using Firebase Authentication for secure password handling.
        })
            .then(() => {
                console.log("User data saved successfully!");
                // You can add further actions here, such as navigating to another page or clearing the form
            })
            .catch((error) => {
                console.error("Error writing user data:", error);
                setError("Error saving user data. Please try again.");
            });
    };

    return (
        <div className="flex justify-center items-center w-1/2 mx-auto mt-10 border border-gray-800">
            <div className="w-full max-w-md p-4">
                {error && <p className="text-red-500 mt-4">{error}</p>}
                <div>
                    <h1 className="text-2xl font-bold mb-4">Register</h1>

                    <div className="flex flex-col space-y-5 mt-10">
                        <input
                            type="text"
                            placeholder="Name"
                            className="p-3 rounded-lg border border-gray-300"
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="p-3 rounded-lg border border-gray-300"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="p-3 rounded-lg border border-gray-300"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            onClick={signin}
                            className="bg-rose-500 text-white p-3 rounded-lg hover:bg-rose-600"
                        >
                            Register
                        </button>
                        <p className="text-blue-600 hover:cursor-pointer">
                            Already Registered? Login to your account
                        </p>
                        {/* <button
                            // Assuming you have a googleSignin function
                            onClick={googleSignin}
                            className="bg-violet-500 text-white p-3 rounded-lg hover:bg-violet-600"
                        >
                            Sign In with Google
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddData;
