import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import {
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import AccountDropdown from "./sidebar/AccountDropdown";

import Lists from "./sidebar/Lists";
import NewTask from "./NewTask";

function Sidebar() {

  return (
    <Sheet>
      <div className="flex justify-between">
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <HamburgerMenuIcon />
          </Button>
        </SheetTrigger>
        <NewTask />
      </div>

      <SheetContent side={"left"} className="w-4/5">
        <SheetHeader className="mt-6">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" className="block w-14" alt="" />
              <div className="flex flex-col items-start">
                <h2 className="text-2xl font-extrabold">BIT-ToDo</h2>
                <p className="text-muted-foreground text-sm font-light">
                  Dawid Komęza
                </p>
              </div>
            </div>
            <AccountDropdown />
          </SheetTitle>
          <SheetDescription>Manage your tasks with ease</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-8 pl-2">
          <h3 className="text-2xl font-bold">Lists</h3>
          <Lists />
        </div>
      </SheetContent>
    </Sheet>
  );

 
}


export default Sidebar;
