
import PrivateRoutes from "../components/privateRouter";
import LayoutAdmin from "../layouts/LayoutAdmin";
import LayoutDefault from "../layouts/LayoutDefault";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Profile from "../pages/Profile";
import Register from "../pages/Register";



export const routes = [
      {
            path: "/",
            element: <LayoutDefault />,
            children: [
                  {
                        index: true,
                        element: <Home />
                  },
                  {
                        path: "login",
                        element: <Login />
                  },
                  {
                        path: "register",
                        element: <Register />
                  },
                  {
                        path: "logout",
                        element: <Logout />
                  },
            ]
      },
      {
            element: <PrivateRoutes />,
            children: 
            [
                  {
                        path: "profile",
                        element: <Profile />
                  },
                  {
                        path: "admin",
                        element: <LayoutAdmin />
                  }
            ]
      }
]