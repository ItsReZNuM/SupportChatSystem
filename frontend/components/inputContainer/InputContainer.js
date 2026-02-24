import { useState } from "react";
import { faEyeSlash , faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function InputContainer({ title, type, theme , error , onChange}) {
  const [eyeStat, setEyeStat] = useState(false);
  return (
    <>
      <div className="input-container w-[95%] relative">
        <p
          className={`text-[13px]  font-semibold ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {title}
        </p>
        <input
          onChange={(e)=> onChange(e.target.value)}
          type={ type === 'text' ? 'text' : (type === 'password' && eyeStat) ? 'text' : 'password'  }
          className={`w-full [direction:ltr] border text-[15px] rounded-lg py-1.25 px-4 outline-none mt-1 ${error != '' && 'border-red-500'} ${
            theme === "dark"
              ? "text-gray-50 bg-gray-700 border-gray-500"
              : "text-gray-800 border-gray-300"
          }`}
        />
        {type === "password" && (
          <span
            onClick={()=>setEyeStat(!eyeStat)}
            className={`absolute top-7 right-2 cursor-pointer text-lg ${
              theme == "dark" ? "text-gray-50" : "text-gray-600"
            } `}
          >
            {eyeStat ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
          </span>
        )}
        {
          <p className={`error text-xs ${error != '' && 'text-red-600'}  mt-2`}>{error}</p>
        }
      </div>
    </>
  );
}
