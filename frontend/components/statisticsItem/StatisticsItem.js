export default function StatisticsItem({ title, info, icon, theme }) {
  return (
    <>
      <div
        className={`statistics-item w-full ${
          theme == "dark" ? "bg-gray-800" : "bg-white"
        } rounded-lg flex items-center justify-between p-5`}
      >
        <div className="title-info-container">
          <div
            className={`title ${
              theme == "dark" ? "text-gray-300" : "text-gray-600"
            } text-xs`}
          >
            {title}
          </div>
          <div
            className={`info ${
              theme == "dark" ? "text-gray-100" : "text-gray-900"
            } font-bold mt-1`}
          >
            {info}
          </div>
        </div>
        <div className="icon-container text-2xl">{icon}</div>
      </div>
    </>
  );
}
