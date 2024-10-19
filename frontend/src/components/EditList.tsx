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
import { DotsHorizontalIcon, Pencil2Icon } from "@radix-ui/react-icons";

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
import { List, useToDoStore } from "@/stores/ToDoStore";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  description: z.string().optional(),
});

function EditList({
  children,
  list,
  hideButtons,
}: {
  children: React.ReactNode;
  list: List;
  hideButtons: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { updateList } = useToDoStore();

  useEffect(() => {
    form.reset({
      name: list.name,
      description: list.description,
    });
  }, [list]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: list.name,
      description: list.description,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await updateList(list.id, data);
    setOpen(false);
  }

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Drawer
      repositionInputs={false}
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        hideButtons();
      }}
    >
      {!isDesktop && (
        <DrawerTrigger asChild>
          <div className="h-full w-full flex bg-yellow-500 rounded-sm relative">
            <div className="w-[50px] h-full flex items-center justify-center">
              <DotsHorizontalIcon />
            </div>
            {children}
          </div>
        </DrawerTrigger>
      )}
      {isDesktop && (
        <DrawerTrigger asChild>
          <Button variant="ghost" className="w-full gap-2 justify-start">
            <Pencil2Icon className="w-4 h-4" />
            Edit
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Edit list</DrawerTitle>
            <DrawerDescription>
              Edit the list title and description
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
                      <Input {...field} />
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
                      <Textarea className="mt-4" rows={6} {...field} />
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

export default EditList;
