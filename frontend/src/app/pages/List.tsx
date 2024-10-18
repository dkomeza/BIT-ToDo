import { useListStore } from "@/stores/ListStore";
import { useToDoStore } from "@/stores/ToDoStore";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { FlexibleTask, sortTasks, selectTaskList } from "./Dashboard";

function List() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

  return (
    <>
      {!loading &&
        (list ? (
          <main className="flex-grow">
            <header className="mt-4">
              <h1 className="text-2xl">{list.name}</h1>
              {list.description && (
                <p className="font-light text-sm text-muted-foreground">
                  {list.description}
                </p>
              )}
            </header>
            <div className="flex flex-col gap-4 pt-2">
              {selectTaskList(sortTasks(getTasksByList(list.id))).map(
                (task) => (
                  <FlexibleTask task={task} key={task.id} />
                )
              )}
            </div>
          </main>
        ) : (
          <Navigate to="/" />
        ))}
    </>
  );
}

export default List;
