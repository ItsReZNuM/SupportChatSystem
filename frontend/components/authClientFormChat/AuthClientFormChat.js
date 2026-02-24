import { useEffect, useState } from "react";
import ProblemMenu from "../problemMenu/ProblemMenu";

export default function AuthClientFormChat({showForm , setShowForm}) {
    const [error, setError] = useState(null);
    // state for form data
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        problem: "",
    });
    const checkEmpty = () => {
        if (
            formData.username.trim() === "" ||
            formData.email.trim() === "" ||
            formData.problem.trim() === ""
        ) {
            setError("لطفا همه فیلد ها را تکمیل کنید!");
            return false;
        }
        return true;
    };
    const checkValidation = () => {
        if (
            !formData.username.match(
                /^(?=.{3,15}$)[A-Za-z\u0600-\u06FF]+([A-Za-z\u0600-\u06FF]+)*$/,
            )
        ) {
            setError("نام کاربری نامعتبر");
            return false;
        }
        if (!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
            setError("ایمیل نامعتبر");
            return false;
        }
        return true;
    };

    const authHandler = async () => {
        if (!checkEmpty()) return;
        if (!checkValidation()) return;
        localStorage.setItem("formData", JSON.stringify(formData));
        setShowForm(false);
    };

    useEffect(() => {
        if (localStorage.getItem("formData")) {
            setShowForm(false);
        }
    });

    return (
        <div
            className={`auth-client w-[90%] absolute transition-all duration-300 ${showForm ? "translate-x-0 opacity-100" : "translate-x-100 opacity-0"} bg-white rounded-lg p-5 flex flex-col gap-4`}
        >
            <h5 className="title text-center text-sm text-gray-800">
                برای شروع گفتگو لطفا فرم زیر را تکمیل کنید.
            </h5>
            <div className={`display-error text-xs text-center text-red-500`}>
                {error}
            </div>
            <input
                onChange={(e) => {
                    setError(null);
                    setFormData({ ...formData, username: e.target.value });
                }}
                placeholder="نام کاربری"
                className="nickname border border-gray-300 rounded-lg p-2 text-sm outline-none text-gray-800"
                type="text"
            />
            <input
                onChange={(e) => {
                    setError(null);
                    setFormData({ ...formData, email: e.target.value });
                }}
                placeholder="ایمیل"
                className="email border border-gray-300 rounded-lg p-2 text-sm outline-none text-gray-800"
                type="text"
            />
            <ProblemMenu
                formData={formData}
                setFormData={setFormData}
                setError={setError}
            />
            <button
                onClick={authHandler}
                className="text-sm bg-blue-500 rounded-lg p-2 text-white cursor-pointer"
            >
                شروع
            </button>
        </div>
    );
}
