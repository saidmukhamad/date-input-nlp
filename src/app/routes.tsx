import { Route, Routes } from "react-router-dom";

const App = () => {
  return <div>yep, starter</div>;
};
const routes = [{ path: "/", component: App, title: "Starter" }];

const Router = () => {
  return (
    <div>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}
      </Routes>
    </div>
  );
};
export { routes, Router };
