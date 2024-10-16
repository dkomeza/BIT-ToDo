import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import { PlusIcon, CalendarIcon } from "@radix-ui/react-icons";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToDoStore } from "@/stores/ToDoStore";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().optional(),
  date: z.date().optional(),
  list: z.string().optional(),
});

function NewTask() {
  const { lists } = useToDoStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      list: "Home",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <Drawer repositionInputs={false}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <PlusIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>New task</DrawerTitle>
            <DrawerDescription>
              Create a new task to add to your list
            </DrawerDescription>
          </DrawerHeader>
          <Form {...form}>
            <form
              className="p-4 pb-0 px-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.title?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <div className="flex mt-4 gap-2">
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
                            form.setValue("date", date);
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
                />
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
                          <SelectItem value="Home">Home</SelectItem>
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
                />
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
              <DrawerFooter className="flex flex-row justify-between">
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button type="submit">Save</Button>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default NewTask;
