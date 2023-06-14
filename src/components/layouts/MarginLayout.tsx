import React from "react";

function MarginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
      {children}
    </div>
  );
}

export default MarginLayout;
