import { auth, db, storage } from "../config/firebase";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { doc, GeoPoint, getDoc, setDoc } from "firebase/firestore";

const Profile = () => {
    const navigate = useNavigate();
    const [userP, setUserP] = useState(null);
    const [creatorId, setCreatorId] = useState("");
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
    const [firestoreData, setfirestoreData] = useState({});

    // Function to navigate to books page
    const books = () => {
        navigate("/data");
    };

    // Function to sign out the user
    const signout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };

    // Function to show the update form
    const update = async () => {
        setShowForm(true);
    };

    // Handle changes in form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle file input changes
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let photoURL = formData.photoURL;

            // Upload file and get the download URL
            if (file) {
                const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
                await uploadBytes(storageRef, file);
                photoURL = await getDownloadURL(storageRef);
            }

            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, {
                displayName: formData.displayName,
                photoURL,
            });

            // Create GeoPoint from formData.location
            const { latitude, longitude } = formData.location;
            if (
                latitude < -90 || latitude > 90 ||
                longitude < -180 || longitude > 180
            ) {
                console.error("Invalid latitude or longitude values.");
                alert("Please enter valid latitude and longitude values.");
                return; // Prevent form submission
            }
            const locationGeoPoint = new GeoPoint(latitude, longitude);

            // Update Firestore document with new data
            const uDoc = doc(db, "users", auth.currentUser.uid);
            await setDoc(uDoc, {
                displayName: formData.displayName,
                email: formData.email,
                photoURL,
                phone: formData.phone,
                bio: formData.bio,
                location: locationGeoPoint,
            }, { merge: true });

            // Update state with new values
            const updatedData = {
                displayName: formData.displayName,

                email: formData.email,
                photoURL,
                phone: formData.phone,
                bio: formData.bio,
                location: locationGeoPoint,
            };

            setfirestoreData(updatedData);
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

    // Fetch user data and set state on auth change
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const uDoc = doc(db, "users", user.uid);
                const docSnapshot = await getDoc(uDoc);

                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    console.log("firestore", data);

                    // Handle location as GeoPoint
                    const location = data.location instanceof GeoPoint
                        ? {
                            latitude: data.location.latitude,
                            longitude: data.location.longitude
                        }
                        : { latitude: 0, longitude: 0 }; // Default values if location is not a GeoPoint

                    // Set state with fetched data
                    setfirestoreData(data);
                    setFormData({
                        displayName: data.displayName || "",
                        email: data.email || "",
                        photoURL: data.photoURL || "",
                        phone: data.phone || "",
                        bio: data.bio || "",
                        location: location, // Correctly set location
                    });
                } else {
                    console.log("No document found for this user.");
                }

                setCreatorId(user.uid);
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
                    onClick={books}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    My Books
                </button>
                <button
                    onClick={signout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                >
                    Sign Out
                </button>
            </div>

            <div className="text-center mt-16">
                <h1 className="text-4xl font-bold mb-6">User Profile</h1>

                {firestoreData ? (
                    <div className="flex flex-col items-center">
                        {firestoreData.photoURL ? (
                            <img src={firestoreData.photoURL} alt="User Avatar" className="w-24 h-24 rounded-full mb-4" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-white mb-4">
                                <span className="text-3xl">?</span>
                            </div>
                        )}

                        <p className="text-2xl mb-2">Name: {firestoreData.displayName}</p>
                        <p className="text-2xl mb-6">Email: {firestoreData.email}</p>
                        {firestoreData.phone ? (
                            <p className="text-2xl mb-2">Phone: {firestoreData.phone}</p>
                        ) : (
                            ""
                        )}
                        {firestoreData.bio ? (
                            <p className="text-2xl mb-6">Bio: {firestoreData.bio}</p>
                        ) : (
                            ""
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

                                {/* Additional fields for phone, bio, and location */}
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
                                            value={formData.location.longitude || 0}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                location: {
                                                    ...formData.location,
                                                    longitude: parseFloat(e.target.value) || 0
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
