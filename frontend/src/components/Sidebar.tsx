 import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import AccountDropdown from "./sidebar/AccountDropdown";

import Lists from "./sidebar/Lists";
import NewTask from "./NewTask";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function Sidebar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      {isDesktop ? (
        <div className="w-72 px-4 border-r-border border-r-2 mr-2">
          <header className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" className="block w-14" alt="" />
              <div className="flex flex-col items-start">
                <h2 className="text-2xl font-extrabold">BIT-ToDo</h2>
                <p className="text-muted-foreground text-sm font-light">
                  {user?.name} {user?.surname}
                </p>
              </div>
            </div>
            <AccountDropdown />
          </header>
          <div className="flex flex-col gap-4 mt-8 pl-2">
            <h3 className="text-2xl font-bold">Lists</h3>
            <Lists setOpen={setOpen} />
          </div>
        </div>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="flex justify-between md:hidden">
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
                      {user?.name} {user?.surname}
                    </p>
                  </div>
                </div>
                <AccountDropdown />
              </SheetTitle>
              <SheetDescription>Manage your tasks with ease</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8 pl-2">
              <h3 className="text-2xl font-bold">Lists</h3>
              <Lists setOpen={setOpen} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

export default Sidebar;
