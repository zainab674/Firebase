import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";


const CreatorDetails = () => {
    const { creatorId } = useParams();
    const [creator, setCreator] = useState({});
    const [books, setBooks] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    console.log("cid", creatorId)
    useEffect(() => {
        const fetchCreatorDetails = async () => {
            if (!creatorId) {
                setError("Creator ID is missing");
                return;
            }

            try {
                // Ensure creatorId is a string
                if (typeof creatorId !== 'string') {
                    setError("Invalid Creator ID");
                    return;
                }

                // Fetch creator details
                const creatorDoc = await getDoc(doc(db, "users", creatorId));
                if (creatorDoc.exists()) {
                    setCreator(creatorDoc.data());
                } else {
                    setError("Creator not found");
                }

                // Fetch books by this creator
                const booksQuery = query(collection(db, "books"), where("creatorId", "==", creatorId));
                const booksSnapshot = await getDocs(booksQuery);
                const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBooks(booksData);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch creator details");
            }
        };

        fetchCreatorDetails();
    }, [creatorId]);
    const profile = () => {
        navigate("/profile");
    }
    const home = () => {
        navigate("/home");
    }
    const signout = async () => {
        try {
            await signOut(auth)

            navigate("/");
        }
        catch (err) {
            console.error(err)
        }

    }
    return (
        <div className="container w-1/2 mx-auto mt-10">
            <div className="flex justify-center top-10 right-10 fixed z-50 space-x-4">
                <span>
                    <button
                        onClick={home}
                        className="bg-green-500 text-white px-4 py-2 mx-2 rounded-lg hover:bg-green-600 transition duration-300"
                    >
                        home
                    </button>
                    <button
                        onClick={profile}
                        className="bg-blue-500 text-white px-4 py-2 mx-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        My Profile
                    </button>
                </span>
                <button
                    onClick={signout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                >data
                    Sign Out
                </button>
            </div>

            <h1 className="text-xl font-bold mb-5">Creator Details</h1>
            {error && <p className="text-red-500">{error}</p>}
            {(creator.displayName) && (
                <div className="flex items-center space-x-5 mb-5 p-3 rounded-lg shadow-md">
                    <img
                        src={creator.photoURL || "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png"}
                        alt={`${creator.displayName}'s avatar`}
                        className="w-32 h-32 rounded-full"
                    />
                    <div>
                        <p><span className="font-semibold">Name: </span>{creator.displayName}</p>
                        <p><span className="font-semibold">Email: </span>{creator.email}</p>
                        {/* Display other creator details as needed */}
                    </div>
                </div>
            )}
            <h2 className="text-lg font-semibold mt-5">Books by {creator.displayName}</h2>
            {books.length > 0 ? (
                books.map((book) => (
                    <div key={book.id} className="flex items-center space-x-5 mb-5 p-3 rounded-lg shadow-md">
                        <h4><span className="font-semibold">Name: </span> {book.name}</h4>
                        <p><span className="font-semibold">Price: </span>{book.price}</p>
                    </div>
                ))
            ) : (
                <p>No books found for this creator.</p>
            )}
        </div>
    );
};

export default CreatorDetails;
