

import { db } from "../config/firebase";
import { addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";


export const add = async (booksCollectionRef, data) => {


    try {

        await addDoc(booksCollectionRef, { displayName: data.name, email: data.email })

    }
    catch (err) {
        console.error(err)
    }

}

export const deleteU = async (id) => {
    const bookDoc = doc(db, "users", id);

    try {
        await deleteDoc(bookDoc);
        getBooks()

    }
    catch (err) {
        console.error(err)
    }

}
export const getU = async (booksCollectionRef) => {

    const data = await getDocs(booksCollectionRef);
    const res = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    return res
}



export const updateU = async (data, id) => {

    const bookDoc = doc(db, "users", id);
    try {
        await updateDoc(bookDoc, { displayName: data.name, email: data.email, bio: data.bio, phone: data.phone, photourl: data.photourl, location: data.location });

    } catch (err) {
        console.error(err);
    }
};







