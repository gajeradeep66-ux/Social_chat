import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import UserProfilePage from './pages/UserProfilePage'
import FollowRequestsPage from "./pages/FollowRequestsPage";
import AllUsersPage from "./components/AllUsersPage";
import { useAuthStore } from "./store/useAuthStore";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";

const App = () => {

  const { checkAuth, isCheckingAuth, authUser } = useAuthStore()

  useEffect (() => {
    checkAuth()
  }, [checkAuth])

  if(isCheckingAuth) return <PageLoader />

  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden ">
      <div className="absolute inset-0 bg-[linear-gradient(to_right, #4f4f4f2e_1px, transparent_1px), linear-gradient(to_bottom, #4f4f4f2e_1px, transparent_1px)]" />
      <Routes>
        <Route path="/" element={authUser ? <Chat /> : <Navigate to={'/login'}/> } />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to={'/'}/> } />
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to={'/'}/> } />
        <Route path="/follow-requests" element={authUser ? <FollowRequestsPage /> : <Navigate to={'/login'}/> } />
        <Route path="/users" element={authUser ? <AllUsersPage  /> : <Navigate to={'/login'}/> } />
        <Route path="/profile/:id" element={authUser ? <UserProfilePage /> : <Navigate to={'/login'} />}/>
        <Route path="*" element={"404 Not Found"} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
