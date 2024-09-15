import React from "react";

const Header = ({ session, signIn, signOut }) => {
  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-3 text-xl">Stock Management System</span>
        </a>

        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          {session ? (
            <>
              <p className="mr-5">Welcome, {session.user.name}!</p>
              <button
                onClick={() => signOut()}
                className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => signIn("google")}
                className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded"
              >
                Sign in with Google
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
