export default function LoadingAnimation() {
  return (
    <div className="fixed top-0 z-50 left-0 w-full h-1">
      <div
        className={`h-full bg-sky-500 rounded-full animate-loading-bar`}
      ></div>
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
