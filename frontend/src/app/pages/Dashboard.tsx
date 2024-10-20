import dayjs from "dayjs";

import { useAuth } from "@/context/AuthContext";
import { List, Task, useToDoStore } from "@/stores/ToDoStore";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Cross2Icon,
  DotsHorizontalIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NewTask from "@/components/NewTask";

export function getDate(date: Date) {
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

export function sortTasks(tasks: Task[]) {
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
export function selectTaskList(tasks: Task[]) {
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed).slice(0, 3);

  return [...incompleteTasks, ...completedTasks];
}

function Home() {
  const { user } = useAuth();
  const { lists } = useToDoStore();

  return (
    <main className="flex-grow">
      <header className="mt-4 flex gap-8">
        <div>
          <h1 className="text-2xl">Good afternoon, {user?.name}!</h1>
          <p className="font-light text-sm text-muted-foreground">
            It's {dayjs().format("dddd")}, {dayjs().format("DD MMMM YYYY")}
          </p>
        </div>
        <NewTask />
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
      <AccordionContent className="flex flex-col gap-4 pt-2 pl-10">
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
      <AccordionContent className="flex flex-col gap-4 pt-2 pl-10">
        {selectTaskList(sortTasks(getTasksByList(list.id))).map((task) => (
          <FlexibleTask task={task} key={task.id} />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().optional(),
  date: z.coerce.date(),
  list: z.string(),
});

export function FlexibleTask({ task }: { task: Task }) {
  const { lists, markTaskAsCompleted, removeTask, updateTask } = useToDoStore();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    form.setValue("title", task.name);
    form.setValue("description", task.description);
    form.setValue("date", new Date(task.date));
    form.setValue("list", task.list?.name || "");
  }, [task]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.name,
      description: task.description,
      date: task.date,
      list: task.list?.name || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const list = lists.find((list) => list.name === data.list);
    console.log(list);
    if (!list) {
      throw new Error("List not found");
    }

    if (!data.date) {
      throw new Error("Date is required");
    }

    await updateTask(task.id, {
      name: data.title,
      description: data.description,
      date: data.date,
      list: list,
    });
    setIsEditing(false);
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Sheet
        onOpenChange={(open) => {
          if (!open) {
            setIsEditing(false);
          }
        }}
      >
        <div className="w-full flex items-center px-4 gap-4 max-w-[600px]">
          <Checkbox
            className={`w-5 h-5 ${
              task.completed ? "opacity-40" : ""
            } transition-opacity duration-300`}
            checked={task.completed}
            onCheckedChange={(checked) => {
              markTaskAsCompleted(task.id, checked as boolean);
            }}
          />
          <SheetTrigger asChild>
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
          </SheetTrigger>
        </div>
        <SheetContent side="right" className="w-96">
          {!isEditing && (
            <>
              <SheetHeader>
                <SheetTitle>
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
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 pb-6">
                <div className="flex justify-between items-stretch">
                  <div className="flex flex-col gap-1">
                    <p className="text-neutral-300 font-light ml-2 text-sm">
                      List
                    </p>
                    <div className="px-4 py-2 bg-secondary rounded-md w-auto">
                      {task.list?.name || "No list"}
                    </div>
                  </div>
                  <Separator className="h-auto" orientation="vertical" />
                  <div className="flex flex-col">
                    <p className="text-neutral-300 font-light ml-2 text-sm">
                      {task.completed ? "Completed on" : "Due on"}
                    </p>
                    <div className="px-2 py-2 rounded-md w-auto">
                      {task.completed
                        ? dayjs(task.updatedAt).format("DD MMMM YYYY")
                        : dayjs(task.date).format("DD MMMM YYYY")}
                    </div>
                  </div>
                </div>
                {task.description ? (
                  <>
                    <Separator className="my-2" />
                    <div>
                      <p className="text-neutral-300 font-light ml-2 text-sm">
                        Description
                      </p>
                      <p className="px-2 py-2 rounded-md w-auto">
                        {task.description}
                      </p>
                    </div>
                  </>
                ) : null}

                <div className="flex gap-4 px-2 mt-2">
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={() => {
                      setIsEditing(true);
                    }}
                  >
                    <Pencil2Icon className="w-4 h-4" />
                    Edit
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full gap-2">
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </Button>
                    </DialogTrigger>
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
                            removeTask(task.id);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </>
          )}
          {isEditing && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DrawerHeader className="p-0 mt-4">
                  <DrawerTitle>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm ml-2">Title</FormLabel>
                          <FormControl>
                            <Input className="text-base" {...field} />
                          </FormControl>
                          <FormMessage>
                            {form.formState.errors.title?.message}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </DrawerTitle>
                </DrawerHeader>
                <div className="pb-6 mt-4">
                  <div className="flex flex-col items-stretch gap-4 px-4">
                    <FormField
                      control={form.control}
                      name="list"
                      render={({ field }) => (
                        <FormItem className="w-full flex items-baseline gap-4">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormLabel>List</FormLabel>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {lists.map((list) => (
                                <SelectItem key={list.id} value={list.name}>
                                  {list.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    ></FormField>
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <Dialog>
                          <div className="flex gap-2 items-baseline w-full">
                            Date
                            <DialogTrigger asChild>
                              <Button
                                variant={"outline"}
                                className="justify-start w-full"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dayjs(field.value).format(
                                  "dddd, DD MMMM YYYY"
                                )}
                              </Button>
                            </DialogTrigger>
                          </div>
                          <DialogContent className="flex w-auto flex-col p-2 py-4 rounded-md [&>button]:hidden">
                            <DialogHeader>
                              <DialogTitle>Select a date</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col">
                              <Button
                                className="flex justify-between"
                                variant="ghost"
                                onClick={() => {
                                  form.setValue("date", new Date());
                                }}
                              >
                                Today
                                <p className="text-xs text-muted-foreground">
                                  {dayjs().format("ddd")}
                                </p>
                              </Button>
                              <Button
                                className="flex justify-between"
                                variant="ghost"
                                onClick={() => {
                                  form.setValue(
                                    "date",
                                    dayjs().add(1, "day").toDate()
                                  );
                                }}
                              >
                                Tomorrow
                                <p className="text-xs text-muted-foreground">
                                  {dayjs().add(1, "day").format("ddd")}
                                </p>
                              </Button>
                              <Button
                                className="flex justify-between"
                                variant="ghost"
                                onClick={() => {
                                  form.setValue(
                                    "date",
                                    dayjs().add(7, "day").toDate()
                                  );
                                }}
                              >
                                Next Week
                                <p className="text-xs text-muted-foreground">
                                  {dayjs().add(7, "day").format("ddd DD MMM")}
                                </p>
                              </Button>
                            </div>
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                form.setValue("date", date!);
                              }}
                            />
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="default">Save</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    ></FormField>
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="mt-6">
                        <FormLabel className="text-sm ml-2">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="mt-2 text-base text-pretty"
                            rows={6}
                            placeholder="Description"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-between items-center mb-4 px-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="default" type="submit">
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer
      onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
        }
      }}
    >
      <div className="w-full flex items-center px-4 gap-4 max-w-[600px]">
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
        {!isEditing && (
          <>
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
                            onClick={() => {
                              setIsEditing(true);
                            }}
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
                            removeTask(task.id);
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
            <div className="px-6 pb-6">
              <div className="flex justify-between items-stretch px-4">
                <div className="flex flex-col gap-1">
                  <p className="text-neutral-300 font-light ml-2 text-sm">
                    List
                  </p>
                  <div className="px-4 py-2 bg-secondary rounded-md w-auto">
                    {task.list?.name || "No list"}
                  </div>
                </div>
                <Separator className="h-auto" orientation="vertical" />
                <div className="flex flex-col">
                  <p className="text-neutral-300 font-light ml-2 text-sm">
                    {task.completed ? "Completed on" : "Due on"}
                  </p>
                  <div className="px-2 py-2 rounded-md w-auto">
                    {task.completed
                      ? dayjs(task.updatedAt).format("DD MMMM YYYY")
                      : dayjs(task.date).format("DD MMMM YYYY")}
                  </div>
                </div>
              </div>
              {task.description ? (
                <>
                  <Separator className="my-2" />
                  <div>
                    <p className="text-neutral-300 font-light ml-2 text-sm">
                      Description
                    </p>
                    <p className="px-2 py-2 rounded-md w-auto">
                      {task.description}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </>
        )}
        {isEditing && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DrawerHeader className="px-6">
                <DrawerTitle>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.title?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-6 pb-6">
                <div className="flex justify-between items-stretch gap-2">
                  <FormField
                    control={form.control}
                    name="list"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a verified email to display" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lists.map((list) => (
                              <SelectItem key={list.id} value={list.name}>
                                {list.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  ></FormField>
                  <Separator className="h-auto" orientation="vertical" />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant={"outline"} className="justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dayjs(field.value).format("DD MMMM YYYY")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="flex w-auto flex-col p-2 py-4 rounded-md [&>button]:hidden">
                          <DialogHeader>
                            <DialogTitle>Select a date</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col">
                            <Button
                              className="flex justify-between"
                              variant="ghost"
                              onClick={() => {
                                form.setValue("date", new Date());
                              }}
                            >
                              Today
                              <p className="text-xs text-muted-foreground">
                                {dayjs().format("ddd")}
                              </p>
                            </Button>
                            <Button
                              className="flex justify-between"
                              variant="ghost"
                              onClick={() => {
                                form.setValue(
                                  "date",
                                  dayjs().add(1, "day").toDate()
                                );
                              }}
                            >
                              Tomorrow
                              <p className="text-xs text-muted-foreground">
                                {dayjs().add(1, "day").format("ddd")}
                              </p>
                            </Button>
                            <Button
                              className="flex justify-between"
                              variant="ghost"
                              onClick={() => {
                                form.setValue(
                                  "date",
                                  dayjs().add(7, "day").toDate()
                                );
                              }}
                            >
                              Next Week
                              <p className="text-xs text-muted-foreground">
                                {dayjs().add(7, "day").format("ddd DD MMM")}
                              </p>
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              form.setValue("date", date!);
                            }}
                          />
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="default">Save</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  ></FormField>
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className="mt-4"
                          rows={6}
                          placeholder="Description"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-between items-center mb-4 px-6">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button variant="default" type="submit">
                  Save
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export default Home;
