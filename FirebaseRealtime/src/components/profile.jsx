import { useState, useEffect } from "react";
import { auth, db, storage } from "../config/firebase";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, set, get } from "firebase/database";

const Profile = () => {
    const navigate = useNavigate();
    const [userP, setUserP] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        email: "",
        photoURL: "",
        phone: "",
        bio: "",
        location: {
            latitude: 0,
            longitude: 0
        },
    });

    const [file, setFile] = useState(null);
    const [realtimeData, setRealtimeData] = useState({});

    const signout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };

    const update = async () => {
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let photoURL = formData.photoURL;


            if (file) {
                const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
                await uploadBytes(storageRef, file);
                photoURL = await getDownloadURL(storageRef);
            }

            await updateProfile(auth.currentUser, {
                displayName: formData.displayName,
                photoURL,
            });

            const { latitude, longitude } = formData.location;
            if (
                latitude < -90 || latitude > 90 ||
                longitude < -180 || longitude > 180
            ) {
                console.error("Invalid latitude or longitude values.");
                alert("Please enter valid latitude and longitude values.");
                return;
            }


            const userRef = dbRef(getDatabase(), `users/${auth.currentUser.uid}`);
            await set(userRef, {
                displayName: formData.displayName,
                email: formData.email,
                photoURL,
                phone: formData.phone,
                bio: formData.bio,
                location: {
                    latitude,
                    longitude
                },
            });


            const updatedData = {
                displayName: formData.displayName,
                email: formData.email,
                photoURL,
                phone: formData.phone,
                bio: formData.bio,
                location: {
                    latitude,
                    longitude
                },
            };

            setRealtimeData(updatedData);
            setFormData(updatedData);

            setUserP({
                ...userP,
                displayName: formData.displayName,
                photoURL,
            });

            setShowForm(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = dbRef(getDatabase(), `users/${user.uid}`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log("realtime", data);


                    const location = data.location || { latitude: 0, longitude: 0 };


                    setRealtimeData(data);
                    console.log("ddd", data)
                    setFormData({
                        displayName: data.displayName || data.Displayname || "",
                        email: data.email || "",
                        photoURL: data.photoURL || "",
                        phone: data.phone || "",
                        bio: data.bio || "",
                        location: location,
                    });
                } else {
                    console.log("No data found for this user.");
                }

                setUserP(user);
            } else {
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className="relative">
            <div className="flex justify-center top-10 right-10 fixed z-50 space-x-4">
                <button
                    onClick={signout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                >
                    Sign Out
                </button>
            </div>

            <div className="text-center mt-16">
                <h1 className="text-4xl font-bold mb-6">User Profile</h1>

                {realtimeData ? (
                    <div className="flex flex-col items-center">
                        {realtimeData.photoURL ? (
                            <img src={realtimeData.photoURL} alt="User Avatar" className="w-24 h-24 rounded-full mb-4" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-white mb-4">
                                <span className="text-3xl">?</span>
                            </div>
                        )}


                        <p className="text-2xl mb-2">Name: {realtimeData.Displayname ? realtimeData.Displayname : realtimeData.displayName}</p>
                        <p className="text-2xl mb-6">Email: {realtimeData.email}</p>
                        {realtimeData.phone && (
                            <p className="text-2xl mb-2">Phone: {realtimeData.phone}</p>
                        )}
                        {realtimeData.bio && (
                            <p className="text-2xl mb-6">Bio: {realtimeData.bio}</p>
                        )}

                        <button onClick={update} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300">
                            Update
                        </button>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg space-y-6">
                                <div>
                                    <label className="block text-lg font-semibold mb-2">
                                        Name:
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-lg font-semibold mb-2">
                                        Image:
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-lg font-semibold mb-2">
                                        Phone:
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-lg font-semibold mb-2">
                                        Bio:
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                            rows="3"
                                        ></textarea>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-lg font-semibold mb-2">
                                        Latitude:
                                        <input
                                            type="number"
                                            name="latitude"
                                            value={formData.location.latitude}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                location: {
                                                    ...formData.location,
                                                    latitude: parseFloat(e.target.value)
                                                }
                                            })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-lg font-semibold mb-2">
                                        Longitude:
                                        <input
                                            type="number"
                                            name="longitude"
                                            value={formData.location.longitude}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                location: {
                                                    ...formData.location,
                                                    longitude: parseFloat(e.target.value)
                                                }
                                            })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                        />
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                    Save
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    <p className="text-lg mt-4">No user data available</p>
                )}
            </div>
        </div>
    );
};

export default Profile;
