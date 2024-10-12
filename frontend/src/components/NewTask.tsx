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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlusIcon, CalendarIcon } from "@radix-ui/react-icons";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().optional(),
  date: z.date().optional(),
  list: z.string().optional(),
});

function NewTask() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      list: "",
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

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start mt-4"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dayjs(field.value).format("dddd, DD MMMM YYYY")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="flex w-auto flex-col space-y-2 p-2"
                    >
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
                      {/* <div className="rounded-md border"> */}
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          form.setValue("date", date);
                        }}
                      />
                      {/* </div> */}
                    </PopoverContent>
                  </Popover>
                )}
              />
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
