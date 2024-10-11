import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import { HamburgerMenuIcon, PlusIcon } from "@radix-ui/react-icons";

function Dashboard() {
  return (
    <div className="flex flex-col sm:flex-row h-full px-4 py-6">
      <Sheet>
        <div className="flex justify-between">
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <HamburgerMenuIcon />
            </Button>
          </SheetTrigger>

          <Button variant="outline" size="icon">
            <PlusIcon />
          </Button>
        </div>

        <SheetContent side={"left"}>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              {/* <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" /> */}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              {/* <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" /> */}
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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
