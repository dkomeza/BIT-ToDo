import { useListStore } from "@/stores/ListStore";
import { useToDoStore } from "@/stores/ToDoStore";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { FlexibleTask, sortTasks, selectTaskList } from "./Dashboard";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function List() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { slug } = useParams();

  const { lists, getTasksByList } = useToDoStore();
  const { fetchList } = useListStore();

  const list = lists.find((list) => list.slug === slug);

  useEffect(() => {
    if (!slug) {
      navigate("/");
      return;
    }

    fetchList(slug)
      .then(() => setLoading(false))
      .catch(() => navigate("/"));
  }, []);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      {!loading &&
        (list ? (
          <div className="flex-grow flex">
            <main className="flex-grow">
              <header className="mt-4">
                <h1 className="text-2xl lg:text-4xl">
                  Good afternoon, {user?.name}!
                </h1>
                <p className="font-light text-sm lg:text-lg text-muted-foreground">
                  It's {dayjs().format("dddd")},{" "}
                  {dayjs().format("DD MMMM YYYY")}
                </p>
              </header>
              <div className="flex flex-col gap-4 pt-2 mt-4">
                {selectTaskList(sortTasks(getTasksByList(list.id))).map(
                  (task) => (
                    <FlexibleTask task={task} key={task.id} />
                  )
                )}
              </div>
            </main>
            {isDesktop && (
              <aside className="w-80 border-l-2 px-4 py-2">
                {list && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl lg:text-3xl font-semibold">
                        {list.name}
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        {list.description}
                      </p>
                    </div>
                    <div className="flex justify-between px-6">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-secondary-foreground font-thin">
                          Tasks
                        </h3>
                        <p className="text-secondary-foreground px-4 py-2 rounded-lg text-lg lg:text-xl border">
                          {list.tasks.filter((task) => !task.completed).length}{" "}
                          {list.tasks.filter((task) => !task.completed)
                            .length !== 1
                            ? "tasks"
                            : "task"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-secondary-foreground font-thin">
                          Completed
                        </h3>
                        <p className="text-secondary-foreground px-4 py-2 rounded-lg text-lg lg:text-xl border">
                          {list.tasks.filter((task) => task.completed).length}{" "}
                          {list.tasks.filter((task) => task.completed)
                            .length !== 1
                            ? "tasks"
                            : "task"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            )}
          </div>
        ) : (
          <Navigate to="/" />
        ))}
    </>
  );
}

export default List;
