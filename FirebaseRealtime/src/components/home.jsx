
import { useState, useEffect } from "react";

import { db, auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
const Data = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([])
    const booksCollectionRef = collection(db, 'books')
    const [name, setName] = useState("")
    const [price, setPrice] = useState(0)
    const [editingBookId, setEditingBookId] = useState(null);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [error, setError] = useState("");
    const [creatorId, setCreatorId] = useState("");


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCreatorId(user.uid);
                getBooks();
            } else {

                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);


    const add = async () => {
        if (name === "" || price === "") {
            setError("Please enter name of  Book");
            return;
        }

        try {

            await addDoc(booksCollectionRef, { name: name, price: Number(price), creatorId })
            getBooks()
            setName("")
            setPrice("")
            setError("")
        }
        catch (err) {
            console.error(err)
        }

    }
    const increasePrice = async (id, price) => {
        const bookDoc = doc(db, "books", id);
        const newF = { price: price + 100 };
        try {
            await updateDoc(bookDoc, newF);
            getBooks()

        }
        catch (err) {
            console.error(err)
        }

    }
    const deleteBook = async (id) => {
        const bookDoc = doc(db, "books", id);

        try {
            await deleteDoc(bookDoc);
            getBooks()

        }
        catch (err) {
            console.error(err)
        }

    }
    const getBooks = async () => {

        const data = await getDocs(booksCollectionRef);
        setBooks(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    }

    const updateBook = (book) => {
        setEditingBookId(book.id);
        setNewName(book.name);
        setNewPrice(book.price);
    };


    const saveUpdatedBook = async (id) => {
        if (newName === "" || newPrice === "") {
            setError("Please enter name of  Book");
            return;
        }
        const bookDoc = doc(db, "books", id);
        try {
            await updateDoc(bookDoc, { name: newName, price: Number(newPrice), creatorId: creatorId, });
            setEditingBookId(null);
            getBooks();
        } catch (err) {
            console.error(err);
        }
    };

    const profile = () => {
        navigate("/profile");
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
            <div className="flex justify-center top-10 right-10 fixed z-50">
                <span>
                    <button
                        onClick={profile}
                        className="bg-blue-500 text-white px-4 py-2 mx-10 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        Profile
                    </button>
                </span>
                <button
                    onClick={signout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                >
                    Sign Out
                </button>
            </div>




            <div className="mt-10 max-w-full mx-auto p-5">
                <h1 className="text-xl font-bold mb-5">All Books</h1>
                {books.map((book) => {
                    console.log("book", book)

                    return (
                        <div key={book.id} className="flex items-center space-x-5 mb-5 p-3 rounded-lg shadow-md">
                            {editingBookId === book.id ? (
                                <div className="flex flex-col space-y-3">
                                    {error && <p className="text-red-500 mt-4 mb-4">{error}</p>}
                                    <input
                                        type="text"
                                        value={newName}
                                        className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        value={newPrice}
                                        className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => setNewPrice(e.target.value)}
                                    />
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition duration-300"
                                        onClick={() => saveUpdatedBook(book.id)}
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <>

                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>


    );
};

export default Data;
