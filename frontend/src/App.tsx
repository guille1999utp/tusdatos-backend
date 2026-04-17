import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminPanelLayout from "./components/layout/admin-panel-layout";
import { AuthProvider } from "./auth/AuthContext";
import { PublicRoute } from "./auth/PublicRoute";
import { PrivateRoute } from "./auth/PrivateRoute";
import { RoleRoute } from "./auth/RoleRoute";
import { ToastContainer } from "react-toastify";
import AuthLayout from "./auth/AuthLayout";
import TransitionProvider from "./providers/TransitionProvider";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";

const Dashboard = lazy(() =>
  import("./app/dashboard/Dashboard").then((mod) => ({
    default: mod.Dashboard,
  })),
);
const Home = lazy(() => import("./app/home/Home"));
const SignIn = lazy(() => import("./app/SignIn"));
const Register = lazy(() => import("./app/Register"));
const Events = lazy(() =>
  import("./app/events/Events").then((mod) => ({ default: mod.Events })),
);
const EventDetail = lazy(() => import("./app/events/EventDetail"));
const AllEvents = lazy(() =>
  import("./app/all-events/AllEvents").then((mod) => ({
    default: mod.AllEvents,
  })),
);
const AssistantEvents = lazy(() =>
  import("./app/assistant-events/AssistantEvents").then((mod) => ({
    default: mod.AssistantEvents,
  })),
);
const MyRegisteredEvents = lazy(() =>
  import("./app/my-registrations/MyRegisteredEvents").then((mod) => ({
    default: mod.MyRegisteredEvents,
  })),
);
const Profile = lazy(() =>
  import("./app/profile/Profile").then((mod) => ({ default: mod.Profile })),
);
const AdminDashboard = lazy(() => import("./app/admin/AdminDashboard"));
const AdminEvents = lazy(() => import("./app/admin/AdminEvents"));
const AdminUsers = lazy(() => import("./app/admin/AdminUsers"));

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                border: "2px solid #ffffff",
                borderRadius: "22px",
                fontSize: "17px",
                fontWeight: "bold",
                background: "#defd99",
              },
            }}
          />
          <TransitionProvider>
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center min-h-[90vh] gap-4">
                  <Loader2 className="size-10 md:size-13 animate-spin text-primary" />
                  <p className="text-lg md:text-xl xl:text-2xl font-semibold text-white  px-3 rounded-full bg-primary p-2">
                    Cargando...
                  </p>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Navigate to="/" replace />} />

                <Route element={<PublicRoute />}>
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<SignIn />} />
                    <Route path="/register" element={<Register />} />
                  </Route>
                </Route>

                <Route element={<PrivateRoute />}>
                  <Route element={<AdminPanelLayout />}>
                    <Route path="/events/:eventId" element={<EventDetail />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="events" element={<Events />} />
                    <Route path="all-events" element={<AllEvents />} />
                    <Route
                      path="assistant-events"
                      element={<AssistantEvents />}
                    />
                    <Route
                      path="my-registrations"
                      element={<MyRegisteredEvents />}
                    />
                    <Route path="profile" element={<Profile />} />
                    <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                      <Route path="admin" element={<AdminDashboard />} />
                      <Route path="admin/events" element={<AdminEvents />} />
                      <Route path="admin/users" element={<AdminUsers />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </TransitionProvider>
        </AuthProvider>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
