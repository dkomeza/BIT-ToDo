import dayjs from "dayjs";

import { useAuth } from "@/context/AuthContext";
import { List, useToDoStore } from "@/stores/ToDoStore";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useState } from "react";

function Home() {
  const { user } = useAuth();
  const { lists } = useToDoStore();

  return (
    <main className="flex-grow">
      <header className="mt-4">
        <h1 className="text-2xl">Good afternoon, {user?.name}!</h1>
        <p className="font-light text-sm text-muted-foreground">
          It's {dayjs().format("dddd")}, {dayjs().format("DD MMMM YYYY")}
        </p>
      </header>
      <div className="mt-4 flex flex-col gap-4">
        <TodaysList />
        {lists.map((list) => (
          <ExpandableList key={list.id} list={list} />
        ))}
      </div>
    </main>
  );
}

function TodaysList() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={(open) => setIsExpanded(open)}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button size="icon" variant="ghost" className="hover:bg-transparent">
            <ChevronDownIcon
              className={`${
                isExpanded ? "rotate-0" : "-rotate-90"
              } transition-transform`}
            />
          </Button>
        </CollapsibleTrigger>
        <div className="flex items-center gap-2">
          <CalendarIcon />
          <h3 className="text-xl font-semibold">Today</h3>
        </div>
        <div className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs rounded-sm">
          {/* {lists.reduce((acc, list) => {
            return acc + (list.tasks ? list.tasks.length : 0);
          }, 0)} */}
          0
        </div>
      </div>
    </Collapsible>
  );
}

function ExpandableList({ list }: { list: List }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={(open) => setIsExpanded(open)}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button size="icon" variant="ghost" className="hover:bg-transparent">
            <ChevronDownIcon
              className={`${
                isExpanded ? "rotate-0" : "-rotate-90"
              } transition-transform`}
            />
          </Button>
        </CollapsibleTrigger>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">{list.name}</h3>
        </div>
        <div className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs rounded-sm">
          {/* {lists.reduce((acc, list) => {
            return acc + (list.tasks ? list.tasks.length : 0);
          }, 0)} */}
          0
        </div>
      </div>
    </Collapsible>
  );
}

export default Home;
