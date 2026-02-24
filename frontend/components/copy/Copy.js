export default function Copy({theme}){
    return(
        <>
        <div className={`copy text-center py-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`text-xs ${theme ==='dark' ? 'text-gray-50' : 'text-gray-600'}`}>© 2025. All rights reserved — Developed by pnx</p>
        </div>
        </>
    )
}