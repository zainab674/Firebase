import { useState } from "react";
import { auth, google } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { add } from "./users";
import { db } from "../config/firebase";
import { collection, doc, GeoPoint, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

const Auth = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const booksCollectionRef = collection(db, 'users')
    const latitude = 0;
    const longitude = 0;
    const getErrorMessage = (errorCode) => {
        console.log(errorCode)
        switch (errorCode) {
            case "auth/invalid-email":
                return "Invalid email address format.";
            case "auth/email-already-in-use":
                return "This email is already in use. Login please";
            case "auth/weak-password":
                return "The password is too weak. Use at least 6 characters.";
            case "auth/missing-password":
                return "Please enter a password.";
            case "auth/user-not-found":
                return "User not found. Please sign up first.";
            case "auth/wrong-password":
                return "Incorrect password. Please try again.";
            case "auth/invalid-credential":
                return "Incorrect Credentials.";
            default:
                return "An error occurred. Please try again.";
        }
    }

    const signin = async () => {
        if (!name || !email || !password) {
            setError("Please enter all required fields.");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password)
            const user = auth.currentUser;


            await updateProfile(user, { displayName: name });
            const data = {
                displayName: name,
                email: email,
                phone: "",
                bio: "",
                photoURL: "",
                location: new GeoPoint(latitude, longitude),
            };

            // Add the user info to Firestore
            const userDoc = doc(db, "users", user.uid);
            await setDoc(userDoc, data);
            navigate("/home");
        }
        catch (err) {
            setError(getErrorMessage(err.code));
        }

    }

    const login = async () => {
        if (!email || !password) {
            setError("Please enter all required fields.");
            return;
        }

        try {
            // Check if the user exists
            await signInWithEmailAndPassword(auth, email, password);

            navigate("/home");
        } catch (err) {
            setError(getErrorMessage(err.code));
        }
    };



    const googleSignin = async () => {
        try {
            const usData = await signInWithPopup(auth, google);
            const user = usData.user;
            console.log("User data from Google:", user);

            const data = {
                displayName: user.displayName,
                email: user.email,
                phone: "",
                bio: "",
                photoURL: "",
                location: new GeoPoint(latitude, longitude),
            };

            const usersCollection = collection(db, "users");
            const q = query(usersCollection, where("email", "==", user.email));

            // Execute the query to check if user exists
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                console.log("User already exists in the database.");
                navigate("/home");
            } else {

                const userDoc = doc(db, "users", user.uid);
                await setDoc(userDoc, data);
                navigate("/home");
            }
        } catch (err) {
            console.error("Error during Google Sign-In or Firestore operation:", err);
            setError(getErrorMessage(err.code));
        }
    };



    return (
        <div className="flex justify-center items-center w-1/2 mx-auto mt-10 border border-gray-800">
            <div className="w-full max-w-md p-4">
                {!isLogin && (
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Register</h1>
                        {error && <p className="text-red-500 mt-4">{error}</p>}
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
                            <p
                                className="text-blue-600 hover:cursor-pointer"
                                onClick={() => setIsLogin(true)}
                            >
                                Already Registered? Login to your account
                            </p>
                            <button
                                onClick={googleSignin}
                                className="bg-violet-500 text-white p-3 rounded-lg hover:bg-violet-600"
                            >
                                Sign In with Google
                            </button>
                        </div>
                    </div>
                )}
                {isLogin && (
                    <div>
                        <h1 className="text-2xl font-bold mb-4">Login</h1>
                        {error && <p className="text-red-500 mt-4">{error}</p>}
                        <div className="flex flex-col space-y-5 mt-10">
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
                                onClick={login}
                                className="bg-rose-500 text-white p-3 rounded-lg hover:bg-rose-600"
                            >
                                Login
                            </button>
                            <p
                                className="text-blue-600 hover:cursor-pointer"
                                onClick={() => setIsLogin(false)}
                            >
                                Are You New? Create your account
                            </p>
                            <button
                                onClick={googleSignin}
                                className="bg-violet-500 text-white p-3 rounded-lg hover:bg-violet-600"
                            >
                                Sign In with Google
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>



    )
}

export default Auth;