import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function FloatingTitle({floatingTitle , titleY , titleVisible ,theme}) {
  return (
    <>
      <div
        className={`floating-title z-10 fixed top-5 transition-all duration-300 right-20 ${theme == 'dark' ? 'text-gray-300 bg-gray-500' : 'text-gray-800 bg-gray-300' } px-4 py-1 whitespace-nowrap text-sm rounded-md ${
          titleVisible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          top: 0,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {floatingTitle}
        <FontAwesomeIcon className={`${theme == 'dark' ? 'text-gray-500' : 'text-gray-300'} absolute -right-4 -top-px text-3xl`} icon={faCaretRight} />
      </div>
    </>
  );
}
