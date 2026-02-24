

export default function FaildToFetchData({size , align = 'right'}) {
  return (
    <div className={`text-red-500 text-${size} text-${align}`}>
      خطا در دریافت اطلاعات.
    </div>
  )
}
