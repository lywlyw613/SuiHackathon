import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { LoginPage } from "./components/LoginPage";
import { HomePage } from "./components/HomePage";
import { ChatroomDetail } from "./components/ChatroomDetail";
import { ProfilePage } from "./components/ProfilePage";
import { CreateChatroomPage } from "./components/CreateChatroomPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const account = useCurrentAccount();
  return account ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatroom/:chatroomId"
          element={
            <ProtectedRoute>
              <ChatroomDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:address"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateChatroomPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
