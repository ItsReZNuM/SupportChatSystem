import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function ProblemMenu({ formData, setFormData, setError }) {
    const problems = [
        {
            id: 1,
            desc: "مشکل در پرداخت",
        },
        {
            id: 2,
            desc: "سفارش انجام نشده",
        },
        {
            id: 3,
            desc: "تاخیر در انجام سفارش",
        },
        {
            id: 4,
            desc: "ریزش ممبر / ویو / ریکشن",
        },
        {
            id: 5,
            desc: "سوالات عمومی",
        },
    ];
    const [problemMenuStatus, setProblemMenuStatus] = useState(false);
    return (
        <>
            <div className="problem-menu border border-gray-300 p-2 rounded-lg relative text-gray-700">
                <div
                    onClick={() => setProblemMenuStatus(!problemMenuStatus)}
                    className="display-problem cursor-pointer text-sm flex justify-between items-center"
                >
                    <div className="problem-title">
                        {formData.problem === ""
                            ? "چه مشکلی دارید؟"
                            : formData.problem}
                    </div>
                    <div className="icon flex justify-center items-center">
                        <FontAwesomeIcon icon={faAngleDown} />
                    </div>
                </div>
                <div
                    className={`problems absolute w-full transition-all duration-300 ${problemMenuStatus ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} right-0 top-10 p-2 text-sm rounded-lg gap-1 bg-white flex flex-col border border-gray-300`}
                >
                    {problems.map((problem) => {
                        return (
                            <div
                                onClick={() => {
                                    setProblemMenuStatus(false)
                                    setError(null);
                                    setFormData({
                                        ...formData,
                                        problem: problem.desc,
                                    });
                                }}
                                key={problem.id}
                                className="problem-item transition-all duration-300 hover:bg-blue-500 hover:text-white rounded-lg p-1 cursor-pointer"
                            >
                                {problem.desc}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
