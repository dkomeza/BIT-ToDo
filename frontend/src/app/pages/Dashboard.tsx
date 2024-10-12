import dayjs from "dayjs";

import Sidebar from "@/components/Sidebar";

function Dashboard() {
  return (
    <div className="flex flex-col sm:flex-row h-full px-4 py-6">
      <Sidebar />
      <main className="flex-grow">
        <header className="mt-4">
          <h1 className="text-2xl">Good afternoon, Dawid!</h1>
          <p className="font-light text-sm text-muted-foreground">
            It's {dayjs().format("dddd")}, {dayjs().format("DD MMMM YYYY")}
          </p>
        </header>
      </main>
    </div>
  );
}

export default Dashboard;
