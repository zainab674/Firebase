
import { useState, useEffect } from "react";

import { db, auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
const Home = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([])
    const [creators, setCreators] = useState({});
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

        const booksSnapshot = await getDocs(collection(db, "books"));
        const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Set books state
        setBooks(booksData);

        // Fetch creators
        const creatorIds = [...new Set(booksData.map(book => book.creatorId))];
        const creatorsData = {};


        for (const creatorId of creatorIds) {
            const creatorDoc = await getDoc(doc(db, "users", creatorId));
            if (creatorDoc.exists()) {
                creatorsData[creatorId] = creatorDoc.data();
            }
        }


        setCreators(creatorsData);
    }


    const updateBook = (book) => {
        setEditingBookId(book.id);
        setNewName(book.name);
        setNewPrice(book.price);
    };

    const defaultPhotoURL = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png";
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
    const data = () => {
        navigate("/data");
    }

    const viewCreator = (creatorId) => {
        navigate(`/creator/${creatorId}`);
    };

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
            <div className="flex justify-center top-10 right-10 fixed z-50 space-x-4" >
                <span>
                    <button
                        onClick={profile}
                        className="bg-blue-500 text-white px-4 py-2 mx-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        My Profile
                    </button>
                    <button
                        onClick={data}
                        className="bg-violet-600 text-white px-4 py-2 mx-2 rounded-lg hover:bg-violet-600 transition duration-300"
                    >
                        Add Books
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
                    const creator = creators[book.creatorId] || {};
                    console.log("book", book, creator)

                    return (
                        <div key={book.id} className="flex items-center space-x-5 mb-5 p-3 rounded-lg shadow-md">
                            <>
                                <h4><span className="font-semibold">Name: </span> {book.name}</h4>
                                <p><span className="font-semibold">Price: </span>{book.price}</p>
                                {(creator.displayName) && (

                                    <>
                                        <p><span className="font-semibold">Created By: </span>{creator.displayName}</p>
                                        <Link to={`/creator/${book.creatorId}`}>
                                            <img
                                                src={creator.photoURL || defaultPhotoURL}
                                                alt={`${creator.displayName}'s avatar`}
                                                className="w-12 h-12 rounded-full"
                                                onClick={() => viewCreator(creator.uid)}
                                            />
                                        </Link>

                                    </>
                                )}
                            </>
                        </div>
                    );
                })}
            </div>
        </div>


    );
};

export default Home;
