import dayjs from "dayjs";

import { useAuth } from "@/context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <main className="flex-grow">
      <header className="mt-4">
        <h1 className="text-2xl">Good afternoon, {user?.name}!</h1>
        <p className="font-light text-sm text-muted-foreground">
          It's {dayjs().format("dddd")}, {dayjs().format("DD MMMM YYYY")}
        </p>
      </header>
    </main>
  );
}

export default Home;
