import { routes } from "./routes";
import FloatingDebugWindow from "@/components/debug-window";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DebugPanel = () => {
  return (
    <FloatingDebugWindow>
      <div className="flex flex-col space-y-2 overflow-scroll h-[350px] w-full overflow-x-hidden scrollbar-imv scrollbar-thumb-gray-400  hover:scrollbar-thumb-gray-500">
        {routes.map((route) => (
          <Link to={route.path} key={route.path}>
            <Button className="w-full">{route.title}</Button>
          </Link>
        ))}
      </div>
    </FloatingDebugWindow>
  );
};

export { DebugPanel };
