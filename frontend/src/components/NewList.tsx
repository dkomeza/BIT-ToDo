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
import { PlusIcon } from "@radix-ui/react-icons";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { useToDoStore } from "@/stores/ToDoStore";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  description: z.string().optional(),
});

function NewList() {
  const { addList } = useToDoStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <Drawer repositionInputs={false}>
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          className="w-full flex gap-2 justify-between items-center p-0 pr-2 border-dashed border-2 border-neutral-600 text-secondary-foreground"
        >
          <div className="flex gap-2 items-center text-base">
            <Button
              variant="ghost"
              size="icon"
              style={{ backgroundColor: "transparent" }}
            >
              <PlusIcon className="" />
            </Button>
            Create new list
          </div>
          <div className="pointer-events-none w-6 h-6 bg-neutral-700 rounded-md text-xs flex items-center justify-center">
            ⌘K
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>New list</DrawerTitle>
            <DrawerDescription>
              Create a new list to organize your tasks
            </DrawerDescription>
          </DrawerHeader>
          <Form {...form}>
            <form className="px-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="The Great Procrastination"
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.name?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel htmlFor={field.name}>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="mt-4"
                        rows={6}
                        {...field}
                        placeholder="The things I'll probably do tomorrow"
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

export default NewList;
