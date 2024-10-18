import dayjs from "dayjs";

import { useAuth } from "@/context/AuthContext";
import { List, Task, useToDoStore } from "@/stores/ToDoStore";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ChevronDownIcon,
  Cross2Icon,
  DotsHorizontalIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion as TaskAccordion } from "@/components/ui/TaskAccordion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

/**
 * Selects all incomplete tasks and first 3 completed tasks
 * @param tasks
 */
function selectTaskList(tasks: Task[]) {
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed).slice(0, 3);

  return [...incompleteTasks, ...completedTasks];
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
      <Accordion className="mt-4 flex flex-col gap-4" type="multiple">
        <TodaysList />
        {lists.map((list) => (
          <ExpandableList key={list.id} list={list} />
        ))}
      </Accordion>
    </main>
  );
}

function TodaysList() {
  const tasks = useToDoStore((state) => state.tasks);

  const todayTasks = tasks.filter((task) => {
    return dayjs(task.date).isSame(dayjs(), "day");
  });

  return (
    <AccordionItem value={`list-today`} className="border-none">
      <AccordionTrigger className="flex gap-2 items-center">
        <div className="flex items-center gap-2">
          <CalendarIcon />
          <h3 className="text-xl font-semibold">Today</h3>
        </div>
        <div className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs rounded-sm">
          {todayTasks.filter((task) => !task.completed).length}
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 pt-2">
        {selectTaskList(sortTasks(todayTasks)).map((task) => (
          <FlexibleTask task={task} key={task.id} />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

function ExpandableList({ list }: { list: List }) {
  const { getTasksByList } = useToDoStore();

  return (
    <AccordionItem value={`list-${list.id}`} className="border-none">
      <AccordionTrigger className="flex gap-2 items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">{list.name}</h3>
        </div>
        <div className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs rounded-sm">
          {list.tasks ? list.tasks.filter((task) => !task.completed).length : 0}
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 pt-2">
        {selectTaskList(sortTasks(getTasksByList(list.id))).map((task) => (
          <FlexibleTask task={task} key={task.id} />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

function FlexibleTask({ task }: { task: Task }) {
  const { markTaskAsCompleted, removeTask } = useToDoStore();

  return (
    <Drawer>
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
        <DrawerTrigger asChild>
          <button className="w-full relative">
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
                task.completed ? "w-full" : "w-0"
              } h-[2px] absolute bg-neutral-300 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 rounded-full`}
            ></div>
          </button>
        </DrawerTrigger>
      </div>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex gap-2 items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                className={`w-5 h-5 ${
                  task.completed ? "opacity-40" : ""
                } transition-opacity duration-300`}
                checked={task.completed}
                onCheckedChange={(checked) => {
                  markTaskAsCompleted(task.id, checked as boolean);
                }}
              />
              {task.name}
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full"
                    >
                      <DotsHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start items-center gap-2"
                      >
                        <Pencil2Icon />
                        Edit
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full justify-start items-center gap-2"
                          onClick={() => {
                            removeTask(task.id);
                          }}
                        >
                          <TrashIcon />
                          Delete
                        </Button>
                      </DialogTrigger>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent className="flex w-auto flex-col rounded-md [&>button]:hidden p-4">
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-row justify-between gap-10 mt-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        // removeList(list.id);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <DrawerClose asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <Cross2Icon />
                </Button>
              </DrawerClose>
            </div>
          </DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}

export default Home;
