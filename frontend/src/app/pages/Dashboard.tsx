import dayjs from "dayjs";

import { useAuth } from "@/context/AuthContext";
import { List, Task, useToDoStore } from "@/stores/ToDoStore";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

function getDate(date: Date) {
  const isThisWeek =
    dayjs(date).isBefore(dayjs().endOf("week")) &&
    dayjs(date).isAfter(dayjs().subtract(1, "day"));

  const isThisYear = dayjs(date).isSame(dayjs(), "year");

  if (isThisWeek) {
    return dayjs(date).format("ddd, DD MMM");
  } else if (isThisYear) {
    return dayjs(date).format("DD MMMM");
  } else {
    return dayjs(date).format("DD.MM.YYYY");
  }
}

function sortTasks(tasks: Task[]) {
  return tasks.sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    if (dayjs(a.date).isBefore(dayjs(b.date))) return -1;
    if (dayjs(a.date).isAfter(dayjs(b.date))) return 1;
    if (dayjs(a.updatedAt).isBefore(dayjs(b.updatedAt))) return -1;
    if (dayjs(a.updatedAt).isAfter(dayjs(b.updatedAt))) return 1;
    return 0;
  });
}

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
  const tasks = useToDoStore((state) => state.tasks);

  const todayTasks = tasks.filter((task) => {
    return dayjs(task.date).isSame(dayjs(), "day");
  });

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
          {todayTasks.filter((task) => !task.completed).length}
        </div>
      </div>
      {/* <CollapsibleContent className="flex flex-col gap-4 pt-2"> */}
      {/* <Accordion type="single" collapsible>
        {sortTasks(todayTasks).map((task) => (
          <FlexibleTask task={task} key={task.id} />
        ))}
      </Accordion> */}
      {/* </CollapsibleContent> */}
    </Collapsible>
  );
}

function ExpandableList({ list }: { list: List }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getTasksByList } = useToDoStore();

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
          {list.tasks ? list.tasks.filter((task) => !task.completed).length : 0}
        </div>
      </div>
      <CollapsibleContent>
        <Accordion
          className="flex flex-col gap-4 pt-2"
          type="single"
          collapsible
        >
          {sortTasks(getTasksByList(list.id)).map((task) => (
            <FlexibleTask task={task} key={task.id} />
          ))}
        </Accordion>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FlexibleTask({ task }: { task: Task }) {
  const { markTaskAsCompleted } = useToDoStore();

  return (
    <AccordionItem
      className="w-full border-none flex flex-col gap-2"
      value={`task-${task.id}`}
      disabled={task.description.length === 0}
    >
      <div className="w-full flex items-center px-4 pl-10 gap-4">
        <Checkbox
          className={`w-5 h-5 ${
            task.completed ? "opacity-40" : ""
          } transition-opacity duration-300`}
          checked={task.completed}
          onCheckedChange={(checked) => {
            markTaskAsCompleted(task.id, checked as boolean);
          }}
        />
        <AccordionTrigger className="w-full relative">
          <div
            className={`flex w-full justify-between ${
              task.completed ? "opacity-40" : "opacity-100"
            } transition-opacity duration-300`}
          >
            <div className="flex items-center gap-2 flex-1 w-full min-w-0">
              <p className="text-base text-ellipsis whitespace-nowrap overflow-hidden">
                {task.name}
              </p>
            </div>
            <div className="text-xs bg-secondary text-secondary-foreground font-light p-1 px-2 rounded-sm flex-shrink-0">
              {getDate(task.date)}
            </div>
          </div>
          <div
            className={`${
              task.completed ? "w-[95%]" : "w-0"
            } h-[2px] absolute bg-neutral-300 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 rounded-full`}
          ></div>
        </AccordionTrigger>
      </div>
      <AccordionContent className="pl-6">
        <h3 className="px-4 py-1 text-base font-semibold">{task.name}</h3>
        <div className="px-4 pb-2 text-sm font-light text-muted-foreground">
          {task.description}
        </div>
        <Separator />
      </AccordionContent>
    </AccordionItem>
  );
}

export default Home;
