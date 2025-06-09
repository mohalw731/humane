import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";

import { db } from "../configs/firebase";

export default function useAddMailToWaitingList() {
    const [email, setEmail] = useState<string>("");
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleAddMailToWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes("@") || !email || !email.includes(".")) {
            return;
        }
        try {
            await addDoc(collection(db, "emails"), { email });
            setEmail("");
        } catch (error: any) {
        }
    };

    return {
        email,
        setEmail,
        handleAddMailToWaitlist,
        isEmailValid,
        setIsEmailValid,
        isValidEmail
    };
}
