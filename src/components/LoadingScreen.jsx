import React from "react";
import { OrbitProgress } from "react-loading-indicators";

function LoadingScreen({ open }) {
  return (
    <div>
      {open && (
        <div className="fixed top-4 w-full z-50 md:hidden">
          <div className="flex items-center justify-center gap-2 p-2">
            <div className="bg-stone-700 shadow-lg aspect-square p-2 rounded-full">
              <OrbitProgress
                style={{
                  fontSize: "5px",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                color="#0ea5e9"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingScreen;
