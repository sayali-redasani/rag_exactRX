import { useRoutes } from "react-router-dom";
import Homee from "./pages/Home/Homee";
const Router = () => {

    const routes = useRoutes([
        {
            path:'',
            // element:<SideBar/>,
            children:[
                {
                    path:'',
                    element:<Homee/>
                },
            
                
                {
                    path:'home',
                    element:<Homee />
                }
            ]
        }
    ])
    return routes;
}
// export default Router;

export default function AppRouter() {
    return (
      
        <Router />

    );
  }