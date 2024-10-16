import Sidebar from "@/components/Sidebar";
import { useToDoStore } from "@/stores/ToDoStore";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  const { error, fetchLists, fetchTasks } = useToDoStore();

  useEffect(() => {
    fetchLists();
    fetchTasks();
  }, []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col sm:flex-row h-full px-4 py-6">
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default Layout;
