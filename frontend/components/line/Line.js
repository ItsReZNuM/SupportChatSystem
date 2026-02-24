export default function Line({axis}){
    return(
        <>
            <div className={`line bg-gray-300 ${axis == 'h' ? 'w-[95%] h-px my-2' : 'w-px h-8 mx-1'}`} />
        </>
    )
}